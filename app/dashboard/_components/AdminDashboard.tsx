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
  Clock,
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

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
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
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
            >
              <div className="w-8 h-8 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded-md bg-muted" />
                <div className="h-3 w-40 rounded-md bg-muted" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Nessuna prenotazione oggi</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Niente in programma per oggi
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y">
          {sorted.slice(0, 3).map((r) => {
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
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${meta.color}18` }}
                >
                  <Clock className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {r.surname
                      ? r.name + " " + r.surname
                      : r.user_not_registered}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.description ?? "—"} ·{" "}
                    <span className="font-mono">
                      {startLabel}–{endLabel}
                    </span>
                  </p>
                </div>
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
          {sorted.length > 3 && (
            <Link
              href="/dashboard/partite"
              className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              Vedi tutte le {sorted.length} prenotazioni
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
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
          Campi
        </p>
        <Link
          href="/dashboard/campi"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Gestisci
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile: compact pills */}
      <div className="sm:hidden p-4 flex flex-wrap gap-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 rounded-full bg-muted animate-pulse"
            />
          ))
        ) : fieldList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessun campo configurato
          </p>
        ) : (
          [...fieldList]
            .sort((a, b) => a.id - b.id)
            .map((field) => {
              const isActive = Boolean(field.status);
              return (
                <span
                  key={field.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "border-border bg-muted/30 text-muted-foreground opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isActive
                        ? "bg-emerald-500"
                        : "bg-zinc-300 dark:bg-zinc-600",
                    )}
                  />
                  {field.description ?? `Campo ${field.id}`}
                </span>
              );
            })
        )}
      </div>

      {/* Desktop: full card grid */}
      <div className="hidden sm:block">
        {loading ? (
          <div className="p-4 grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : fieldList.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              Nessun campo configurato
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-2.5">
            {[...fieldList]
              .sort((a, b) => a.id - b.id)
              .map((field) => {
                const isActive = Boolean(field.status);
                return (
                  <div
                    key={field.id}
                    className={cn(
                      "rounded-xl border px-4 py-3 transition-colors duration-150",
                      isActive
                        ? "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-border bg-muted/20 opacity-50",
                    )}
                  >
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
                      {isActive
                        ? `Attivo${field.price_per_hour != null ? ` · €${field.price_per_hour.toFixed(0)}/h` : ""}`
                        : "Non disponibile"}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>
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

  const today = format(new Date(), "EEEE d MMMM", { locale: it });
  const activeFields = fieldList.filter((f) => Boolean(f.status)).length;

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Greeting + inline stats */}
      <div>
        <p className="text-xs text-muted-foreground capitalize mb-0.5">
          {today}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {user.name ?? user.nickname ?? "Amministratore"}
        </h1>

        {/* Inline stats — contextual text, not hero cards */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-sm">
          <Link
            href="/dashboard/prenotazioni"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {loadingIncoming ? (
              <span className="inline-block h-3.5 w-3 rounded bg-muted animate-pulse" />
            ) : (
              <span
                className={cn(
                  "font-mono font-semibold tabular-nums",
                  incoming.length > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground",
                )}
              >
                {incoming.length}
              </span>
            )}
            <span>in attesa</span>
          </Link>

          <span className="text-border select-none" aria-hidden>
            ·
          </span>

          <Link
            href="/dashboard/partite"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {loadingToday ? (
              <span className="inline-block h-3.5 w-3 rounded bg-muted animate-pulse" />
            ) : (
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {todayReservations.length}
              </span>
            )}
            <span>oggi</span>
          </Link>

          <span className="text-border select-none" aria-hidden>
            ·
          </span>

          <Link
            href="/dashboard/campi"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {loadingFields ? (
              <span className="inline-block h-3.5 w-3 rounded bg-muted animate-pulse" />
            ) : (
              <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {activeFields}/{fieldList.length}
              </span>
            )}
            <span>campi attivi</span>
          </Link>
        </div>
      </div>

      {/* Incoming alert — only visible when action is required */}
      {!loadingIncoming && incoming.length > 0 && (
        <Link
          href="/dashboard/prenotazioni"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 px-4 py-3.5 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 transition-colors"
        >
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="flex-1 text-sm">
            <span className="font-semibold">{incoming.length}</span> prenotazion
            {incoming.length === 1 ? "e richiede" : "i richiedono"} approvazione
          </span>
          <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
        </Link>
      )}

      {/* Today's reservations */}
      <TodayReservations
        reservations={todayReservations}
        loading={loadingToday}
      />

      {/* Fields overview */}
      <FieldsOverview fieldList={fieldList} loading={loadingFields} />
    </div>
  );
}
