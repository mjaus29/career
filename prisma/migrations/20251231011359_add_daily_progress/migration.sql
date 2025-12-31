-- CreateTable
CREATE TABLE "DailyProgress" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "gfeCards" INTEGER NOT NULL DEFAULT 0,
    "femHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyProgress_date_key" ON "DailyProgress"("date");
