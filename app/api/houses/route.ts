import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAction } from "@/lib/logger";

// GET: Fetch all houses for a specific user (No log needed for READ)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId)
    return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const houses = await prisma.house.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
      },
      include: {
        members: { include: { user: true } },
      },
    });
    return NextResponse.json(houses);
  } catch (error) {
    console.error("Fetch Houses Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch houses" },
      { status: 500 }
    );
  }
}

// POST: Create a new house
export async function POST(request: Request) {
  const requestBody = await request.json().catch(() => ({}));
  const { name, userId } = requestBody;

  try {
    if (!name || !userId) {
      return NextResponse.json(
        { error: "Name and User ID required" },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found in database. Please log out and back in." },
        { status: 404 }
      );
    }

    const house = await prisma.house.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: { userId: userId, role: "admin" },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    // LOG SUCCESSFUL HOUSE CREATION
    await logAction({
      userId: userId,
      action: "HOUSE_CREATED",
      details: { houseId: house.id, houseName: name },
    });

    return NextResponse.json(house);
  } catch (error) {
    // LOG FAILURE
    await logAction({
      userId: userId,
      action: "HOUSE_CREATION_FAILED",
      details: { error: String(error), requestBody: requestBody },
      success: false,
    });
    console.error("Create House Error:", error);
    return NextResponse.json(
      { error: "Failed to create house" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body; // Expecting the house ID and the new name

    if (!id || !name) {
      return NextResponse.json(
        { error: "House ID and name are required." },
        { status: 400 }
      );
    }

    const updatedHouse = await prisma.house.update({
      where: { id: id },
      data: { name: name },
    });

    return NextResponse.json(updatedHouse);
  } catch (error) {
    console.error("Update House Error:", error);
    return NextResponse.json(
      { error: "Failed to update house name." },
      { status: 500 }
    );
  }
}
// DELETE, PUT are omitted for brevity, but should also be logged if implemented.
