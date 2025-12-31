import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.progress.createMany({
    data: [
      { name: "JSM", value: 0, target: 100, unit: "percent" },
      { name: "GFE", value: 0, target: 574, unit: "flashcards" },
      { name: "FEM", value: 0, target: 4, unit: "hours" },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
