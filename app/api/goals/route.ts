import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const goal = await prisma.goal.create({
    data: { ...body, userId: session.user.id },
  });
  return NextResponse.json(goal);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  const goal = await prisma.goal.update({
    where: { id, userId: session.user.id },
    data: {
      ...data,
      ...(data.isCompleted && !data.completedAt ? { completedAt: new Date() } : {}),
    },
  });

  if (goal.isCompleted) {
    await prisma.alert.create({
      data: {
        userId: session.user.id,
        type: "GOAL_COMPLETED",
        title: "Goal Completed! 🎉",
        message: `You completed your goal: ${goal.name}!`,
        severity: "SUCCESS",
      },
    });
  }

  return NextResponse.json(goal);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.goal.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
