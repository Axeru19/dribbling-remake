import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

function parseId(id: string) {
  const n = Number(id);
  if (!id || isNaN(n)) return null;
  return n;
}

// Toggle field status
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const fieldId = parseId(id);
    if (!fieldId) {
      return NextResponse.json({ error: "Invalid field ID" }, { status: 400 });
    }

    const status: boolean = await request.json();

    await prisma.fields.update({
      where: { id: fieldId },
      data: { status: !status },
    });

    return NextResponse.json({ message: "Field status updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating field status:", error);
    return NextResponse.json({ error: "Failed to update field status" }, { status: 500 });
  }
}

// Update price_per_hour
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const fieldId = parseId(id);
    if (!fieldId) {
      return NextResponse.json({ error: "Invalid field ID" }, { status: 400 });
    }

    const body = await request.json();
    const price = Number(body.price_per_hour);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    await prisma.fields.update({
      where: { id: fieldId },
      data: { price_per_hour: price },
    });

    return NextResponse.json({ message: "Price updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating field price:", error);
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
  }
}
