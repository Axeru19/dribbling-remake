import { prisma } from "@/lib/prisma";
import { AppUser } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { users } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id;

    // Controllo se l'ID dell'utente è valido
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: "ID utente non valido" },
        { status: 400 }
      );
    }

    // Recupero i dati dal corpo della richiesta
    const user: AppUser = await req.json();

    // se mi è stata inviata la password, la crittografo

    const dataUpdate: Partial<users> = {
      name: user.name!,
      surname: user.surname!,
      telephone: user.telephone!,
      nickname: user.nickname!,
      email: user.email!,
    };

    if (user.password) {
      const hashedpassword = await bcrypt.hash(user.password!, 10);
      dataUpdate.password = hashedpassword;
    }

    // Aggiorno l'utente nel database
    const updatedUser = await prisma.users.update({
      where: { id: Number(userId) },
      data: dataUpdate,
    });

    // Se l'utente non esiste, restituisco un errore
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }
    // Restituisco la risposta con l'utente aggiornato
    return NextResponse.json(
      { message: "Utente aggiornato con successo" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'utente:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento dell'utente" },
      { status: 500 }
    );
  }
}
