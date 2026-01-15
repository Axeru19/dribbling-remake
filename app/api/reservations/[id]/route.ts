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
  const { reservation } = await request.json();
  // update reservation logic here

  const res = await prisma.reservations.update({
    where: { id: reservation.id },
    data: {
      ...reservation,
    },
  });

  return NextResponse.json(normalizeIds(res));
}
