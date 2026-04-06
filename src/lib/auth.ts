import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "crypto";

const ADMIN_EMAIL = "thetangstr@gmail.com";
const ADMIN_PASSWORD_HASH =
  "3447ae93d09fa7f4f3fb2529d639b982a8e36191a0622e8a268d6c7ed65ff2d6";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        if (email.toLowerCase() !== ADMIN_EMAIL) return null;

        const hash = createHash("sha256").update(password).digest("hex");
        if (hash !== ADMIN_PASSWORD_HASH) return null;

        return { id: "admin-1", email: ADMIN_EMAIL, name: "Admin" };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
