import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cookies, headers } from "next/headers";
import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppUser } from "@/types/types";
import { authOptions } from "@/lib/auth";
import Pathname from "@/components/pathname";
import { Metadata } from "next";
import { fields } from "@prisma/client";
import { FieldsProvider } from "@/context/FieldsContex";
import { SessionProvider } from "next-auth/react";
import { SessionProviderWrapper } from "@/context/SessoionContex";

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
  const cookieStore = await cookies();
  const host = process.env.NEXTAUTH_URL;
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // prendo la sessione
  const session = await getServerSession(authOptions);
  const user: AppUser | null = session?.user || null;

  if (!user) {
    // se non ho un utente loggato, reindirizzo al login
    redirect("/login");
  }

  // get all the sport fields
  const fields: fields[] = await fetch(host + "/api/fields/list", {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <SessionProviderWrapper>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar user={user} />
        <main className="w-full h-dvh">
          <header className="flex h-1/16 gap-2 p-3 items-center w-full border-b">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mx-2 font-bold data-[orientation=vertical]:h-6"
            />
            <Pathname />
          </header>

          <div className="p-6 w-full h-15/16">
            <FieldsProvider value={fields}>{children}</FieldsProvider>
          </div>
        </main>
      </SidebarProvider>
    </SessionProviderWrapper>
  );
}
