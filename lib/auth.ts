// lib/auth.ts

import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // così hai JWT compatibili anche con mobile
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.name ?? null,
          surname: user.surname ?? null,
          email: user.email,
          nickname: user.nickname ?? null,
          telephone: user.telephone ?? null,
          role_id: user.role_id ?? null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login", // redirect automatico se necessario
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.surname = user.surname;
        token.email = user.email;
        token.nickname = user.nickname;
        token.telephone = user.telephone;
        token.role_id = user.role_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.surname = token.surname as string;
        session.user.email = token.email as string;
        session.user.nickname = token.nickname as string;
        session.user.telephone = token.telephone as string;
        session.user.role_id = token.role_id as number;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
