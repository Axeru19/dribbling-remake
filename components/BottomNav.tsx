"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppUser } from "@/types/types";
import { UserRole } from "@/lib/enums";
import {
  CalendarDays,
  OctagonAlert,
  HandCoins,
  FileSliders,
  Home,
  Users,
  PlusCircle,
  CalendarCheck,
  WalletCards,
} from "lucide-react";

const PROFILE_URL = "/dashboard/profilo";

const itemsAdmin = [
  { title: "Home", url: "/dashboard", icon: Home, exact: true },
  { title: "Partite", url: "/dashboard/partite", icon: CalendarDays, exact: false },
  { title: "Prenotazioni", url: "/dashboard/prenotazioni", icon: OctagonAlert, exact: false },
  { title: "Pagamenti", url: "/dashboard/pagamenti", icon: HandCoins, exact: false },
  { title: "Campi", url: "/dashboard/campi", icon: FileSliders, exact: false },
  { title: "Utenti", url: "/dashboard/utenti", icon: Users, exact: false },
  { title: "Profilo", url: PROFILE_URL, icon: null, exact: false },
];

const itemsUser = [
  { title: "Home", url: "/dashboard", icon: Home, exact: true },
  { title: "Prenota", url: "/dashboard/nuova-prenotazione", icon: PlusCircle, exact: false },
  { title: "Agenda", url: "/dashboard/le-mie-prenotazioni", icon: CalendarCheck, exact: false },
  { title: "Portafoglio", url: "/dashboard/portafoglio", icon: WalletCards, exact: false },
  { title: "Profilo", url: PROFILE_URL, icon: null, exact: false },
];

function getInitials(name?: string | null, surname?: string | null): string {
  return (name?.[0]?.toUpperCase() ?? "") + (surname?.[0]?.toUpperCase() ?? "") || "?";
}

export default function BottomNav({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const items = user.role_id === UserRole.ADMIN ? itemsAdmin : itemsUser;
  const initials = getInitials(user.name, user.surname);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <nav className="pointer-events-auto flex items-center gap-0.5 bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl px-1.5 py-1.5 shadow-xl shadow-black/[0.12] w-full sm:w-auto">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(item.url + "/");
          const isProfile = item.url === PROFILE_URL;
          const Icon = item.icon;

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-1 sm:flex-none flex-col items-center gap-1 px-2.5 py-2 rounded-xl transition-all duration-200 min-w-[44px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95"
              )}
            >
              {isProfile ? (
                <div
                  className={cn(
                    "size-5 flex items-center justify-center rounded-full text-[8px] font-bold leading-none shrink-0 transition-all duration-200",
                    isActive
                      ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                      : "bg-muted-foreground/15 text-muted-foreground"
                  )}
                >
                  {initials}
                </div>
              ) : Icon ? (
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-all duration-200",
                    isActive ? "stroke-[2.25]" : "stroke-[1.75]"
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "text-[10px] leading-none transition-all duration-200",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
