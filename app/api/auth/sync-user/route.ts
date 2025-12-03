import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAction } from "@/lib/logger"; // <-- New Import

export async function POST(request: Request) {
  const requestBody = await request.json().catch(() => ({}));
  const { uid, email, name } = requestBody;

  try {
    // SAFETY CHECK: Ensure we actually have a User ID
    if (!uid || !email) {
      // LOG FAILURE
      await logAction({
        action: 'AUTH_SYNC_MISSING_DATA',
        details: { body: requestBody },
        success: false
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields (uid, email)" },
        { status: 400 }
      );
    }

    // Check if user exists before upsert to determine if it's REGISTER or LOGIN
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.id !== uid) {
      // --- CONFLICT RESOLUTION (Deletion of Stale Data) ---
      await logAction({
          action: 'STALE_USER_CLEANUP',
          details: { oldId: existingUser.id, newId: uid, email: email },
          success: true
      });
      await prisma.member.deleteMany({ where: { userId: existingUser.id } });
      await prisma.house.deleteMany({ where: { ownerId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
    
    // Upsert: Create user if not exists, Update if they do
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: { email, name },
      create: {
        id: uid, 
        email,
        name,
      },
    });

    // LOG SUCCESSFUL SYNC/LOGIN
    await logAction({
        userId: user.id,
        action: existingUser ? 'USER_LOGIN_SYNC' : 'USER_REGISTERED',
        details: { email: user.email, method: request.headers.get('x-auth-method') || 'Email/Password' }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    // LOG CRITICAL FAILURE
    const errorMessage = error instanceof Error ? error.message : "Database Sync Failed";
    await logAction({
        action: 'AUTH_SYNC_FAILED',
        details: { error: errorMessage, requestBody: requestBody },
        success: false
    });
    console.error("Database Sync Error:", error);
    
    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    );
  }
}