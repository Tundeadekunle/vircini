// import NextAuth from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import EmailProvider from 'next-auth/providers/email'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from './prisma'

// export const authOptions = {
//   adapter: PrismaAdapter(prisma as any),
//   providers: [
//     GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
//     EmailProvider({
//       server: {
//         host: process.env.SMTP_SERVER_HOST,
//         port: Number(process.env.SMTP_SERVER_PORT || 587),
//         auth: { user: process.env.SMTP_SERVER_USER, pass: process.env.SMTP_SERVER_PASSWORD }
//       },
//       from: process.env.EMAIL_FROM
//     })
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: { strategy: 'jwt' },
//   callbacks: {
//     async session({ session, user }) {
//       if (user) {
//         // attach role to session
//         // PrismaAdapter stores user id on user.id
//         const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
//         ;(session as any).user.role = dbUser?.role
//       }
//       return session
//     }
//   }
// }

// export default NextAuth(authOptions as any)





import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      username?: string | null;
      plan: "FREE" | "PREMIUM" | "VIP";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: "FREE" | "PREMIUM" | "VIP";
  }
}

// export const authOptions = {
//   adapter: PrismaAdapter(prisma as any),
//   providers: [
//     GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
//     EmailProvider({
//       server: {
//         host: process.env.SMTP_SERVER_HOST,
//         port: Number(process.env.SMTP_SERVER_PORT || 587),
//         auth: { user: process.env.SMTP_SERVER_USER, pass: process.env.SMTP_SERVER_PASSWORD }
//       },
//       from: process.env.EMAIL_FROM
//     })
//   ],
//   session: { strategy: 'jwt' },
// }
//   callbacks: {
//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         (session.user as any).id = token.sub;
//         (session.user as any).plan = (token as any).plan ?? "FREE";
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         const u = await db.user.findUnique({ where: { id: user.id } });
//         token.plan = (u?.plan ?? "FREE") as any;
//       } else if (token.sub) {
//         const u = await db.user.findUnique({ where: { id: token.sub } });
//         token.plan = (u?.plan ?? "FREE") as any;
//       }
//       return token as JWT;
//     },
//   },



// src/lib/auth.ts


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
};


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ...Credentials if you want
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // on sign-in, user is defined; afterwards we only have token
      if (user) {
        const u = await db.user.findUnique({ where: { id: user.id } });
        token.plan = (u?.plan ?? "FREE") as any;
      } else if (token.sub) {
        // keep plan fresh
        const u = await db.user.findUnique({ where: { id: token.sub } });
        token.plan = (u?.plan ?? "FREE") as any;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).plan = (token as any).plan ?? "FREE";
      }
      return session;
    },
  },
  events: {
    // ensure usernames are generated for OAuth users & default plan FREE
    async createUser({ user }) {
      const base = (user.name?.replace(/\s+/g, "").toLowerCase() || user.email?.split("@")[0] || "user")!;
      let candidate = base;
      let n = 1;
      while (await db.user.findUnique({ where: { username: candidate } })) {
        candidate = `${base}${n++}`;
      }
      await db.user.update({
        where: { id: user.id },
        data: { username: candidate, plan: "FREE" },
      });
    },
  },
});
