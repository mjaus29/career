import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dailyProgress = await prisma.dailyProgress.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(dailyProgress);
  } catch (error) {
    console.error("Error fetching daily progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, gfeCards, femHours, jsmPercent } = body;

    // Use the date string directly without any Date conversion
    // Store as string in YYYY-MM-DD format to avoid timezone issues
    const dateOnly = new Date(date + "T00:00:00.000Z"); // Force UTC interpretation

    const dailyProgress = await prisma.dailyProgress.upsert({
      where: { date: dateOnly },
      update: { gfeCards, femHours, jsmPercent },
      create: { date: dateOnly, gfeCards, femHours, jsmPercent },
    });

    return NextResponse.json(dailyProgress);
  } catch (error) {
    console.error("Error updating daily progress:", error);
    return NextResponse.json(
      { error: "Failed to update daily progress" },
      { status: 500 }
    );
  }
}
