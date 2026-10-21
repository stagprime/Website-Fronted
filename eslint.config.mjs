import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [
  { ignores: ["scripts/dev/**", ".next/**", "node_modules/**", "prisma/dev/**", "previews/**", "data/**", "scripts/**/*.py", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { rules: { "@next/next/no-img-element": "off", "@typescript-eslint/no-explicit-any": "error", "react/no-unescaped-entities": "off", "@next/next/no-html-link-for-pages": "off" } },
];
export default config;
