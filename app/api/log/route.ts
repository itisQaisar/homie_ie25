import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { userId, action, details, success } = await request.json();

    // Log to the database (This is the only place Prisma runs)
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: action,
        details: details as Prisma.InputJsonValue,
        success: success,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // CRITICAL: Log error to Vercel/server console but return success to client
    console.error("CRITICAL: Failed to write to Audit Log:", error);
    
    // Always return success to the client so logging failure doesn't block the UI
    return NextResponse.json({ success: false, reason: "Logging failed on server" }, { status: 200 });
  }
}