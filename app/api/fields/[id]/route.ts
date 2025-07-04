import { prisma } from "@/lib/prisma";
import { th } from "date-fns/locale";
import { NextResponse } from "next/server";
import { boolean } from "zod";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const status: boolean = await request.json();

    // toggle status of a field
    const { id } = await params;
    const fieldId = id;

    // Check if the field ID is valid
    if (!fieldId || isNaN(Number(fieldId))) {
      throw new Error("Invalid field ID");
    }

    // Toggle the status of the field
    const updatedField = await prisma.fields.update({
      where: { id: Number(fieldId) },
      data: { status: !status },
    });

    return NextResponse.json(
      { message: "Field status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating field status:", error);
    return NextResponse.json(
      { error: "Failed to update field status" },
      { status: 500 }
    );
  }
}
