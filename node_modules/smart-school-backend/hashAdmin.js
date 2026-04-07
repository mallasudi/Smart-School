import bcrypt from "bcrypt";
import { prisma } from "./src/utils/prisma.js";

const fixPasswords = async () => {
  const users = await prisma.user.findMany();

  for (const u of users) {
    // only hash if it's not already hashed
    if (!u.password.startsWith("$2b$")) {
      const hashed = await bcrypt.hash(u.password, 10);
      await prisma.user.update({
        where: { user_id: u.user_id },
        data: { password: hashed },
      });
      console.log(`✅ Hashed password for: ${u.email}`);
    }
  }

  console.log("All plain passwords converted to bcrypt hashes.");
};

fixPasswords()
  .catch((e) => console.error(e))
  .finally(() => process.exit());
