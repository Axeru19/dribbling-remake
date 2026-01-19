import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Assicuriamoci che i dati esistano e siano del tipo giusto
  const date = body.date;
  const id_field = Number(body.id_field);

  // 1. Usiamo TO_CHAR per formattare direttamente in HH:MM (es. 08:30)
  // 2. Selezioniamo SOLO slot_start così evitiamo dati inutili
  const availableSlots = await prisma.$queryRaw<{ slot_start: string }[]>`
    SELECT to_char(slot_start, 'HH24:MI') as slot_start
    FROM get_available_slots(
        ${date}::date, 
        ${id_field}::int
    )
  `;
  return NextResponse.json(availableSlots.map((slot) => slot.slot_start));
}
