"use client";

/**
 * Pagina admin: calendario prenotazioni (Partite).
 *
 * Due viste:
 *  - "day"  → DayView  (giornaliero, navigazione ±1 giorno)
 *  - "week" → WeekView (settimanale Lun–Dom, navigazione ±7 giorni)
 *
 * Il toggle tra le viste è un segmented-control nell'header.
 * La navigazione (frecce + DatePicker + swipe) si adatta alla vista attiva.
 *
 * Layout header:
 *  - Mobile  (< sm): [‹ {data pill} ›]  [oggi?]  [toggle]  [+]
 *  - Desktop (>= sm): [Titolo]  |  [‹ DatePicker ›]  [Oggi]  [toggle]  [+ Nuova Partita]
 */

import { useState, useMemo } from "react";
import {
  addDays,
  format,
  isToday,
  startOfWeek,
  endOfWeek,
  subDays,
} from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import DayView from "./DayView";
import WeekView from "./WeekView";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

// ─── Tipi ─────────────────────────────────────────────────────────────────────

/** Viste disponibili del calendario. */
type CalendarView = "day" | "week";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Restituisce il lunedì della settimana che contiene `date`,
 * normalizzato a mezzanotte UTC (coerente con i timestamp delle prenotazioni).
 *
 * `startOfWeek` da solo restituisce la mezzanotte LOCALE, che in fusi orari
 * > UTC+0 corrisponde al giorno precedente in UTC, causando un off-by-one
 * nella comparazione `isSameUTCDay` di WeekView.
 */
function getMondayOf(date: Date): Date {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  // Usa i getter locali per estrarre anno/mese/giorno del lunedì,
  // poi crea un timestamp UTC midnight — identico a come il DatePicker
  // normalizza le date (Date.UTC(...)).
  return new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  /** Giorno "corrente" del cursore — usato da entrambe le viste come pivot. */
  const [day, setDay] = useState<Date>(new Date());

  /** Vista attiva: "day" o "week". */
  const [view, setView] = useState<CalendarView>("day");

  // ── Navigazione ─────────────────────────────────────────────────────────────

  /** Avanza di 1 giorno (vista giornaliera) o 7 giorni (vista settimanale). */
  const goForward = () =>
    setDay((d) => addDays(d, view === "week" ? 7 : 1));

  /** Retrocede di 1 giorno (vista giornaliera) o 7 giorni (vista settimanale). */
  const goBack = () =>
    setDay((d) => subDays(d, view === "week" ? 7 : 1));

  /** Torna al giorno/settimana corrente. */
  const goToday = () => setDay(new Date());

  /** Gestisce la selezione dal DatePicker (normalizza a UTC midnight). */
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setDay(
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
      );
    }
  };

  // ── Swipe (mobile) ──────────────────────────────────────────────────────────

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goForward,
    onSwipedRight: goBack,
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  });

  // ── Valori derivati ─────────────────────────────────────────────────────────

  /** Lunedì della settimana corrente (pivot per WeekView). */
  const weekStart = useMemo(() => getMondayOf(day), [day]);

  const isTodaySelected = view === "day" ? isToday(day) : isToday(weekStart);

  // Stringhe di formato per gli header
  const dayNumber   = format(day, "d", { locale: it });
  const dayMonth    = format(day, "MMM", { locale: it });
  const dayName     = format(day, "EEEE", { locale: it });
  const fullDate    = format(day, "EEEE dd MMMM yyyy", { locale: it });

  /** Titolo desktop: diverso in base alla vista attiva. */
  const desktopTitle =
    view === "day"
      ? format(day, "EEEE dd MMMM", { locale: it })
      : `${format(weekStart, "dd MMM", { locale: it })} – ${format(
          endOfWeek(weekStart, { weekStartsOn: 1 }),
          "dd MMM yyyy",
          { locale: it },
        )}`;

  const desktopYear =
    view === "day"
      ? format(day, "yyyy")
      : format(weekStart, "yyyy");

  // ── UI Toggle (segmented control) ───────────────────────────────────────────

  /** Segmented control riusato in mobile e desktop. */
  const ViewToggle = (
    <div
      className={cn(
        "flex items-center gap-0.5",
        "bg-background border border-border rounded-xl shadow-sm px-1 py-1",
      )}
      role="group"
      aria-label="Seleziona vista calendario"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView("day")}
        className={cn(
          "size-8 rounded-lg transition-colors",
          view === "day"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
        aria-label="Vista giornaliera"
        aria-pressed={view === "day"}
        title="Vista giornaliera"
      >
        <CalendarDays className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView("week")}
        className={cn(
          "size-8 rounded-lg transition-colors",
          view === "week"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
        aria-label="Vista settimanale"
        aria-pressed={view === "week"}
        title="Vista settimanale (Lun–Dom)"
      >
        <CalendarRange className="size-4" />
      </Button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER MOBILE (< sm)
          Layout: [‹ {data pill} ›]  [oggi?]  [toggle vista]  [+]
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="flex items-center justify-between sm:hidden">
        {/* — Navigazione: freccia + pill data + freccia ───────────────────── */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={view === "day" ? "Giorno precedente" : "Settimana precedente"}
          >
            <ChevronLeft className="size-5" />
          </Button>

          {/* Pill data — cliccabile per aprire il DatePicker */}
          <DatePicker
            date={day}
            setDate={handleDateSelect}
            trigger={
              <button
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3 py-1.5 transition-colors",
                  "bg-primary/8 hover:bg-primary/14 active:bg-primary/20",
                  "border border-primary/15",
                )}
                aria-label={`Data selezionata: ${fullDate}. Tocca per scegliere un'altra data.`}
              >
                <span className="text-sm font-bold text-foreground capitalize tabular-nums">
                  {dayNumber} <span className="text-primary">{dayMonth}</span>
                </span>
                {isTodaySelected && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                )}
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  {dayName.substring(0, 3)}
                </span>
                <CalendarDays className="size-3.5 text-muted-foreground/70" />
              </button>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={view === "day" ? "Giorno successivo" : "Settimana successiva"}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* — Azioni: "oggi" + toggle vista + FAB nuova partita ———————————— */}
        <div className="flex items-center gap-2">
          {!isTodaySelected && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToday}
              className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Torna a oggi"
              aria-label="Torna a oggi"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}

          {/* Toggle vista (mobile) */}
          {ViewToggle}

          {/* FAB nuova partita */}
          <Link href="/dashboard/partite/new">
            <Button
              size="icon"
              className="size-9 rounded-xl shadow-sm"
              aria-label="Nuova partita"
            >
              <Plus className="size-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER DESKTOP (>= sm)
          Layout: [Titolo + badge]  |  [‹ DatePicker ›]  [Oggi]  [toggle]  [+ Nuova Partita]
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="hidden sm:flex items-center justify-between gap-4">
        {/* — Titolo: data o range settimana ——————————————————————————————— */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground capitalize leading-tight truncate">
              {desktopTitle}
            </h1>
            <span className="text-lg font-semibold text-muted-foreground/70 leading-tight tabular-nums">
              {desktopYear}
            </span>
          </div>

          {/* Badge "Oggi" */}
          <div className="h-5 mt-0.5">
            {isTodaySelected && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-bold",
                  "text-primary",
                  "animate-in fade-in slide-in-from-left-2 duration-200",
                )}
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {view === "day" ? "Oggi" : "Settimana corrente"}
              </span>
            )}
          </div>
        </div>

        {/* — Controlli navigazione + toggle + azioni ——————————————————————— */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Gruppo navigazione: ‹ | DataPicker | › */}
          <div
            className={cn(
              "flex items-center gap-0.5",
              "bg-background border border-border rounded-xl shadow-sm px-1 py-1",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={view === "day" ? "Giorno precedente" : "Settimana precedente"}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="w-px h-4 bg-border mx-0.5" />

            <DatePicker
              date={day}
              setDate={handleDateSelect}
              trigger={
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold",
                    "text-foreground transition-colors hover:bg-muted",
                  )}
                  aria-label={`Data selezionata: ${fullDate}. Clicca per scegliere un'altra data.`}
                >
                  <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="capitalize">
                    {view === "day"
                      ? format(day, "dd MMM", { locale: it })
                      : `${format(weekStart, "dd MMM", { locale: it })} – ${format(
                          endOfWeek(weekStart, { weekStartsOn: 1 }),
                          "dd MMM",
                          { locale: it },
                        )}`}
                  </span>
                </button>
              }
            />

            <div className="w-px h-4 bg-border mx-0.5" />

            <Button
              variant="ghost"
              size="icon"
              onClick={goForward}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={view === "day" ? "Giorno successivo" : "Settimana successiva"}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Pulsante "Torna a oggi" */}
          {!isTodaySelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className={cn(
                "h-9 gap-1.5 rounded-xl text-sm font-semibold",
                "border-border text-muted-foreground",
                "hover:text-foreground hover:bg-muted",
                "animate-in fade-in slide-in-from-right-2 duration-200",
              )}
            >
              <RotateCcw className="size-3.5" />
              Oggi
            </Button>
          )}

          {/* Toggle vista (desktop) */}
          {ViewToggle}

          {/* Pulsante "Nuova Partita" */}
          <Link href="/dashboard/partite/new">
            <Button
              size="sm"
              className="h-9 gap-2 rounded-xl font-semibold shadow-sm"
              aria-label="Crea nuova partita"
            >
              <Plus className="size-4" />
              Nuova Partita
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Calendario (vista attiva) ──────────────────────────────────────── */}
      {view === "day" ? (
        <DayView day={day} swipeHandlers={swipeHandlers} />
      ) : (
        <WeekView weekStart={weekStart} />
      )}
    </div>
  );
}
