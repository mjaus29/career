import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const progress = await prisma.progress.findMany();
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, value, target, unit } = body;

    const progress = await prisma.progress.upsert({
      where: { name },
      update: { value, target, unit },
      create: { name, value, target, unit },
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
