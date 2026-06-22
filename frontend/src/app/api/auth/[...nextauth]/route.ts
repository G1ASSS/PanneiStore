import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextRequest } from "next/server";

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(
            `${process.env.BACKEND_URL}/api/v1/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );
          const data = await res.json();
          if (!res.ok || !data.success) return null;
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            role: data.data.user.role,
            accessToken: data.data.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(
            `${process.env.BACKEND_URL}/api/v1/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idToken: account.id_token,
                email: user.email,
                name: user.name,
                avatar: user.image,
              }),
            }
          );
          const data = await res.json();
          if (data.success) {
            (user as any).accessToken = data.data.accessToken;
            (user as any).role = data.data.user.role;
            (user as any).id = data.data.user.id;
          }
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).userId = token.id;
        (session as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { auth, signIn, signOut };

export async function GET(req: NextRequest) {
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}
