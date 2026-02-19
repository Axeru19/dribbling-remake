"use client";

/**
 * Widget utente nella sidebar: avatar con iniziali, nome, nickname e ruolo.
 * Usa i dati della sessione Next-Auth.
 */

import { AppUser } from "@/types/types";
import { useSession } from "next-auth/react";
import { SidebarMenuButton } from "./ui/sidebar";
import { UserRole } from "@/lib/enums";

/** Genera le iniziali dal nome e cognome. */
function getInitials(name?: string | null, surname?: string | null): string {
  const f = name?.[0]?.toUpperCase() ?? "";
  const l = surname?.[0]?.toUpperCase() ?? "";
  return f + l || "?";
}

export default function SidebarUserInfo() {
  const { data: session } = useSession();
  const user = session?.user as AppUser | undefined;

  const initials = getInitials(user?.name, user?.surname);
  const isAdmin = user?.role_id === UserRole.ADMIN;

  return (
    <SidebarMenuButton
      size="lg"
      className="h-fit hover:bg-muted/60 active:bg-muted rounded-lg py-2 px-2 cursor-default"
    >
      {/* Avatar con iniziali */}
      <div className="flex items-center justify-center size-8 rounded-lg bg-primary/15 text-primary text-xs font-bold shrink-0 select-none">
        {initials}
      </div>

      {/* Info testo */}
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">
          {user?.name} {user?.surname}
        </span>
        <span className="text-[11px] text-muted-foreground truncate">
          @{user?.nickname}
          {" · "}
          <span className={isAdmin ? "text-primary font-medium" : ""}>
            {isAdmin ? "Admin" : "Utente"}
          </span>
        </span>
      </div>
    </SidebarMenuButton>
  );
}
