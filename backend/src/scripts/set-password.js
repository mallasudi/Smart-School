import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const USERNAME_OR_EMAIL = 'admin@smartschool.com';
const NEW_PASSWORD = 'admin123';

const run = async () => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: USERNAME_OR_EMAIL }, { email: USERNAME_OR_EMAIL }] }
  });
  if (!user) return console.log('User not found');
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  await prisma.user.update({ where: { user_id: user.user_id }, data: { password: hash } });
  console.log('✅ Password updated');
};
run().then(()=>process.exit(0));
