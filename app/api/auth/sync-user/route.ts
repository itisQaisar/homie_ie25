import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, name } = body;

    // Create the user in Postgres
    // upsert means: Create if not exists, Update if exists (safe)
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: { email, name },
      create: {
        id: uid, // We use the Firebase UID as the Postgres Primary Key
        email,
        name,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: "DB Error" }, { status: 500 });
  }
}