// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      nickname?: string | null;
      telephone?: string | null;
      roleId?: number | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    nickname?: string | null;
    telephone?: string | null;
    roleId?: number | null;
  }

  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    nickname?: string | null;
    telephone?: string | null;
    roleId?: number | null;
  }
}
