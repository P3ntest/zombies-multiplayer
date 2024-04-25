import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// create a new user
prisma.user.count().then((count) => {
  console.log(`There are ${count} users in the database`);
});
