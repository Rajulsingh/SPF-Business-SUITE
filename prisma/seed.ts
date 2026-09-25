import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.SEED_OWNER_USERNAME ?? "owner";
  const password = process.env.SEED_OWNER_PASSWORD ?? "changeme123";
  const name = process.env.SEED_OWNER_NAME ?? "Farm Owner";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists, skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      username,
      passwordHash,
      role: "OWNER",
    },
  });

  console.log(`Created owner account "${username}". Log in and change the password.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
