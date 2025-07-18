import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationPostRequest } from "@/types/types";
import { reservations, view_reservations } from "@prisma/client";

export async function POST(request: NextRequest) {
  // const data: ReservationPostRequest = await request.json();
  const body: ReservationPostRequest = await request.json();

  // cerchiamo dalle reservations normali, prendiamo gli id, e poi cerchiamo nella view
  const reservationsRaw = await prisma.reservations.findMany({
    where: {
      id_status: body.id_status ?? undefined,
      id_user: body.id_user ?? undefined,
      id_field: body.id_field ?? undefined,
    },
  });

  // se non ci sono prenotazioni, ritorniamo un array vuoto
  if (reservationsRaw.length === 0) {
    return NextResponse.json([]);
  }

  // prendo tutti gli id delle prenotazioni trovate
  // e li uso per cercare nella view_reservations
  const reservationsIds = reservationsRaw.map((reservation) =>
    Number(reservation.id)
  );

  // al momento faccio solo una list di test
  const reservations: view_reservations[] =
    await prisma.view_reservations.findMany({
      where: {
        id: {
          in: reservationsIds,
        },
      },

      orderBy: {
        date: "asc",
      },
    });

  // map every id to string to avoid serialization error
  const safeReservations = reservations.map((reservation) => ({
    ...reservation,
    id: reservation.id.toString(), // assuming 'id' is the primary key
  }));

  return NextResponse.json(safeReservations);
}
