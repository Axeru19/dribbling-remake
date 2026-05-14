import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppUser } from "@/types/types";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { fields } from "@prisma/client";
import { FieldsProvider } from "@/context/FieldsContex";
import { SessionProviderWrapper } from "@/context/SessoionContex";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: {
    template: "%s | Dribbling",
    default: "Dribbling | Dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Dashboard",
    description: "Area riservata per la gestione dell'applicazione",
    type: "website",
  },
};

export default async function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const host = process.env.NEXTAUTH_URL;

  const session = await getServerSession(authOptions);
  const user: AppUser | null = session?.user || null;

  if (!user) {
    redirect("/login");
  }

  const fields: fields[] = await fetch(host + "/api/fields/list", {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <SessionProviderWrapper>
      <main
        className="flex flex-col w-full h-dvh overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex-1 overflow-auto p-6 pb-24 w-full">
          <FieldsProvider value={fields}>{children}</FieldsProvider>
        </div>

        <BottomNav user={user} />
      </main>
    </SessionProviderWrapper>
  );
}
