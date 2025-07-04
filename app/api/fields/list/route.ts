import { prisma } from "@/lib/prisma";
import { fields } from "@prisma/client";
export async function GET() {
  const fields: fields[] = await prisma.fields.findMany({});

  return new Response(JSON.stringify(fields));
}
