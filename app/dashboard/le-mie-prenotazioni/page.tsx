import { authOptions } from "@/lib/auth";
import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { AppUser } from "@/types/types";
import { reservations } from "@prisma/client";
import { getServerSession } from "next-auth";
import React from "react";
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

export default async function page() {
  const session = await getServerSession(authOptions);
  const user: AppUser | null = session?.user || null;

  const fields = await prisma.fields.findMany();

  const reservations: reservations[] = await prisma.reservations.findMany({
    where: {
      id_user: BigInt(user?.id!),
    },
    orderBy: {
      id: "desc",
    },
  });
  return (
    <div className="flex gap-3 flex-col h-full w-full overflow-y-auto overflow-x-auto">
      <header className="sticky top-0 bg-white border-b py-2 grid grid-cols-6 w-full text-sm text-gray-500 capitalize font-semibold">
        <span className="text-center">ID</span>
        <span className="text-center">Data</span>
        <span className="text-center">Campo</span>
        <span className="text-center">Ora Inizio</span>
        <span className="text-center">ora fine</span>
        <span className="text-center">status</span>
      </header>
      {reservations.map((reservation: reservations) => (
        <div
          key={reservation.id.toString()}
          className="rounded items-center py-3 text-sm grid grid-cols-6 w-full"
        >
          <span className="text-center">{reservation.id.toString()}</span>
          <span className="text-center">
            {reservation.date?.toLocaleDateString("it-IT")}
          </span>
          <span className="text-center">
            {
              fields.find((field) => field.id === reservation.id_field)
                ?.description
            }
          </span>

          <span className="text-center">
            {reservation.start_time
              ?.toISOString()
              .split("T")[1]
              .substring(0, 5)}
          </span>
          <span className="text-center">
            {reservation.end_time?.toISOString().split("T")[1].substring(0, 5)}
          </span>

          {/* Status */}
          <span className="text-center text-xs text-white font-semibold">
            <span
              style={{
                background:
                  reservationStatusDict[
                    reservation.id_status as ReservationStatus
                  ].color,
              }}
              className="px-3 py-1 rounded-full"
            >
              {
                reservationStatusDict[
                  reservation.id_status as ReservationStatus
                ].label
              }
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
