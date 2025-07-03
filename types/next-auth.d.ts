// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      surname?: string | null;
      email?: string | null;
      nickname?: string | null;
      telephone?: string | null;
      role_id?: number | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    surname?: string | null;
    email?: string | null;
    nickname?: string | null;
    telephone?: string | null;
    role_id?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    surname?: string | null;
    email?: string | null;
    nickname?: string | null;
    telephone?: string | null;
    role_id?: number | null;
  }
}
