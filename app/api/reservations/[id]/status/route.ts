import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: { status: number } = await request.json();
    const { id } = await params;

    // Update the reservation status in the database
    await prisma.reservations.update({
      where: { id: Number(id) },
      data: { id_status: body.status },
    });

    return NextResponse.json(
      { message: "Reservation status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return NextResponse.json(
      { error: "Failed to update reservation status" },
      { status: 500 }
    );
  }
}
