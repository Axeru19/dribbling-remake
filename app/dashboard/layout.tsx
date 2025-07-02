import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";
import React from "react";
import { redirect } from "next/navigation";

export default async function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="w-full h-full">
        <header className="flex gap-2 p-3 items-center w-full border-b">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-2 font-bold data-[orientation=vertical]:h-6"
          />
          <span className="font-semibold">Dashboard Amministatore</span>
        </header>

        <div className="p-3 w-full h-full overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
