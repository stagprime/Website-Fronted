import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
class Coded extends CredentialsSignin { constructor(c: string) { super(c); this.code = c; } }
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { limit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/ip";
declare module "next-auth" { interface Session { user: { id: string; role: string } & DefaultSession["user"] } }
const providers = [
  Credentials({
    credentials: { email: {}, password: {}, otp: {} },
    async authorize(c, req) {
      const email = String(c?.email || "").toLowerCase().trim(), password = String(c?.password || "");
      // Per-account limit is lifted only for local e2e runs (SP_E2E=1, never set on real deployments) so test suites can't lock the admin out.
      // Client IP as seen by our own Nginx (X-Real-IP, or the LAST X-Forwarded-For hop); the first XFF value is client-controlled.
      const ip = clientIp(req?.headers as Headers | undefined);
      if (!limit(`login:${ip}:${email}`, 8, 15 * 60_000) || !limit(`login-ip:${ip}`, 30, 15 * 60_000) || !limit(`login-acct:${email}`, process.env.SP_E2E === "1" ? 1e6 : 20, 60 * 60_000)) throw new Coded("rate");
      if (!email || password.length < 8) return null;
      const u = await db.user.findUnique({ where: { email } });
      if (!u?.passwordHash || !(await bcrypt.compare(password, u.passwordHash))) return null;
      if (!u.emailVerified) throw new Coded("unverified");
      if (u.disabled) throw new Coded("disabled");
      if (u.totpEnabled && u.totpSecret) { const { verifyTotp } = await import("@/lib/totp"); if (!verifyTotp(u.totpSecret, String(c?.otp || ""))) throw new Coded(c?.otp ? "otp-invalid" : "otp"); }
      await db.user.update({ where: { id: u.id }, data: { lastLoginAt: new Date() } }).catch(() => {});
      return { id: u.id, email: u.email, name: u.name, role: u.role } as never;
    },
  }),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google({ allowDangerousEmailAccountLinking: true })] : []),
];
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db), session: { strategy: "jwt", maxAge: 30 * 24 * 3600 }, providers, trustHost: true,
  pages: { signIn: "/en/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials" || !user?.email) return true;
      const u = await db.user.findUnique({ where: { email: user.email.toLowerCase() } }).catch(() => null);
      if (u?.disabled) return false; if (u?.totpEnabled) return "/en/login?error=otp-required"; // 2FA accounts must use password + code
      if (u) await db.user.update({ where: { id: u.id }, data: { lastLoginAt: new Date() } }).catch(() => {});
      return true;
    },
    async jwt({ token, user }) { if (user) { token.uid = (user as { id: string }).id; token.role = (user as { role?: string }).role || "customer"; } else if (token.uid && !token.role) { const u = await db.user.findUnique({ where: { id: String(token.uid) } }); token.role = u?.role || "customer"; } return token; },
    async session({ session, token }) { session.user.id = String(token.uid || token.sub); session.user.role = String(token.role || "customer"); return session; },
  },
});
export const googleEnabled = () => !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
export async function requireRole(...roles: string[]) { const s = await auth(); return s?.user && roles.includes(s.user.role) ? s : null; }
