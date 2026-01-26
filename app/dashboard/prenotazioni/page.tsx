"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { reservations, view_reservations } from "@prisma/client";
import { set } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock10Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ReservationActionDialog from "@/components/ReservationActionDialog";
import { ReservationPostRequest } from "@/types/types";
import { ReservationStatus } from "@/lib/enums";
import { number } from "zod";

const body: ReservationPostRequest = { id_status: ReservationStatus.INCOMING };

export default function Page() {
  const [reservations, setReservations] = useState<view_reservations[]>([]);
  const [reload, setReload] = useState<number>(0);

  useEffect(() => {
    fetch("/api/reservations/list", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Assuming data is an array of reservations
        setReservations(data);
      })
      .catch((error) => {
        toast.error("Errore durante il caricamento delle prenotazioni");
      });
  }, [reload]);

  return (
    <div
      className="ooverflow-y-auto gap-6
         flex flex-col lg:grid lg:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]"
    >
      {reservations.length !== 0 &&
        reservations.map((reservation) => (
          <ReservationIncoming
            setReload={setReload}
            key={reservation.id}
            reservation={reservation}
          />
        ))}

      {reservations.length === 0 && (
        <p className="text-center">Al momento tutto tranquillo...</p>
      )}
    </div>
  );
}

function ReservationIncoming({
  reservation,
  setReload,
}: {
  reservation: view_reservations;
  setReload: React.Dispatch<React.SetStateAction<number>>;
}) {
  function onReservationAction(status: ReservationStatus) {
    fetch(`/api/reservations/${reservation.id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: status.valueOf(),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        toast.success("Prenotazione aggiornata con successo");
        setReload((prev) => prev + 1);
      })
      .catch((error) => {
        toast.error("Errore durante l'aggiornamento della prenotazione");
      });
  }

  return (
    <Card className="w-full justify-between">
      <CardHeader>
        <CardTitle>
          {reservation.name} {reservation.surname}
          {" - " + reservation.description}
        </CardTitle>

        <CardDescription>
          {"@" + reservation.nickname}{" "}
          <Badge className="text-xs ml-2" variant={"secondary"}>
            {reservation.mixed ? "squadre miste" : "squadre omogenee"}
          </Badge>{" "}
        </CardDescription>
      </CardHeader>

      <CardContent className="">
        <div className="grid grid-cols-2">
          <span className="flex items-center gap-2">
            <Calendar size={16} />
            {new Date(reservation.date).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <span className="flex gap-2 items-center">
            <Clock10Icon size={16} />{" "}
            {new Date(reservation.start_time)
              .toISOString()
              .split("T")[1]
              .substring(0, 5)}{" "}
            -{" "}
            {new Date(reservation.end_time)
              .toISOString()
              .split("T")[1]
              .substring(0, 5)}
          </span>

          <div className="col-span-2 mt-2 w-full">
            <p className="text-sm line-clamp-2">
              {reservation.notes || "Nessuna nota disponibile"}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => {
              window.location.href = `tel:${reservation.telephone}`;
            }}
            size={"sm"}
            className="flex-1"
            variant={"outline"}
          >
            Chiama
          </Button>

          <ReservationActionDialog
            onConfirm={() => {
              onReservationAction(ReservationStatus.REJECTED);
            }}
            type="rifiuta"
            reservation={reservation}
          >
            <Button size={"sm"} className="flex-1" variant={"destructive"}>
              Rifiuta
            </Button>
          </ReservationActionDialog>
        </div>

        <ReservationActionDialog
          onConfirm={() => {
            onReservationAction(ReservationStatus.CONFIRMED);
          }}
          type="conferma"
          reservation={reservation}
        >
          <Button className="w-full">Conferma</Button>
        </ReservationActionDialog>
      </CardFooter>
    </Card>
  );
}
