/**
 * UserCard
 *
 * Card premium per un singolo utente nella lista admin.
 * Mostra avatar colorato con iniziali, saldo, email e telefono.
 * Al click apre il dialog di modifica dell'utente.
 */

import { users_wallets } from "@prisma/client";
import { Mail, Smartphone, UserPen, Wallet } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Genera un hue HSL deterministico a partire da una stringa (nome + cognome) */
function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/** Restituisce le iniziali dell'utente (al massimo 2 caratteri) */
function getInitials(name?: string | null, surname?: string | null): string {
  const first = name?.[0]?.toUpperCase() ?? "";
  const last = surname?.[0]?.toUpperCase() ?? "";
  return first + last || "?";
}

/** Formatta un importo come valuta EUR italiana */
const formatEUR = (amount: number | null | undefined): string =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    amount ?? 0,
  );

// ─── Props ─────────────────────────────────────────────────────────────────

interface UserCardProps {
  user: users_wallets;
  onEdit: (user: users_wallets) => void;
}

// ─── Componente ────────────────────────────────────────────────────────────

export default function UserCard({ user, onEdit }: UserCardProps) {
  const initials = getInitials(user.name, user.surname);
  const hue = stringToHue(`${user.name ?? ""}${user.surname ?? ""}`);

  /** Colori avatar derivati dal nome (palette pastello accessibile) */
  const avatarBg = `hsl(${hue}, 55%, 92%)`;
  const avatarFg = `hsl(${hue}, 50%, 32%)`;

  const isPositiveBalance = (user.balance ?? 0) >= 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(user)}
      onKeyDown={(e) => e.key === "Enter" && onEdit(user)}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5",
        "cursor-pointer select-none",
        "transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      {/* ── Header: avatar + info + balance chip ──────────────────────── */}
      <div className="flex items-start gap-4">
        {/* Avatar con iniziali e colore deterministico */}
        <div
          className="flex items-center justify-center size-12 rounded-full text-base font-bold shrink-0 ring-2 ring-background shadow-sm"
          style={{ backgroundColor: avatarBg, color: avatarFg }}
        >
          {initials}
        </div>

        {/* Nome, cognome, nickname */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {user.name} {user.surname}
          </p>
          {user.nickname && (
            <p className="text-xs text-muted-foreground truncate">
              @{user.nickname}
            </p>
          )}
        </div>

        {/* Pulsante modifica — visibile sempre, più evidente su hover */}
        <button
          aria-label="Modifica utente"
          className={cn(
            "flex items-center justify-center size-8 rounded-lg",
            "text-muted-foreground bg-muted",
            "transition-colors group-hover:bg-primary/10 group-hover:text-primary",
          )}
        >
          <UserPen className="size-4" />
        </button>
      </div>

      {/* ── Chip saldo ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            isPositiveBalance
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
          )}
        >
          <Wallet className="size-3" />
          {formatEUR(user.balance)}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* ── Contatti: email + telefono ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2">
        <span className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <Mail className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="truncate">{user.email ?? "—"}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Smartphone className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span>{user.telephone ?? "—"}</span>
        </span>
      </div>
    </div>
  );
}
