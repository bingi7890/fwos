import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, smsEnabled: true, fireTarget: true, monthly401kContribution: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["phone", "smsEnabled", "fireTarget", "monthly401kContribution"];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json(user);
}
