import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, view_reservations } from "@prisma/client";
import { ReservationPostRequest } from "@/types/types";
import { normalizeIds } from "@/utils/normalizeIds";

export async function POST(request: NextRequest) {
  const body: ReservationPostRequest = await request.json();

  /*
   * Costruzione del filtro `date`:
   *  - Se è presente un range (startDate + endDate) → `gte` / `lte`
   *  - Altrimenti → exact match su `date` (comportamento originale)
   */
  let dateFilter: Prisma.DateTimeFilter | Date | undefined;

  if (body.startDate && body.endDate) {
    dateFilter = {
      gte: new Date(body.startDate),
      lte: new Date(body.endDate),
    };
  } else if (body.date) {
    dateFilter = new Date(body.date);
  }

  // Prima query: recupera le prenotazioni (tabella leggera, senza JOIN)
  const reservationsRaw = await prisma.reservations.findMany({
    where: {
      id_status: body.id_status ?? undefined,
      id_user:   body.id_user   ?? undefined,
      id_field:  body.id_field  ?? undefined,
      date:      dateFilter,
    },
  });

  // Nessuna prenotazione → risposta immediata senza seconda query
  if (reservationsRaw.length === 0) {
    return NextResponse.json([]);
  }

  // Seconda query: popola la view con i soli id trovati (evita full-scan)
  const reservationIds = reservationsRaw.map((r) => Number(r.id));

  const reservations: view_reservations[] =
    await prisma.view_reservations.findMany({
      where: { id: { in: reservationIds } },
      orderBy: { id: "desc" },
    });

  return NextResponse.json(normalizeIds(reservations));
}
