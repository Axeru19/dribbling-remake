import { reservations } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { normalizeIds } from "@/utils/normalizeIds";

export async function POST(req: NextRequest) {
  const reservation: Omit<reservations, "id"> = await req.json();

  const res = await prisma.reservations.create({
    data: reservation,
  });

  return NextResponse.json(normalizeIds(res));
}
