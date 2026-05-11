import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@/lib/enums";
import { normalizeIds } from "@/utils/normalizeIds";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user, weeks }: { user: string | number; weeks: number } =
    await req.json();

  const clampedWeeks = Math.max(1, Math.min(52, weeks ?? 4));

  const today = new Date();
  const start_time = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000,
  );
  const end_time = new Date(start_time.getTime() + 60 * 60 * 1000);

  const seriesId = BigInt(Date.now());

  const reservationsToCreate = Array.from({ length: clampedWeeks }, (_, i) => {
    const offsetMs = i * 7 * 24 * 60 * 60 * 1000;
    const date = new Date(today.getTime() + offsetMs);
    const st = new Date(start_time.getTime() + offsetMs);
    const et = new Date(end_time.getTime() + offsetMs);

    return {
      date,
      id_user: typeof user === "number" ? BigInt(user) : null,
      user_not_registered: typeof user === "string" ? user : null,
      id_field: 1,
      start_time: st,
      end_time: et,
      notes: null,
      room: null,
      mixed: false,
      id_status: ReservationStatus.CONFIRMED,
      id_reservation_fixed: seriesId,
    };
  });

  const results = await prisma.$transaction(
    reservationsToCreate.map((data) => prisma.reservations.create({ data })),
  );

  return NextResponse.json(normalizeIds(results[0]));
}
