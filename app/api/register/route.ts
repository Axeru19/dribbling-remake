import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AppUser } from "@/types/types";
import { wallets } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body: AppUser = await request.json();
    const hashedpassword = await bcrypt.hash(body.password!, 10);

    const user = await prisma.users.create({
      data: {
        name: body.name,
        surname: body.surname,
        nickname: body.nickname,
        password: hashedpassword,
        email: body.email,
        telephone: body.telephone,
        role_id: body.role_id || 1, // Default to role_id 1 if not provided
      },
    });

    // create a wallet for the user
    await prisma.wallets.create({
      data: {
        balance: 0,
        id_user: user.id,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    // errore generico
    console.error("Error creating user:", error);

    //errore mail gia esistente
    if (
      error instanceof Error &&
      error.message.includes(
        "Unique constraint failed on the fields: (`email`)"
      )
    ) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        { message: "An error occurred while creating the user" },
        { status: 500 }
      );
    }
  }
}
