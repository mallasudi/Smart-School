// backend/prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ===========================
  //  Create Admin User
  // ===========================
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@school.com" },
  });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@school.com",
        password: hashed,
        role: "admin",
        status: "Active",
      },
    });

    console.log("Admin created (admin@school.com / admin123)");
  } else {
    console.log("Admin already exists, skipping admin creation");
  }

  // ===========================
  //  Seed Grade Scale
  // ===========================
  console.log("Seeding Grade Scale...");

  // Clear previous grade scale (optional but keeps clean)
  await prisma.gradeScale.deleteMany();

  await prisma.gradeScale.createMany({
    data: [
      { min: 90, max: 100, grade: "A", gpa: 4.0 },
      { min: 80, max: 89, grade: "B", gpa: 3.0 },
      { min: 70, max: 79, grade: "C", gpa: 2.0 },
      { min: 60, max: 69, grade: "D", gpa: 1.0 },
      { min: 0,  max: 59, grade: "F", gpa: 0.0 },
    ],
  });

  console.log("Grade Scale seeded!");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
