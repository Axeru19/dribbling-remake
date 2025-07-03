import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt'
import { User } from "@/types/types";


export async function POST(request: NextRequest) {
    try{
        const body: User = await request.json();
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
            }
        });

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {

        // errore generico
        console.error("Error creating user:", error);

        //errore mail gia esistente
        if (error instanceof Error && error.message.includes("Unique constraint failed on the fields: (`email`)")) {
            return NextResponse.json({ message: "Email already exists" }, { status: 409 });
        } else {
            return NextResponse.json({ message: "An error occurred while creating the user" }, { status: 500 });
        }
    }
}