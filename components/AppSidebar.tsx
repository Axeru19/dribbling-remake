import React from "react";

import {
  CalendarDays,
  FileSliders,
  HandCoins,
  LogOut,
  OctagonAlert,
  Search,
  Settings,
  Users,
  WalletCards,
  PlusCircle,
  List,
  UserRoundPen,
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
import { UserRole } from "@/lib/enums";
import SidebarUserInfo from "./SidebarUserInfo";

const itemsAdmin = [
  {
    title: "Partite",
    url: "/dashboard/partite",
    icon: CalendarDays,
  },
  {
    title: "Prenotazioni in arrivo",
    url: "/dashboard/prenotazioni",
    icon: OctagonAlert,
  },
  {
    title: "Pagamenti",
    url: "/dashboard/pagamenti",
    icon: HandCoins,
  },
  {
    title: "Campi",
    url: "/dashboard/campi",
    icon: FileSliders,
  },
  {
    title: "Utenti",
    url: "/dashboard/utenti",
    icon: Users,
  },
];

const itemsUser = [
  {
    title: "Nuova prenotazione",
    url: "/dashboard/nuova-prenotazione",
    icon: PlusCircle,
  },
  {
    title: "Le mie prenotazioni",
    url: "/dashboard/le-mie-prenotazioni",
    icon: List,
  },
  {
    title: "Portafoglio",
    url: "/dashboard/portafoglio",
    icon: WalletCards,
  },
  {
    title: "Profilo",
    url: "/dashboard/profilo",
    icon: UserRoundPen,
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
              {user.role_id == UserRole.ADMIN &&
                itemsAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              {user.role_id == UserRole.USER &&
                itemsUser.map((item) => (
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
            <LogoutButton />

            <SidebarUserInfo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
