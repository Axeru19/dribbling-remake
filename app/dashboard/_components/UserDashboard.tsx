"use client";

import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import { AppUser } from "@/types/types.d";
import { view_reservations } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Inbox,
  PlusCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WalletData {
  user_id: number;
  wallet_id: number | null;
  balance: number | null;
}

const STATUS_META: Record<number, { label: string; color: string }> = {
  [ReservationStatus.INCOMING]: { label: "In arrivo", color: ReservationStatusColor.INCOMING },
  [ReservationStatus.CONFIRMED]: { label: "Confermata", color: ReservationStatusColor.CONFIRMED },
  [ReservationStatus.REJECTED]: { label: "Rifiutata", color: ReservationStatusColor.REJECTED },
  [ReservationStatus.DELETED]: { label: "Eliminata", color: ReservationStatusColor.DELETED },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

// ─── Last Reservation ─────────────────────────────────────────────────────────

function LastReservationCard({
  reservation,
  loading,
}: {
  reservation: view_reservations | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-5 min-h-[130px] flex flex-col gap-4">
        <div className="h-3 w-28 rounded-md bg-muted animate-pulse" />
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted shrink-0 animate-pulse" />
          <div className="flex-1 flex flex-col gap-2.5 justify-center">
            <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="rounded-2xl border bg-card p-6 min-h-[130px] flex flex-col justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Inbox className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm">Nessuna prenotazione</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Non hai ancora prenotato nessun campo
          </p>
        </div>
      </div>
    );
  }

  const status = (reservation.id_status ?? ReservationStatus.INCOMING) as ReservationStatus;
  const meta = STATUS_META[status] ?? STATUS_META[ReservationStatus.INCOMING];
  const startLabel = new Date(reservation.start_time).toISOString().split("T")[1].substring(0, 5);
  const endLabel = new Date(reservation.end_time).toISOString().split("T")[1].substring(0, 5);

  return (
    <Link
      href={`/dashboard/partite/${reservation.id}`}
      className="group block rounded-2xl border bg-card p-5 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] transition-shadow duration-200 active:scale-[0.99]"
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-4">
        Ultima prenotazione
      </p>
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 select-none"
          style={{ backgroundColor: `${meta.color}18` }}
        >
          <span
            className="text-[9px] font-bold uppercase tracking-widest leading-none"
            style={{ color: meta.color }}
          >
            {format(new Date(reservation.date), "EEE", { locale: it })}
          </span>
          <span
            className="text-3xl font-black leading-tight"
            style={{ color: meta.color }}
          >
            {format(new Date(reservation.date), "d")}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest leading-none"
            style={{ color: meta.color }}
          >
            {format(new Date(reservation.date), "MMM", { locale: it })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base leading-tight">
            {reservation.description ?? "—"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="font-mono">
              {startLabel}–{endLabel}
            </span>
          </div>
          <span
            className="inline-flex mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-muted-foreground/25 mt-0.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ─── Wallet Card ──────────────────────────────────────────────────────────────

function WalletCard({
  wallet,
  loading,
}: {
  wallet: WalletData | null;
  loading: boolean;
}) {
  const balance =
    wallet?.balance != null
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
        }).format(wallet.balance)
      : null;

  return (
    <Link
      href="/dashboard/portafoglio"
      className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between gap-6 min-h-[130px] hover:opacity-90 transition-opacity duration-150 active:scale-[0.98]"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.14 0.025 258) 0%, oklch(0.18 0.02 252) 50%, oklch(0.15 0.03 272) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 90%, oklch(0.48 0.16 155 / 0.12) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-white/10 border border-white/[0.08] flex items-center justify-center">
          <Wallet className="w-3 h-3 text-white/70" />
        </div>
        <span className="text-[10px] font-semibold text-white/40 tracking-[0.12em] uppercase">
          Portafoglio
        </span>
      </div>

      <div className="relative">
        {loading ? (
          <div className="h-7 w-24 rounded-md bg-white/10 animate-pulse" />
        ) : balance ? (
          <p className="font-mono text-2xl font-bold text-white leading-none tracking-tight">
            {balance}
          </p>
        ) : (
          <p className="text-white/35 text-sm">Nessun portafoglio</p>
        )}
        {wallet?.wallet_id && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.12em]">
              Attivo
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Payments Section ─────────────────────────────────────────────────────────

function PaymentsSection() {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 sm:border-b">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Pagamenti</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100/80">
          Prossimamente
        </span>
      </div>
      {/* Empty state hidden on mobile to prevent viewport overflow */}
      <div className="hidden sm:flex flex-col items-center gap-3 py-10 px-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm">Storico pagamenti</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
            Qui vedrai tutti i pagamenti effettuati tramite portafoglio
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserDashboard({ user }: { user: AppUser }) {
  const [reservation, setReservation] = useState<view_reservations | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loadingR, setLoadingR] = useState(true);
  const [loadingW, setLoadingW] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    fetch("/api/reservations/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: Number(user.id) }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<view_reservations[]>;
      })
      .then((data) => setReservation(data[0] ?? null))
      .catch(() => toast.error("Errore nel caricamento della prenotazione"))
      .finally(() => setLoadingR(false));

    fetch(`/api/wallets/${user.id}`)
      .then((r) => (r.ok ? (r.json() as Promise<WalletData>) : null))
      .then(setWallet)
      .catch(() => null)
      .finally(() => setLoadingW(false));
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Greeting */}
      <div>
        <p className="text-xs text-muted-foreground capitalize mb-0.5">
          {format(new Date(), "EEEE d MMMM", { locale: it })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {user.name ?? user.nickname ?? ""}
        </h1>
      </div>

      {/* Bento: last reservation + wallet */}
      <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-4">
        <LastReservationCard reservation={reservation} loading={loadingR} />
        <WalletCard wallet={wallet} loading={loadingW} />
      </div>

      {/* CTA: Prenota */}
      <Link
        href="/dashboard/nuova-prenotazione"
        className="group flex items-center justify-between gap-4 rounded-2xl bg-foreground text-background px-5 py-4 hover:opacity-90 transition-opacity duration-150 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
            <PlusCircle className="w-4 h-4 text-background" />
          </div>
          <div>
            <p className="font-semibold text-sm">Prenota una partita</p>
            <p className="text-xs text-background/50 mt-0.5">Scegli campo, data e orario</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-background/40 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
      </Link>

      {/* Payments */}
      <PaymentsSection />
    </div>
  );
}
