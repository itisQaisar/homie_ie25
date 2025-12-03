import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST: Add a member by email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, houseId } = body;

    // 1. Find the user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "User not found. They must sign up for Homie first." },
        { status: 404 }
      );
    }

    // 2. CHECK FOR *ANY* EXISTING MEMBERSHIP (THE FIX)
    // Check if the user is already a member of ANY house.
    const existingMembershipInAnyHouse = await prisma.member.findFirst({
      where: { userId: userToAdd.id },
    });

    if (existingMembershipInAnyHouse) {
      // If the user is already a member of any house (including the target one)
      // we block the action based on the "single household" policy.
      return NextResponse.json(
        {
          error:
            "This user is already a member of a household and cannot be added to another.",
        },
        { status: 400 } // Use 400 Bad Request for business logic violation
      );
    }
    // Note: Since we check for ANY existing membership, the specific house check
    // from the original code (Step 2) is now redundant and removed.

    // 3. Add to house
    const member = await prisma.member.create({
      data: {
        userId: userToAdd.id,
        houseId,
        role: "member",
      },
      include: { user: true }, // Return user info so UI updates immediately
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Add Member Error:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Extract the Member ID from the URL query parameters
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required for deletion." },
        { status: 400 }
      );
    }

    // 2. Delete the member record
    // This effectively removes the user's membership from that household.
    const deletedMember = await prisma.member.delete({
      where: { id: memberId },
    });

    // 3. Return a success response
    return NextResponse.json(
      { success: true, deletedId: deletedMember.id },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Delete Member Error:", error);

    // Check for Prisma error code (P2025) which indicates record not found
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Membership not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete member record." },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// // POST: Add a member by email
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { email, houseId } = body;

//     // 1. Find the user by email
//     const userToAdd = await prisma.user.findUnique({
//       where: { email }
//     });

//     if (!userToAdd) {
//       return NextResponse.json({ error: "User not found. They must sign up for Homie first." }, { status: 404 });
//     }

//     // 2. Check if already a member
//     const existingMember = await prisma.member.findFirst({
//       where: { userId: userToAdd.id, houseId }
//     });

//     if (existingMember) {
//       return NextResponse.json({ error: "User is already a member" }, { status: 400 });
//     }

//     // 3. Add to house
//     const member = await prisma.member.create({
//       data: {
//         userId: userToAdd.id,
//         houseId,
//         role: "member"
//       },
//       include: { user: true } // Return user info so UI updates immediately
//     });

//     return NextResponse.json(member);
//   } catch (error) {
//     console.error("Add Member Error:", error);
//     return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
//   }
// }
