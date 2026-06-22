import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@panneistore.com';
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'PanneiStore Admin',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  });
  console.log('Password reset to Admin123!');
}

main().finally(() => prisma.$disconnect());
