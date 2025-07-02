import React from "react";

import {
  Calendar,
  CalendarDays,
  FileSliders,
  Home,
  Inbox,
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
    url: "#",
    icon: Users,
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
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
      <SidebarContent>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"}>
              <div className="flex flex-col">
                <span className="font-semibold">Paolo Laera</span>
                <span className="text-xs">paololaera@gmail.com</span>
              </div>

              <a className="ml-auto" href="/dashboard/settings">
                <Settings size={20} />
              </a>

              <a className="ml-2" href="/logout">
                <LogOut size={20} />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
