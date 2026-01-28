"use client";

import DeleteReservationButton from "@/components/deletereservation-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFields } from "@/context/FieldsContex";
import { authOptions } from "@/lib/auth";
import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { AppUser } from "@/types/types";
import { fields, reservations, view_reservations } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import { Clock10Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const reservationStatusDict = {
  [ReservationStatus.INCOMING]: {
    label: "In Arrivo",
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

export default function page() {
  const user: AppUser = useSession().data?.user as AppUser;

  const [reservations, setReservations] = useState<view_reservations[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/reservations/list", {
      method: "POST",
      body: JSON.stringify({ id_user: user.id }),
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
  }, [user]);

  return (
    <div
      className="overflow-y-auto h-full gap-6
         flex flex-col lg:grid lg:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]"
    >
      {reservations.length > 0 &&
        reservations.map((reservation) => {
          return (
            <Card key={reservation.id} className="flex-1 basis-1/3 h-fit">
              <CardHeader>
                <CardTitle>
                  {format(reservation.date!, "EEE, dd MMM yyyy", {
                    locale: it,
                  })}
                </CardTitle>

                <CardDescription className="text-xs flex gap-2 items-center">
                  <span>ID: {reservation.id}</span>
                  <span>
                    {reservation.mixed ? "Squadre miste" : "Squadre omogenee"}
                  </span>
                  <Badge
                    className="scale-80"
                    style={{
                      background:
                        reservationStatusDict[
                          reservation.id_status as ReservationStatus
                        ].color,
                    }}
                  >
                    {
                      reservationStatusDict[
                        reservation.id_status as ReservationStatus
                      ].label
                    }
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2">
                  <span className="flex gap-2 items-center">
                    <Clock10Icon size={16} />{" "}
                    {new Date(reservation.start_time!)
                      .toISOString()
                      .split("T")[1]
                      .substring(0, 5)}{" "}
                    -{" "}
                    {new Date(reservation.end_time!)
                      .toISOString()
                      .split("T")[1]
                      .substring(0, 5)}
                  </span>

                  <span className="text-center">{reservation.description}</span>

                  <div className="col-span-2 mt-2 w-full">
                    <p className="text-sm line-clamp-2">
                      {reservation.notes || "Nessuna nota disponibile"}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 w-full">
                <Button size="sm" className="text-xs flex-1">
                  Paga
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs flex-1"
                >
                  Anulla
                </Button>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
}
