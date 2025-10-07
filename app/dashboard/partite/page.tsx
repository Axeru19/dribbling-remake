"use client";

import { useQueryClient } from "@tanstack/react-query";
import { use, useEffect, useState } from "react";
import { ReservationPostRequest } from "@/types/types";
import { ReservationStatus } from "@/types/enums";
import { addDays, format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";

function fetchReservations(date: Date) {
  const body: ReservationPostRequest = {
    id_status: ReservationStatus.CONFIRMED.valueOf(),
    date: date,
  };

  return fetch("/api/reservations/list", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

export default function Page() {
  const today = new Date();
  const bufferRadius = 3; // days

  const [days, setDays] = useState<Date[]>(initializeDays(today));

  const [currentSlide, setCurrentSlide] = useState(bufferRadius);
  const queryClient = useQueryClient();

  function initializeDays(startDate: Date) {
    return Array.from({ length: bufferRadius * 2 + 1 }, (_, i) =>
      addDays(startDate, i - bufferRadius)
    );
  }

  //prefetch reservations when the current slide changes
  useEffect(() => {
    days.forEach((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      queryClient.prefetchQuery({
        queryKey: ["reservations", dateKey],
        queryFn: () => fetchReservations(date),
        staleTime: 5 * 60 * 1000, // stesse regole di cache di DayView
      });
    });
  }, [days, queryClient]);

  // Gestione dello swipe nel carousel
  function handleSlideChange(idx: number) {
    setCurrentSlide(idx);

    // Accoda un giorno in avanti quando sei vicino alla fine del buffer
    if (idx >= days.length - 2) {
      const next = addDays(days[days.length - 1], 1);
      setDays((prev) => [...prev, next]);
    }
    // Prepend un giorno precedente quando sei vicino all'inizio
    else if (idx <= 1) {
      const prevDay = subDays(days[0], 1);
      setDays((prev) => [prevDay, ...prev]);
      // riallinea l'indice corrente
      setCurrentSlide(idx + 1);
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <header className="flex flex-wrap justify-center lg:justify-start w-full items-center gap-3 lg:gap-6">
        <h1 className="text-2xl font-bold">
          {format(days[currentSlide], "EEE, dd MMM yyyy", { locale: it })}
        </h1>
        {/* navigation section */}
        <div className="flex justify-center lg:justify-start flex-1 items-center gap-2">
          <Button
            onClick={() => handleSlideChange(currentSlide - 1)}
            variant="secondary"
            size={"sm"}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={() => handleSlideChange(currentSlide + 1)}
            variant="secondary"
            size={"sm"}
          >
            <ChevronRightIcon />
          </Button>

          <div className="">
            <DatePicker
              date={days[currentSlide]}
              setDate={(date: Date | null) => {
                if (date) {
                  const newDays = initializeDays(date);
                  setDays(newDays);
                  setCurrentSlide(bufferRadius); // reset to the middle of the new range
                }
              }}
            />
          </div>
        </div>
      </header>
    </div>
  );
}
