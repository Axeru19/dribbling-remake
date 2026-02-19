"use client";

import { useFields } from "@/context/FieldsContex";
import { fields, view_reservations } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReservationPostRequest } from "@/types/types";
import Link from "next/link";
import { ReservationStatus } from "@/lib/enums";
import { Timeslots } from "@/lib/constants";

// ─── Costanti di layout ───────────────────────────────────────────────────────

/**
 * Altezza in pixel di ogni fascia oraria (1 ora).
 * Unica fonte di verità per tutti i calcoli di posizionamento/dimensionamento.
 */
const HOUR_HEIGHT = 80; // px per ora

/** Ora UTC di inizio del calendario. Deve corrispondere al primo slot in Timeslots. */
const CALENDAR_START_HOUR = 8; // 08:00

/** Larghezza minima di ciascuna colonna campo (usata per il layout orizzontale). */
const MIN_COL_WIDTH = 0; // px — 0 = colonne 1fr, nessun overflow orizzontale su mobile

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converte una data/stringa ISO in minuti dall'inizio del calendario.
 * Gestisce il wrap notturno (es. slot 00:00, 01:00 dopo mezzanotte).
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

/** Formatta un ISO datetime → "HH:MM" usando l'offset UTC. */
function formatTime(dt: Date | string): string {
  return new Date(dt).toISOString().split("T")[1].substring(0, 5);
}

// ─── EventBlock ───────────────────────────────────────────────────────────────

interface EventBlockProps {
  reservation: view_reservations;
}

/**
 * Blocco evento pixel-perfect all'interno della colonna del campo.
 * - `top`: offset in px dall'inizio del calendario (HH:MM esatti)
 * - `height`: proporzionale alla durata dell'evento
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

  return (
    <Link
      href={`/dashboard/partite/${reservation.id}`}
      className="absolute left-0.5 right-0.5 group z-10"
      style={{ top: topPx, height: heightPx }}
      title={`${displayName} — ${startLabel}→${endLabel}`}
    >
      <div className="w-full h-full rounded-md border-l-[3px] border-primary bg-primary/10 hover:bg-primary/20 transition-colors duration-150 overflow-hidden px-1.5 py-1 flex flex-col justify-start shadow-sm">
        <span className="text-[11px] font-semibold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
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

// ─── DayView ──────────────────────────────────────────────────────────────────

interface DayViewProps {
  day: Date;
  swipeHandlers: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Calendario giornaliero con:
 * - Header colonne (sport/campo) STICKY durante lo scroll verticale
 * - Posizionamento eventi pixel-perfect (top = ora:minuti esatti)
 * - Altezza evento proporzionale alla durata
 * - Scroll orizzontale per molti campi
 *
 * SOLUZIONE STICKY: un **unico** `overflow-auto` esterno.
 * Il wrapper interno usa `min-width: fit-content` per espandersi
 * orizzontalmente senza creare un secondo scroll context (che
 * romperebbe `position: sticky` vertical).
 */
export default function DayView({ day, swipeHandlers }: DayViewProps) {
  const fields: fields[] = useFields().sort((a, b) => a.id - b.id);
  const [reservations, setReservations] = useState<view_reservations[]>([]);

  // ── Fetch prenotazioni confermate per il giorno ────────────────────────────
  useEffect(() => {
    const body: ReservationPostRequest = {
      date: day,
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
      );
  }, [day]);

  const totalHeight = Timeslots.length * HOUR_HEIGHT;

  // Larghezza totale dell'area campi (usata per sincronizzare le linee di sfondo)
  const totalColsWidth = fields.length * MIN_COL_WIDTH;

  return (
    /*
     * Unico scroll container per X e Y.
     * min-width:fit-content sul figlio garantisce lo scroll orizzontale
     * senza creare un secondo overflow context che rompe sticky.
     */
    <div className="w-full h-full overflow-auto select-none" {...swipeHandlers}>
      <div>
        {/* ══ HEADER COLONNE (STICKY) ══════════════════════════════════════ */}
        {/*
         * sticky top-0 funziona perché il solo ancestor con overflow è
         * il div più esterno (l'unico scroll container).
         * backdrop-blur dà l'effetto "vetro smerigliato" quando si scorre.
         */}
        <div
          className="flex sticky top-0 z-20"
          style={{ paddingLeft: 48 }} // allinea con la colonna orari
        >
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-center px-3 py-2 bg-primary/90 backdrop-blur-sm border-r border-primary/60 last:border-r-0 first:rounded-tl-md last:rounded-tr-md shadow-sm"
              style={{ minWidth: MIN_COL_WIDTH, flex: 1 }}
            >
              <span className="text-xs font-bold text-primary-foreground truncate text-center tracking-wide">
                {field.description}
              </span>
            </div>
          ))}
        </div>

        {/* ══ CORPO DEL CALENDARIO ════════════════════════════════════════ */}
        <div className="flex">
          {/* ── Colonna etichette orarie ──────────────────────────────────── */}
          <div className="shrink-0 w-12 flex flex-col">
            {Timeslots.map((time) => (
              <div
                key={time}
                className="flex items-start justify-end pr-2 border-t border-border/50"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground font-medium -mt-[7px] select-none tabular-nums">
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* ── Area colonne campi ────────────────────────────────────────── */}
          <div className="flex-1 relative" style={{ height: totalHeight }}>
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

            {/* Griglia colonne campi */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${fields.length}, minmax(${MIN_COL_WIDTH}px, 1fr))`,
              }}
            >
              {fields.map((field) => {
                const fieldReservations = reservations.filter(
                  (r) => r.description === field.description,
                );

                return (
                  <div
                    key={field.id}
                    className="relative border-r border-border/40 last:border-r-0"
                    style={{ height: totalHeight }}
                  >
                    {fieldReservations.map((reservation) => (
                      <EventBlock
                        key={reservation.id}
                        reservation={reservation}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
