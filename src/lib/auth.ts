import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const ADMIN_EMAIL = "thetangstr@gmail.com";
const ADMIN_PASSWORD_HASH =
  "3447ae93d09fa7f4f3fb2529d639b982a8e36191a0622e8a268d6c7ed65ff2d6";
const ADMIN_DOMAIN = "verzran.com";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

        // Admin user (hardcoded)
        if (email.toLowerCase() === ADMIN_EMAIL) {
          const hash = await sha256Hex(password);
          if (hash !== ADMIN_PASSWORD_HASH) return null;
          return { id: "admin-1", email: ADMIN_EMAIL, name: "Admin", role: "admin" };
        }

        // Verzran domain — any @verzran.com email gets admin access with the shared password
        if (email.toLowerCase().endsWith(`@${ADMIN_DOMAIN}`)) {
          const hash = await sha256Hex(password);
          if (hash !== ADMIN_PASSWORD_HASH) return null;
          return { id: `admin-${email}`, email: email.toLowerCase(), name: email.split("@")[0], role: "admin" };
        }

        // Customer users — check DB (for invite-based registration)
        // For now, any non-admin email with password "assess" can log in as customer
        // TODO: Replace with proper DB lookup after invite system is wired
        if (password === "assess") {
          return { id: `customer-${email}`, email, name: email.split("@")[0], role: "customer" };
        }

        return null;
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
        token.role = (user as { role?: string }).role ?? "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
