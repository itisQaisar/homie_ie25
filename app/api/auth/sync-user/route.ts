import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, name } = body;

    // SAFETY CHECK: Ensure we actually have a User ID
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (uid, email)" },
        { status: 400 }
      );
    }

    // --- CONFLICT RESOLUTION LOGIC ---
    // Check if a user with this email exists but has a DIFFERENT ID.
    // This happens if you delete a user from Firebase but not NeonDB, then sign up again.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== uid) {
      console.log(`Stale user detected (Email: ${email}). Cleaning up old ID: ${existingUser.id}`);
      
      // We need to delete the old user to make room for the new one.
      // Due to Foreign Keys, we must delete dependent data first or rely on Cascades.
      // Since we can't rely on Cascades being set up perfectly in the DB yet, we do a manual cleanup.
      
      // 1. Delete Memberships linked to old user
      await prisma.member.deleteMany({
        where: { userId: existingUser.id }
      });

      // 2. Delete Houses owned by old user 
      // (Note: Ideally this should cascade delete tasks, but we'll try the user delete which might handle it if schema allows)
      await prisma.house.deleteMany({
        where: { ownerId: existingUser.id }
      });

      // 3. Finally, delete the stale user record
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      
      console.log("Stale user cleanup complete.");
    }
    // --------------------------------

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

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    console.error("Database Sync Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Database Sync Failed";

    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    );
  }
}