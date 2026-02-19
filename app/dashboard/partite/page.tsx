"use client";

import { useState } from "react";
import { addDays, format, isToday, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import DayView from "./DayView";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";

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

  const isTodaySelected = isToday(day);

  // Helper per settare la data dal picker
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setDay(
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      {/* ── HEADER MOBILE COMPATTO ( < sm ) ───────────────────────────────── */}
      <header className="flex items-center justify-between sm:hidden pb-2 border-b">
        {/* Sinistra: Navigazione Data */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-8 w-8 hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <DatePicker
            date={day}
            setDate={handleDateSelect}
            trigger={
              <button className="flex flex-col items-center px-2 py-0.5 rounded-md active:bg-accent transition-colors">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold leading-none tracking-tight">
                    {format(day, "d MMM", { locale: it })}
                  </span>
                  {isTodaySelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium leading-none mt-0.5">
                  {format(day, "EEEE", { locale: it })}
                </span>
              </button>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            className="h-8 w-8 hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Destra: Azioni */}
        <div className="flex items-center gap-1">
          {!isTodaySelected && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToday}
              className="h-9 w-9 text-muted-foreground"
              title="Torna a oggi"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          )}
          <div className="w-px h-5 bg-border mx-1" />
          <Link href="/dashboard/partite/new">
            <Button size="icon" className="h-9 w-9 rounded-full shadow-sm">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ── HEADER DESKTOP / TABLET ( >= sm ) ─────────────────────────────── */}
      <header className="hidden sm:flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between pb-2 border-b sm:border-none px-1">
        {/* Data e Titolo */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight capitalize leading-tight">
              {format(day, "EEEE, dd MMMM", { locale: it })}
              <span className="text-muted-foreground font-normal ml-2">
                {format(day, "yyyy", { locale: it })}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 h-6">
            {isTodaySelected && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full animate-in fade-in zoom-in">
                Oggi
              </span>
            )}
          </div>
        </div>

        {/* Controlli Desktop */}
        <div className="flex items-center gap-4">
          {/* Gruppo Navigazione */}
          <div className="flex items-center p-1 bg-accent/40 rounded-lg border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="h-8 w-8 hover:bg-background hover:shadow-sm rounded-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="px-1 border-l border-r border-border/40 mx-1">
              <DatePicker date={day} setDate={handleDateSelect} />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goForward}
              className="h-8 w-8 hover:bg-background hover:shadow-sm rounded-md"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!isTodaySelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToday}
                className="h-9"
              >
                Torna a oggi
              </Button>
            )}

            <Link href="/dashboard/partite/new">
              <Button size="sm" className="h-9 gap-2 font-semibold shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Nuova Partita</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Calendario giornaliero ───────────────────────────────────────── */}
      <DayView day={day} swipeHandlers={swipeHandlers} />
    </div>
  );
}
