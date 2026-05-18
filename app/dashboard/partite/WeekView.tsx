"use client";

/**
 * WeekView — Calendario settimanale prenotazioni (Lun–Dom).
 *
 * Layout:
 *  [colonna orari] | [Lun: campo1 campo2 …] | [Mar: …] | … | [Dom: …]
 *
 * Performance:
 *  - Una singola fetch per tutta la settimana (range startDate/endDate)
 *  - I dati vengono poi partizionati lato client per giorno + campo
 *
 * Sticky scroll:
 *  - Un unico elemento `overflow-auto` esterno gestisce X e Y
 *  - Gli header (giorni + nomi campi) sono `sticky top-0` e restano visibili
 */

import React, { useEffect, useMemo, useState } from "react";
import { addDays, format, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { fields, view_reservations } from "@prisma/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useFields } from "@/context/FieldsContex";
import { ReservationStatus } from "@/lib/enums";
import { Timeslots } from "@/lib/constants";
import { ReservationPostRequest } from "@/types/types";

// ─── Costanti di layout ───────────────────────────────────────────────────────

/** Altezza in px di ogni fascia oraria (1 ora) — deve corrispondere a DayView. */
const HOUR_HEIGHT = 80;

/** Ora UTC di inizio del calendario. */
const CALENDAR_START_HOUR = 8;

/** Larghezza della colonna orari (px). */
const TIME_COL_WIDTH = 44;

/** Larghezza minima di ogni colonna-campo all'interno di un gruppo giorno. */
const MIN_FIELD_COL_WIDTH = 80; // px — garantisce leggibilità su mobile

/** Numero di giorni nella settimana. */
const DAYS_IN_WEEK = 7;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converte un datetime ISO in minuti dall'inizio del calendario (UTC).
 * Gestisce il wrap notturno (slot oltre mezzanotte).
 */
function minutesFromCalendarStart(dt: Date | string): number {
  const d = new Date(dt);
  const totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const startMinutes = CALENDAR_START_HOUR * 60;
  return totalMinutes >= startMinutes
    ? totalMinutes - startMinutes
    : 24 * 60 - startMinutes + totalMinutes;
}

/** Calcola la durata in minuti di una prenotazione (fallback 60 min). */
function durationMinutes(r: view_reservations): number {
  const start = minutesFromCalendarStart(r.start_time);
  const end = minutesFromCalendarStart(r.end_time);
  return end > start ? end - start : 60;
}

/** Converte minuti in pixel verticali in base a HOUR_HEIGHT. */
function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

/** Formatta un ISO datetime → "HH:MM" (UTC). */
function formatTime(dt: Date | string): string {
  return new Date(dt).toISOString().split("T")[1].substring(0, 5);
}

/**
 * Controlla se una prenotazione appartiene a un dato giorno locale.
 * Il campo `date` della prenotazione è una data UTC-midnight (es. 2025-03-10T00:00:00Z).
 */
function isSameUTCDay(reservation: view_reservations, day: Date): boolean {
  const resDate = new Date(reservation.date);
  return (
    resDate.getUTCFullYear() === day.getUTCFullYear() &&
    resDate.getUTCMonth() === day.getUTCMonth() &&
    resDate.getUTCDate() === day.getUTCDate()
  );
}

// ─── EventBlock ───────────────────────────────────────────────────────────────

interface EventBlockProps {
  reservation: view_reservations;
}

/**
 * Blocco evento posizionato in pixel-perfect nella colonna del campo.
 * Identico a quello in DayView (stessa logica di layout).
 */
function EventBlock({ reservation }: EventBlockProps) {
  const startMin = minutesFromCalendarStart(reservation.start_time);
  const durMin = durationMinutes(reservation);
  const topPx = minutesToPx(startMin);
  const heightPx = Math.max(minutesToPx(durMin), 24);

  const displayName = reservation.surname?.trim()
    ? reservation.surname
    : (reservation.user_not_registered ?? "—");

  const startLabel = formatTime(reservation.start_time);
  const endLabel = formatTime(reservation.end_time);
  const isFixed = reservation.id_reservation_fixed != null;

  return (
    <Link
      href={`/dashboard/partite/${reservation.id}`}
      className="absolute left-0.5 right-0.5 group z-10"
      style={{ top: topPx, height: heightPx }}
      title={`${displayName} — ${startLabel}→${endLabel}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`w-full h-full rounded-md border-l-[3px] transition-colors duration-150 overflow-hidden px-1.5 py-1 flex flex-col justify-start shadow-sm ${
          isFixed
            ? "border-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
            : "border-primary bg-primary/10 hover:bg-primary/20"
        }`}
      >
        <span
          className={`text-[11px] font-semibold leading-tight truncate transition-colors ${
            isFixed
              ? "text-foreground group-hover:text-amber-600"
              : "text-foreground group-hover:text-primary"
          }`}
        >
          {displayName}
        </span>
        {heightPx >= 36 && (
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
            {startLabel} – {endLabel}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── FieldColumn ─────────────────────────────────────────────────────────────

interface FieldColumnProps {
  fieldReservations: view_reservations[];
  totalHeight: number;
  onSlotClick: (start: string, end: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function FieldColumn({ fieldReservations, totalHeight, onSlotClick, className = "", style }: FieldColumnProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ height: totalHeight, ...style }}
    >
      {/* Per-slot hover zones — CSS-only hover, immune to JS event propagation */}
      {Timeslots.map((start, idx) => {
        const [h] = start.split(":").map(Number);
        const end = `${String((h + 1) % 24).padStart(2, "0")}:00`;
        return (
          <div
            key={start}
            className="absolute left-0 right-0 z-[5] group/slot cursor-pointer"
            style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            onClick={() => onSlotClick(start, end)}
          >
            <div className="absolute inset-[2px] rounded border border-transparent flex items-center justify-center opacity-0 group-hover/slot:opacity-100 group-hover/slot:bg-muted/50 group-hover/slot:border-border/40 group-hover/slot:border-dashed group-active/slot:opacity-100 group-active/slot:bg-primary/15 group-active/slot:border-primary/25 transition-all duration-75 pointer-events-none">
              <div className="flex items-center gap-1 text-muted-foreground/50 group-active/slot:text-primary/70">
                <Plus className="size-3" />
                <span className="text-[10px] font-semibold tracking-wide">Nuova</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Event blocks render above slot zones (z-10 > z-[5]) */}
      {fieldReservations.map((reservation) => (
        <EventBlock key={reservation.id} reservation={reservation} />
      ))}
    </div>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

interface WeekViewProps {
  /** Lunedì della settimana da visualizzare (UTC midnight). */
  weekStart: Date;
}

/**
 * Vista settimanale del calendario prenotazioni.
 *
 * Struttura del layout (semplificata):
 * ```
 * [sticky header]
 *   [TIME_COL] [Lun header | campo1 campo2] [Mar header | campo1 campo2] …
 * [body]
 *   [TIME_COL] [Lun body: campo1 campo2]    [Mar body:  campo1 campo2]   …
 * ```
 *
 * Per mantenere sticky funzionante verticalmente, c'è **un solo** overflow-auto
 * esterno. Il contenuto interno usa `min-width: max-content` per espandersi
 * orizzontalmente senza creare un secondo scroll context.
 */
export default function WeekView({ weekStart }: WeekViewProps) {
  const fields: fields[] = useFields().sort((a, b) => a.id - b.id);
  const [reservations, setReservations] = useState<view_reservations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Calcola i 7 giorni della settimana (Lun → Dom)
  const weekDays = useMemo<Date[]>(
    () => Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // ── Fetch unica per tutta la settimana ────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setReservations([]); // svuota prima di ricaricare

    const endDate = weekDays[DAYS_IN_WEEK - 1]; // domenica

    const body: ReservationPostRequest = {
      startDate: weekStart,
      endDate: endDate,
      id_status: ReservationStatus.CONFIRMED,
    };

    fetch("/api/reservations/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data: view_reservations[]) => setReservations(data))
      .catch((err: Error) =>
        toast.error("Errore nel caricamento prenotazioni: " + err.message),
      )
      .finally(() => setIsLoading(false));
  }, [weekStart]); // weekStart cambia → nuova fetch

  const totalHeight = Timeslots.length * HOUR_HEIGHT;

  return (
    /*
     * Unico scroll container per X e Y.
     * `min-width: max-content` sul figlio garantisce lo scroll orizzontale
     * senza creare un secondo overflow context che rompe sticky verticale.
     */
    <div
      className="w-full h-full overflow-auto select-none relative"
    >
      {/* Overlay di caricamento leggero (non blocca la UI) */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-background/40 backdrop-blur-[1px] pointer-events-none" />
      )}

      <div style={{ minWidth: "max-content" }}>
        {/* ══ HEADER STICKY (giorni + nomi campi) ═══════════════════════════ */}
        {/*
         * Il primo figlio è un div-spaziatore da TIME_COL_WIDTH px,
         * identico alla colonna orari nel body. Questo garantisce
         * allineamento pixel-perfect senza usare paddingLeft.
         */}
        <div className="sticky top-0 z-20 flex">
          {/* Spaziatore — replica la larghezza della colonna orari */}
          <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />
          {weekDays.map((day) => {
            const todayFlag = isToday(day);
            const dayLabel = format(day, "EEE dd MMM", { locale: it });

            return (
              <div
                key={day.toISOString()}
                className="flex flex-col border-r-2 border-border/70 last:border-r-0"
                style={{ flexShrink: 0 }}
              >
                {/* Riga 1 — header giorno */}
                <div
                  className={`
                    flex items-center justify-center px-3 py-1.5
                    border-b border-primary/40
                    ${todayFlag
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/80 text-muted-foreground backdrop-blur-sm"
                    }
                  `}
                >
                  <span className="text-xs font-bold capitalize tracking-wide">
                    {dayLabel}
                    {todayFlag && (
                      <span className="ml-1.5 inline-block size-1.5 rounded-full bg-primary-foreground/80 align-middle" />
                    )}
                  </span>
                </div>

                {/* Riga 2 — header campi per questo giorno */}
                <div className="flex">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-center px-2 py-1.5 bg-primary/90 backdrop-blur-sm border-r border-primary/60 last:border-r-0 shadow-sm"
                      style={{ width: MIN_FIELD_COL_WIDTH, flexShrink: 0 }}
                    >
                      <span className="text-[11px] font-bold text-primary-foreground truncate text-center tracking-wide">
                        {field.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ CORPO CALENDARIO ══════════════════════════════════════════════ */}
        <div className="flex">
          {/* ── Colonna etichette orarie (condivisa per tutti i giorni) ───── */}
          <div className="shrink-0 flex flex-col" style={{ width: TIME_COL_WIDTH }}>
            {Timeslots.map((time) => (
              <div key={time} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span
                  className="absolute right-2 text-[10px] text-muted-foreground/70 font-medium select-none tabular-nums leading-none"
                  style={{ top: -6 }}
                >
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* ── Gruppi giorno (una "mini DayView" per ogni giorno) ─────────── */}
          {weekDays.map((day) => {
            // Partiziona le prenotazioni per questo giorno
            const dayReservations = reservations.filter((r) =>
              isSameUTCDay(r, day),
            );

            return (
              <div
                key={day.toISOString()}
                className="flex relative border-r-2 border-border/70 last:border-r-0"
                style={{ height: totalHeight }}
              >
                {/* Layer di sfondo: linee orizzontali ora + mezzora */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                >
                  {Timeslots.map((_, i) => (
                    <React.Fragment key={i}>
                      {/* Linea piena ogni ora */}
                      <div
                        className="absolute left-0 right-0 border-t border-border/50"
                        style={{ top: i * HOUR_HEIGHT }}
                      />
                      {/* Linea tratteggiata ogni mezzora */}
                      <div
                        className="absolute left-0 right-0 border-t border-border/25 border-dashed"
                        style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                      />
                    </React.Fragment>
                  ))}
                </div>

                {/* Colonne campi per questo giorno */}
                {fields.map((field) => {
                  const fieldReservations = dayReservations.filter(
                    (r) => r.description === field.description,
                  );

                  return (
                    <FieldColumn
                      key={field.id}
                      fieldReservations={fieldReservations}
                      totalHeight={totalHeight}
                      onSlotClick={(start, end) => {
                        const dateStr = day.toISOString().slice(0, 10);
                        router.push(`/dashboard/partite/new?date=${dateStr}&start=${start}&end=${end}&fieldId=${field.id}`);
                      }}
                      className="border-r border-border/40 last:border-r-0"
                      style={{ width: MIN_FIELD_COL_WIDTH, minWidth: MIN_FIELD_COL_WIDTH }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
