import { useFields } from "@/context/FieldsContex";
import { fields, view_reservations } from "@prisma/client";
import { spawn } from "child_process";
import React, { useEffect, useState } from "react";
import "./style.css";
import { toast } from "sonner";
import { ReservationPostRequest } from "@/types/types";
import Link from "next/link";
import { ReservationStatus } from "@/lib/enums";
import { Timeslots } from "@/lib/constants";

const timeslots: string[] = Timeslots;

export default function DayView({
  day,
  swipeHandlers,
}: {
  day: Date;
  swipeHandlers: any;
}) {
  const fields: fields[] = useFields().sort((a, b) => a.id - b.id);
  const [reservations, setReservations] = useState<view_reservations[]>([]);

  useEffect(() => {
    const body: ReservationPostRequest = {
      date: day,
      id_status: ReservationStatus.CONFIRMED,
    };

    fetch("/api/reservations/list", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((reservations) => {
        setReservations(reservations);
        console.log(reservations);
      })
      .catch((err) =>
        toast.error(
          "Errore durante il caricamento delle prenotazioni: " + err.message,
        ),
      );
  }, [day]);

  return (
    <div
      className="w-full h-full overflow-y-auto select-none"
      {...swipeHandlers}
    >
      <header
        className="grid gap-2 sticky top-0 z-50"
        style={{
          gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))`,
        }}
      >
        {fields.map((field) => (
          <span
            className="p-2 bg-primary text-white font-bold text-center rounded-md truncate"
            key={field.id}
          >
            {field.description}
          </span>
        ))}
      </header>

      <div
        className="grid gap-4 mt-5 text-center"
        style={{
          gridTemplateRows: `repeat(${timeslots.length}, minmax(0, 1fr))`,
        }}
      >
        {timeslots.map((time) => (
          <div
            key={time}
            className="grid gap-2 min-h-15 pt-4 border-t relative timeslotrow"
            style={{
              gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))`,
            }}
          >
            <span className="time text-sm">{time}</span>
            {fields.map((field) => {
              const slot_reservations = reservations.filter(
                (r) =>
                  r.description === field.description &&
                  String(r.start_time)
                    .split("T")[1]
                    .startsWith(time.split(":")[0]),
              );

              if (!slot_reservations.length) return <div key={field.id}></div>;

              return (
                <div
                  key={field.id}
                  className="flex gap-2 flex-wrap cursor-pointer"
                >
                  {slot_reservations.map((reservation) => (
                    <Link
                      href={"/dashboard/partite/" + reservation.id}
                      key={reservation.id}
                      className="rounded-md flex-1 bg-accent flex flex-col items-center p-2"
                    >
                      <span className="font-semibold truncate">
                        {reservation.surname == "" ||
                        reservation.surname == null
                          ? reservation.user_not_registered
                          : reservation.surname}
                      </span>
                      <span className="text-xs max-w-3/4 truncate">
                        {String(reservation.start_time)
                          .split("T")[1]
                          .slice(0, 5)}
                      </span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
