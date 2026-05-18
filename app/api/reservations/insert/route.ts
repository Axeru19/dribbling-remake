import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@/lib/enums";
import { normalizeIds } from "@/utils/normalizeIds";
import { reservations } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user, date, start, end, fieldId }: {
    user: string | number;
    date?: string;
    start?: string;
    end?: string;
    fieldId?: number;
  } = await req.json();

  let dateObj: Date;
  let start_time: Date;
  let end_time: Date;
  let id_field: number;

  if (date && start && end && fieldId) {
    dateObj = new Date(date);
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    start_time = new Date(dateObj);
    start_time.setUTCHours(sh, sm, 0, 0);
    end_time = new Date(dateObj);
    end_time.setUTCHours(eh, em, 0, 0);
    id_field = fieldId;
  } else {
    const today = new Date();
    dateObj = today;
    start_time = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    end_time = new Date(start_time.getTime() + 60 * 60 * 1000);
    id_field = 1;
  }

  const newReservation: Omit<reservations, "id"> = {
    date: dateObj,
    id_user: typeof user === "number" ? BigInt(user) : null,
    user_not_registered: typeof user === "string" ? user : null,
    id_field,
    start_time,
    end_time,
    notes: null,
    room: null,
    mixed: false,
    id_status: ReservationStatus.CONFIRMED,
    id_reservation_fixed: null,
  };

  const res = await prisma.reservations.create({
    data: newReservation,
  });

  return NextResponse.json(normalizeIds(res));
}
