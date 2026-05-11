import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const body: { status: number } = await request.json();
    const { seriesId } = await params;

    await prisma.reservations.updateMany({
      where: { id_reservation_fixed: BigInt(seriesId) },
      data: { id_status: body.status },
    });

    return NextResponse.json(
      { message: "Series status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating series status:", error);
    return NextResponse.json(
      { error: "Failed to update series status" },
      { status: 500 }
    );
  }
}
