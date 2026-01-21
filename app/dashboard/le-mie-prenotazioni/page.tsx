import { authOptions } from "@/lib/auth";
import { ReservationStatus } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { AppUser } from "@/types/types";
import { getServerSession } from "next-auth";
import React from "react";
import { toast } from "sonner";

export default async function page() {
  const session = await getServerSession(authOptions);
  const user: AppUser | null = session?.user || null;

  const reservations = await prisma.reservations.findMany({
    where: {
      id_user: BigInt(user?.id!),
    },
    orderBy: {
      date: "asc",
    },
  });
  return (
    <div>
      {reservations.map((reservation) => (
        <div
          key={reservation.id.toString()}
          className="p-4 mb-4 border rounded"
        >
          <h3 className="text-lg font-semibold">
            Reservation ID: {reservation.id.toString()}
          </h3>
        </div>
      ))}
    </div>
  );
}
