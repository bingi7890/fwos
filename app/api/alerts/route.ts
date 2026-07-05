import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const [alerts, count] = await Promise.all([
    prisma.alert.findMany({
      where: { userId: session.user.id, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.alert.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);

  return NextResponse.json({ alerts, count });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, isRead } = await req.json();
  const alert = await prisma.alert.update({
    where: { id, userId: session.user.id },
    data: { isRead },
  });
  return NextResponse.json(alert);
}
