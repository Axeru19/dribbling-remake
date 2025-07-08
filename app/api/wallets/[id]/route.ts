import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WalletUpdateType } from "@/types/enums";

interface WalletUpdateRequest {
  type: WalletUpdateType;
  amount: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const walletUpdateRequest: WalletUpdateRequest = await request.json();

  // Controllo se il portafoglio esiste
  const wallet = await prisma.wallets.findUnique({
    where: { id: Number(id) },
  });

  if (!wallet) {
    return NextResponse.json(
      { error: "Portafoglio non trovato" },
      { status: 404 }
    );
  }

  // Controllo se il tipo di aggiornamento è valido
  if (
    walletUpdateRequest.type !== WalletUpdateType.ADD &&
    walletUpdateRequest.type !== WalletUpdateType.SUBTRACT
  ) {
    return NextResponse.json(
      { error: "Tipo di aggiornamento non valido" },
      { status: 400 }
    );
  }

  // Controllo se l'importo è valido
  if (
    typeof walletUpdateRequest.amount !== "number" ||
    walletUpdateRequest.amount <= 0
  ) {
    return NextResponse.json({ error: "Importo non valido" }, { status: 400 });
  }

  // aggiorno il portafoglio

  try {
    await prisma.wallets.update({
      where: { id: Number(id) },
      data: {
        balance:
          parseFloat(wallet.balance?.toString()!) +
          walletUpdateRequest.amount *
            (walletUpdateRequest.type === WalletUpdateType.ADD ? 1 : -1),
      },
    });

    return NextResponse.json(
      { message: "Portafoglio aggiornato con successo" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore durante l'aggiornamento del portafoglio:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del portafoglio" },
      { status: 500 }
    );
  }
}
