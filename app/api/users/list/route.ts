import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppUser } from "@/types/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filter: string = body.filter || "";

    // cerco per nome cognome mail nickname e numero di telefono
    const users = (await prisma.users.findMany({
      where: {
        OR: [
          { name: { contains: filter, mode: "insensitive" } },
          { surname: { contains: filter, mode: "insensitive" } },
          { email: { contains: filter, mode: "insensitive" } },
          { nickname: { contains: filter, mode: "insensitive" } },
          { telephone: { contains: filter, mode: "insensitive" } },
        ],
      },
    })) as unknown as AppUser[];

    // handle biserial id error

    const safeUsers = users.map((user) => ({
      ...user,
      id: user?.id!.toString(), // 👈 evita l'errore di serializzazione
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
