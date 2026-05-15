"use client";

import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { AppUser } from "@/types/types.d";
import { fields, view_reservations } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_META: Record<number, { label: string; color: string }> = {
  [ReservationStatus.INCOMING]: {
    label: "In arrivo",
    color: ReservationStatusColor.INCOMING,
  },
  [ReservationStatus.CONFIRMED]: {
    label: "Confermata",
    color: ReservationStatusColor.CONFIRMED,
  },
  [ReservationStatus.REJECTED]: {
    label: "Rifiutata",
    color: ReservationStatusColor.REJECTED,
  },
  [ReservationStatus.DELETED]: {
    label: "Eliminata",
    color: ReservationStatusColor.DELETED,
  },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({
  user,
  incomingCount,
  todayCount,
  activeFields,
  totalFields,
  loadingIncoming,
  loadingToday,
  loadingFields,
}: {
  user: AppUser;
  incomingCount: number;
  todayCount: number;
  activeFields: number;
  totalFields: number;
  loadingIncoming: boolean;
  loadingToday: boolean;
  loadingFields: boolean;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden p-6 relative"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.14 0.025 258) 0%, oklch(0.18 0.02 252) 50%, oklch(0.15 0.03 272) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 85% 10%, oklch(0.55 0.14 258 / 0.18) 0%, transparent 55%)",
        }}
      />

      {/* Greeting */}
      <div className="relative">
        <p className="text-[11px] text-white/35 capitalize tracking-wide">
          {format(new Date(), "EEEE d MMMM", { locale: it })}
        </p>
        <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
          {getGreeting()},{" "}
          {user.name ?? user.nickname ?? "Amministratore"}
        </h1>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-3 divide-x divide-white/10 mt-6 pt-5 border-t border-white/10">
        <Link
          href="/dashboard/prenotazioni"
          className="pr-4 hover:opacity-70 transition-opacity"
        >
          {loadingIncoming ? (
            <div className="h-7 w-10 rounded-md bg-white/10 animate-pulse mb-1" />
          ) : (
            <p
              className={cn(
                "text-2xl font-bold tabular-nums leading-none",
                incomingCount > 0 ? "text-amber-400" : "text-white",
              )}
            >
              {incomingCount}
            </p>
          )}
          <p className="text-xs text-white/35 mt-1.5">in attesa</p>
        </Link>

        <Link
          href="/dashboard/partite"
          className="px-4 hover:opacity-70 transition-opacity"
        >
          {loadingToday ? (
            <div className="h-7 w-10 rounded-md bg-white/10 animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold tabular-nums leading-none text-white">
              {todayCount}
            </p>
          )}
          <p className="text-xs text-white/35 mt-1.5">oggi</p>
        </Link>

        <Link
          href="/dashboard/campi"
          className="pl-4 hover:opacity-70 transition-opacity"
        >
          {loadingFields ? (
            <div className="h-7 w-14 rounded-md bg-white/10 animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold tabular-nums leading-none">
              <span className="text-emerald-400">{activeFields}</span>
              <span className="text-base font-medium text-white/25">
                /{totalFields}
              </span>
            </p>
          )}
          <p className="text-xs text-white/35 mt-1.5">campi attivi</p>
        </Link>
      </div>
    </div>
  );
}

// ─── Today's Reservations ─────────────────────────────────────────────────────

function TodayReservations({
  reservations,
  loading,
}: {
  reservations: view_reservations[];
  loading: boolean;
}) {
  const sorted = [...reservations].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  );

  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
        <div>
          <p className="font-semibold text-sm">Prenotazioni oggi</p>
          <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
            {format(new Date(), "EEEE d MMMM", { locale: it })}
          </p>
        </div>
        <Link
          href="/dashboard/partite"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Calendario
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-3 flex flex-col gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-4 py-3 animate-pulse"
            >
              <div className="w-11 h-8 rounded-lg bg-muted shrink-0" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded-md bg-muted" />
                <div className="h-3 w-20 rounded-md bg-muted" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center flex-1">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Nessuna prenotazione oggi</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giornata libera
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 flex flex-col gap-1.5">
          {sorted.map((r) => {
            const endMins =
              new Date(r.end_time).getUTCHours() * 60 +
              new Date(r.end_time).getUTCMinutes();
            const isPast = nowMins > endMins;

            const startLabel = new Date(r.start_time)
              .toISOString()
              .split("T")[1]
              .substring(0, 5);
            const endLabel = new Date(r.end_time)
              .toISOString()
              .split("T")[1]
              .substring(0, 5);
            const meta =
              STATUS_META[
                (r.id_status ?? ReservationStatus.INCOMING) as number
              ] ?? STATUS_META[ReservationStatus.INCOMING];

            return (
              <Link
                key={r.id}
                href={`/dashboard/partite/${r.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors group",
                  isPast
                    ? "opacity-40 hover:opacity-65 hover:bg-muted/30"
                    : "hover:bg-muted/50",
                )}
              >
                {/* Time column */}
                <div className="w-11 shrink-0 text-right">
                  <p className="font-mono text-[13px] font-bold leading-none tabular-nums text-foreground">
                    {startLabel}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground leading-none mt-0.5 tabular-nums">
                    {endLabel}
                  </p>
                </div>

                {/* Status dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: `${meta.color}90` }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {r.surname
                      ? r.name + " " + r.surname
                      : r.user_not_registered}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.description ?? "—"}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${meta.color}18`,
                    color: meta.color,
                  }}
                >
                  {meta.label}
                </span>
              </Link>
            );
          })}
          {sorted.length > 6 && (
            <Link
              href="/dashboard/partite"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-colors mt-0.5"
            >
              Tutte le {sorted.length}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Fields Overview ──────────────────────────────────────────────────────────

function FieldsOverview({
  fieldList,
  loading,
}: {
  fieldList: fields[];
  loading: boolean;
}) {
  const sorted = [...fieldList].sort((a, b) => a.id - b.id);
  const activeCount = fieldList.filter((f) => Boolean(f.status)).length;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
        <div>
          <p className="font-semibold text-sm">Campi</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {loading ? "..." : `${activeCount} di ${fieldList.length} attivi`}
          </p>
        </div>
        <Link
          href="/dashboard/campi"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Gestisci
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-4 flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[60px] rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center flex-1">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nessun campo configurato
          </p>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-2">
          {sorted.map((field) => {
            const isActive = Boolean(field.status);
            return (
              <Link
                key={field.id}
                href="/dashboard/campi"
                className={cn(
                  "rounded-xl border px-4 py-3.5 transition-colors flex items-center gap-3",
                  isActive
                    ? "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30"
                    : "border-border bg-muted/20 opacity-50 hover:opacity-70",
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isActive
                      ? "bg-emerald-500"
                      : "bg-zinc-400 dark:bg-zinc-600",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {field.description ?? `Campo ${field.id}`}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {isActive ? "Attivo" : "Non disponibile"}
                  </p>
                </div>
                {isActive && field.price_per_hour != null && (
                  <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                    €{field.price_per_hour.toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /h
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ user }: { user: AppUser }) {
  const [incoming, setIncoming] = useState<view_reservations[]>([]);
  const [fieldList, setFieldList] = useState<fields[]>([]);
  const [todayReservations, setTodayReservations] = useState<
    view_reservations[]
  >([]);
  const [loadingIncoming, setLoadingIncoming] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);
  const [loadingToday, setLoadingToday] = useState(true);

  useEffect(() => {
    fetch("/api/reservations/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_status: ReservationStatus.INCOMING }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<view_reservations[]>;
      })
      .then(setIncoming)
      .catch(() => toast.error("Errore caricamento prenotazioni in arrivo"))
      .finally(() => setLoadingIncoming(false));

    fetch("/api/fields/list")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<fields[]>;
      })
      .then(setFieldList)
      .catch(() => toast.error("Errore caricamento campi"))
      .finally(() => setLoadingFields(false));

    fetch("/api/reservations/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date() }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<view_reservations[]>;
      })
      .then(setTodayReservations)
      .catch(() => toast.error("Errore caricamento prenotazioni oggi"))
      .finally(() => setLoadingToday(false));
  }, []);

  const activeFields = fieldList.filter((f) => Boolean(f.status)).length;

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Hero: greeting + stats */}
      <HeroCard
        user={user}
        incomingCount={incoming.length}
        todayCount={todayReservations.length}
        activeFields={activeFields}
        totalFields={fieldList.length}
        loadingIncoming={loadingIncoming}
        loadingToday={loadingToday}
        loadingFields={loadingFields}
      />

      {/* Incoming alert */}
      {!loadingIncoming && incoming.length > 0 && (
        <Link
          href="/dashboard/prenotazioni"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-3.5 hover:bg-amber-100/70 dark:hover:bg-amber-950/30 transition-colors"
        >
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="flex-1 text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{incoming.length}</span>{" "}
            prenotazion
            {incoming.length === 1 ? "e richiede" : "i richiedono"} approvazione
          </span>
          <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
        </Link>
      )}

      {/* Main content: 2-col on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        <TodayReservations
          reservations={todayReservations}
          loading={loadingToday}
        />
        <FieldsOverview fieldList={fieldList} loading={loadingFields} />
      </div>
    </div>
  );
}
