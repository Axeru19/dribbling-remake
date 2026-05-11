import { prisma } from "@/lib/prisma";
import { normalizeIds } from "@/utils/normalizeIds";
import { reservations } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  const reservation_: reservations = (await prisma.reservations.findUnique({
    where: { id: Number(id) },
    include: {
      users: true,
    },
  })) as reservations;

  return NextResponse.json(normalizeIds(reservation_));
}

export async function PUT(request: NextRequest) {
  const { reservation, updateSeries } = await request.json();

  const res = await prisma.reservations.update({
    where: { id: reservation.id },
    data: { ...reservation },
  });

  if (updateSeries && reservation.id_reservation_fixed != null) {
    const newStart = new Date(reservation.start_time);
    const newEnd = new Date(reservation.end_time);

    const others = await prisma.reservations.findMany({
      where: {
        id_reservation_fixed: BigInt(reservation.id_reservation_fixed),
        id: { not: reservation.id },
      },
      select: { id: true, start_time: true, end_time: true },
    });

    if (others.length > 0) {
      await prisma.$transaction(
        others.map((r) => {
          const st = new Date(r.start_time ?? reservation.start_time);
          st.setHours(newStart.getHours(), newStart.getMinutes(), 0, 0);
          const et = new Date(r.end_time ?? reservation.end_time);
          et.setHours(newEnd.getHours(), newEnd.getMinutes(), 0, 0);
          return prisma.reservations.update({
            where: { id: r.id },
            data: { start_time: st, end_time: et },
          });
        }),
      );
    }
  }

  return NextResponse.json(normalizeIds(res));
}
