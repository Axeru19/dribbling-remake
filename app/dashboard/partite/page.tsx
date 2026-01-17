"use client";

import { use, useEffect, useState } from "react";
import { addDays, format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import DayView from "./DayView";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";

export default function Page() {
  const [day, setDay] = useState<Date>(new Date());

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setDay((day) => new Date(addDays(day, 1))),
    onSwipedRight: () => setDay((day) => new Date(subDays(day, 1))),
    // scroll only on vertical swipes
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  });

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <header className="flex flex-wrap justify-center lg:justify-start w-full items-center gap-3 lg:gap-6">
        <h1 className="text-2xl font-bold">
          {format(day, "EEE, dd MMM yyyy", { locale: it })}
        </h1>
        {/* navigation section */}
        <div className="flex justify-center lg:justify-start flex-1 items-center gap-2">
          <Button
            variant="secondary"
            size={"sm"}
            onClick={() => {
              setDay((day) => new Date(subDays(day, 1)));
            }}
          >
            <ChevronLeftIcon />
          </Button>

          <DatePicker
            date={day}
            setDate={(date: Date | null) => {
              if (date)
                setDay(
                  new Date(
                    Date.UTC(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    )
                  )
                );
            }}
          />

          <Button
            variant="secondary"
            size={"sm"}
            onClick={() => {
              setDay((day) => new Date(addDays(day, 1)));
            }}
          >
            <ChevronRightIcon />
          </Button>

          <Link href="/dashboard/partite/new">
            <Button size={"sm"}> + Nuova Partita</Button>
          </Link>
        </div>
      </header>

      <DayView day={day} swipeHandlers={swipeHandlers} />
    </div>
  );
}
