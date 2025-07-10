import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationPostRequest } from "@/types/types";
import { reservations, view_reservations } from "@prisma/client";

export async function POST(request: NextRequest) {
  // const data: ReservationPostRequest = await request.json();

  // al momento faccio solo una list di test
  const reservations: view_reservations[] =
    await prisma.view_reservations.findMany();

  // map every id to string to avoid serialization error
  const safeReservations = reservations.map((reservation) => ({
    ...reservation,
    id: reservation.id.toString(), // assuming 'id' is the primary key
  }));

  return NextResponse.json(safeReservations);
}
