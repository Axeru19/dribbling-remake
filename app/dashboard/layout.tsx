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

export default async function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // prendo la sessione
  const session = await getServerSession(authOptions);
  const user: AppUser | null = session?.user || null;

  if (!user) {
    // se non ho un utente loggato, reindirizzo al login
    redirect("/login");
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />
      <main className="w-full h-full">
        <header className="flex gap-2 p-3 items-center w-full border-b">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-2 font-bold data-[orientation=vertical]:h-6"
          />
          <Pathname />
        </header>

        <div className="p-6 w-full h-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
