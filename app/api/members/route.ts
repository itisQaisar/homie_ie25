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
