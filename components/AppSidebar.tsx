import React from "react";

import {
  CalendarDays,
  FileSliders,
  LogOut,
  OctagonAlert,
  Search,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
  SidebarGroup,
  SidebarRail,
} from "./ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import LogoutButton from "./logout-button";
import { AppUser } from "@/types/types";

const items = [
  {
    title: "Prenotazioni",
    url: "#",
    icon: CalendarDays,
  },
  {
    title: "Prenotazioni in arrivo",
    url: "#",
    icon: OctagonAlert,
  },
  {
    title: "Pagamenti",
    url: "#",
    icon: WalletCards,
  },
  {
    title: "Campi",
    url: "#",
    icon: FileSliders,
  },
  {
    title: "Utenti",
    url: "/dashboard/utenti",
    icon: Users,
  },
];

export default async function AppSidebar({
  user,
}: Readonly<{ user: AppUser }>) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu className="px-2 pt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <span className="text-base font-bold">C.S. Dribbling</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Funzionalità</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild>
              <a href="/dashboard/settings">
                <Settings size={21} />
                <span>Impostazioni</span>
              </a>
            </SidebarMenuButton>

            <LogoutButton />

            <SidebarMenuButton className="mt-2 h-fit" size={"lg"}>
              <div className="flex flex-col">
                <span className="font-semibold">
                  {user.name + " " + user.surname}
                </span>
                <span className="text-gray-500 text-xs">@{user.nickname}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
