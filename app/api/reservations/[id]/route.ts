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

  if (!updateSeries || reservation.id_reservation_fixed == null) {
    const res = await prisma.reservations.update({
      where: { id: reservation.id },
      data: { ...reservation },
    });
    return NextResponse.json(normalizeIds(res));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, date, id_reservation_fixed, ...sharedData } = reservation;

  await prisma.reservations.updateMany({
    where: {
      id_reservation_fixed: BigInt(reservation.id_reservation_fixed),
      date: { gte: today },
    },
    data: sharedData,
  });

  const updated = await prisma.reservations.findUnique({
    where: { id: reservation.id },
  });

  return NextResponse.json(normalizeIds(updated));
}
