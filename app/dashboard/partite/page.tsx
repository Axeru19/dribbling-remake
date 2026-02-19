"use client";

/**
 * Pagina admin: calendario giornaliero prenotazioni (Partite).
 *
 * L'header permette di:
 *  - Navigare tra i giorni con frecce ‹ ›
 *  - Aprire il DatePicker per selezionare una data specifica
 *  - Tornare rapidamente ad "Oggi"
 *  - Aggiungere una nuova partita (link a /dashboard/partite/new)
 *
 * Due layout distinti:
 *  - Mobile  (< sm): compatto con pill avatar data, frecce e FAB "+"
 *  - Desktop (>= sm): barra orizzontale con gruppo navigazione e pulsanti testo
 *
 * La logica di navigazione (goBack, goForward, goToday, swipe) è invariata.
 */

import { useState } from "react";
import { addDays, format, isToday, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import DayView from "./DayView";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

export default function Page() {
  const [day, setDay] = useState<Date>(new Date());

  /** Naviga al giorno precedente */
  const goBack = () => setDay((d) => new Date(subDays(d, 1)));

  /** Naviga al giorno successivo */
  const goForward = () => setDay((d) => new Date(addDays(d, 1)));

  /** Torna ad oggi */
  const goToday = () => setDay(new Date());

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goForward,
    onSwipedRight: goBack,
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  });

  /** Setter data usato dal DatePicker (normalizza a UTC midnight) */
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setDay(
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
      );
    }
  };

  const isTodaySelected = isToday(day);

  // Stringhe di formato data
  const dayNumber = format(day, "d", { locale: it });
  const dayMonth = format(day, "MMM", { locale: it });
  const dayName = format(day, "EEEE", { locale: it });
  const fullDate = format(day, "EEEE dd MMMM yyyy", { locale: it });

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          HEADER MOBILE (< sm)
          Layout: [‹  {data pill}  ›]  [oggi?]  [+]
          Il "pill" data apre il DatePicker.
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="flex items-center justify-between sm:hidden">
        {/* — Navigazione sinistra: freccia + pill data —————————————————————— */}
        <div className="flex items-center gap-1">
          {/* Freccia sinistra */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Giorno precedente"
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
                {/* Numero giorno + mese */}
                <span className="text-sm font-bold text-foreground capitalize tabular-nums">
                  {dayNumber} <span className="text-primary">{dayMonth}</span>
                </span>

                {/* Dot "oggi" */}
                {isTodaySelected && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                )}

                {/* Giorno della settimana abbreviato */}
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  {dayName.substring(0, 3)}
                </span>

                <CalendarDays className="size-3.5 text-muted-foreground/70" />
              </button>
            }
          />

          {/* Freccia destra */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Giorno successivo"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* — Azioni destra: "oggi" + FAB nuova partita ————————————————————— */}
        <div className="flex items-center gap-2">
          {/* Torna a oggi — appare solo se non siamo già oggi */}
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

          {/* FAB: Nuova Partita */}
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
          HEADER DESKTOP / TABLET (>= sm)
          Layout: [Titolo + badge "Oggi"]  |  [‹ DatePicker ›]  [Torna a oggi]  [+ Nuova Partita]
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="hidden sm:flex items-center justify-between gap-4">
        {/* — Titolo data ——————————————————————————————————————————————————— */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground capitalize leading-tight truncate">
              {format(day, "EEEE dd MMMM", { locale: it })}
            </h1>
            <span className="text-lg font-semibold text-muted-foreground/70 leading-tight tabular-nums">
              {format(day, "yyyy")}
            </span>
          </div>

          {/* Badge "Oggi" — compare con animazione */}
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
                Oggi
              </span>
            )}
          </div>
        </div>

        {/* — Controlli navigazione e azioni ——————————————————————————————— */}
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
              aria-label="Giorno precedente"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Separatore */}
            <div className="w-px h-4 bg-border mx-0.5" />

            {/* DatePicker con trigger personalizzato */}
            <DatePicker
              date={day}
              setDate={handleDateSelect}
              trigger={
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold",
                    "text-foreground transition-colors",
                    "hover:bg-muted",
                  )}
                  aria-label={`Data selezionata: ${fullDate}. Clicca per scegliere un'altra data.`}
                >
                  <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="capitalize">
                    {format(day, "dd MMM", { locale: it })}
                  </span>
                </button>
              }
            />

            {/* Separatore */}
            <div className="w-px h-4 bg-border mx-0.5" />

            <Button
              variant="ghost"
              size="icon"
              onClick={goForward}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Giorno successivo"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Pulsante "Torna a oggi" — appare solo se necessario */}
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

      {/* ── Calendario giornaliero ────────────────────────────────────────── */}
      <DayView day={day} swipeHandlers={swipeHandlers} />
    </div>
  );
}
