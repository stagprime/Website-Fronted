import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { limit } from "@/lib/ratelimit";
declare module "next-auth" { interface Session { user: { id: string; role: string } & DefaultSession["user"] } }
const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(c, req) {
      const email = String(c?.email || "").toLowerCase().trim(), password = String(c?.password || "");
      const ip = (req?.headers?.get?.("x-forwarded-for") || "local").split(",")[0];
      if (!limit(`login:${ip}:${email}`, 8, 15 * 60_000)) throw new Error("rate");
      if (!email || password.length < 8) return null;
      const u = await db.user.findUnique({ where: { email } });
      if (!u?.passwordHash || !(await bcrypt.compare(password, u.passwordHash))) return null;
      if (!u.emailVerified) throw new Error("unverified");
      return { id: u.id, email: u.email, name: u.name, role: u.role } as never;
    },
  }),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google({ allowDangerousEmailAccountLinking: true })] : []),
];
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db), session: { strategy: "jwt", maxAge: 30 * 24 * 3600 }, providers, trustHost: true,
  pages: { signIn: "/en/login" },
  callbacks: {
    async jwt({ token, user }) { if (user) { token.uid = (user as { id: string }).id; token.role = (user as { role?: string }).role || "customer"; } else if (token.uid && !token.role) { const u = await db.user.findUnique({ where: { id: String(token.uid) } }); token.role = u?.role || "customer"; } return token; },
    async session({ session, token }) { session.user.id = String(token.uid || token.sub); session.user.role = String(token.role || "customer"); return session; },
  },
});
export const googleEnabled = () => !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
export async function requireRole(...roles: string[]) { const s = await auth(); return s?.user && roles.includes(s.user.role) ? s : null; }
