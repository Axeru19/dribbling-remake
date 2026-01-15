import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@/types/enums";
import { normalizeIds } from "@/utils/normalizeIds";
import { reservations } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user }: { user: string | number } = await req.json();

  const newReservation: Omit<reservations, "id"> = {
    date: new Date(),
    id_user: typeof user === "number" ? BigInt(user) : null,
    user_not_registered: typeof user === "string" ? user : null,
    id_field: 1,
    start_time: new Date(),
    // add 1 hour to end_time from start_time
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
    notes: null,
    room: null,
    mixed: false,
    id_status: ReservationStatus.CONFIRMED,
  };

  const res = await prisma.reservations.create({
    data: newReservation,
  });

  return NextResponse.json(normalizeIds(res));
}
