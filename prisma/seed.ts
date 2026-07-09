import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@canteevo.com' },
    update: {},
    create: {
      email: 'admin@canteevo.com',
      password: adminPassword,
      name: 'Admin Canteevo',
    },
  });

  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'user@canteevo.com' },
    update: {},
    create: {
      email: 'user@canteevo.com',
      password: userPassword,
      name: 'Test User',
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
