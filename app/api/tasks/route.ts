import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch tasks for a specific house
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const houseId = searchParams.get("houseId");

  if (!houseId) return NextResponse.json({ error: "House ID required" }, { status: 400 });

  try {
    const tasks = await prisma.task.findMany({
      where: { houseId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST: Create a task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, houseId, assignedTo, deadline } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        houseId,
        assignedTo,
        deadline: new Date(deadline),
        completed: false
      }
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PUT: Update a task (e.g., mark as completed)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, completed } = body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        completed,
        completedAt: completed ? new Date() : null
      }
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Update Task Error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE: Remove a task
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}