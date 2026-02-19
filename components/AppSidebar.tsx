import React from "react";

import {
  CalendarDays,
  FileSliders,
  HandCoins,
  List,
  LogOut,
  OctagonAlert,
  PlusCircle,
  UserRoundPen,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";
import LogoutButton from "./logout-button";
import { AppUser } from "@/types/types";
import { UserRole } from "@/lib/enums";
import SidebarUserInfo from "./SidebarUserInfo";

// ─── Voci di menu ────────────────────────────────────────────────────────────

/** Voci visibili agli amministratori. */
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

/** Voci visibili agli utenti standard. */
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

// ─── Componente ───────────────────────────────────────────────────────────────

export default async function AppSidebar({
  user,
}: Readonly<{ user: AppUser }>) {
  const items = user.role_id === UserRole.ADMIN ? itemsAdmin : itemsUser;

  return (
    <Sidebar collapsible="icon">
      {/* ── Header: logo / brand ──────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border/60 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
            >
              <a href="/" className="flex items-center gap-3 px-1 py-2">
                {/* Icona brand */}
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary shrink-0 shadow-sm">
                  <CalendarDays className="size-4 text-primary-foreground" />
                </div>
                {/* Nome */}
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-bold text-foreground truncate">
                    C.S. Dribbling
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
                    Area personale
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Contenuto: voci navigazione ───────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[12px] font-bold text-muted-foreground/60 px-2 mb-1">
            Funzionalità
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="
                      group h-9 rounded-lg px-3 gap-3
                      text-muted-foreground font-medium
                      hover:bg-primary/8 hover:text-foreground
                      data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold
                      transition-colors duration-150
                    "
                  >
                    <a href={item.url}>
                      <item.icon className="size-4 shrink-0 transition-colors duration-150" />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: info utente + logout ──────────────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border/60 pt-2 pb-3 px-3">
        <SidebarMenu className="gap-1">
          {/* Info utente */}
          <SidebarMenuItem>
            <SidebarUserInfo />
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail per il collapse */}
      <SidebarRail />
    </Sidebar>
  );
}
