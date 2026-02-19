import { prisma } from "@/lib/prisma";
import { users } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

type ChangePasswordRequest = {
  password: string;
  newPassword: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id }: { id: string } = await params;
    const userId: string = id;
    const userIdNumber: number = Number(userId);

    // Controllo se l'ID dell'utente è valido
    if (!userId || isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: "ID utente non valido" },
        { status: 400 }
      );
    }

    // Recupero i dati dal corpo della richiesta
    const { password, newPassword }: ChangePasswordRequest = await req.json();

    // Validazione dei campi obbligatori
    if (!password || !newPassword) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    // Recupero l'utente dal database
    const user: users | null = await prisma.users.findUnique({
      where: { id: userIdNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Verifico che la password attuale sia corretta
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password!
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "La password attuale non è corretta" },
        { status: 400 }
      );
    }

    // Crittografo la nuova password
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    // Aggiorno la password nel database
    await prisma.users.update({
      where: { id: userIdNumber },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Password aggiornata con successo" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Errore durante il cambio password:", error);
    return NextResponse.json(
      { error: "Errore durante il cambio password" },
      { status: 500 }
    );
  }
}
