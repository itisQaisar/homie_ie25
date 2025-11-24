import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch all houses for a specific user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const houses = await prisma.house.findMany({
      where: {
        OR: [
          { ownerId: userId }, 
          { members: { some: { userId: userId } } } 
        ]
      },
      include: {
        members: { include: { user: true } } // Include member details
      }
    });
    return NextResponse.json(houses);
  } catch (error) {
    console.error("Fetch Houses Error:", error);
    return NextResponse.json({ error: "Failed to fetch houses" }, { status: 500 });
  }
}

// POST: Create a new house
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, userId } = body;

    if (!name || !userId) {
      return NextResponse.json({ error: "Name and User ID required" }, { status: 400 });
    }

    // Check if User exists
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json({ error: "User not found in database. Please log out and back in." }, { status: 404 });
    }

    const house = await prisma.house.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: { userId: userId, role: "admin" }
        }
      },
      // FIX: Return the members so the UI updates immediately
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    return NextResponse.json(house);
  } catch (error) {
    console.error("Create House Error:", error);
    return NextResponse.json({ error: "Failed to create house" }, { status: 500 });
  }
}