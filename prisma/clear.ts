import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Clearing database...');

    // Delete in reverse dependency order
    await prisma.user.deleteMany({});

    console.log('✅ Database cleared!');
}

main()
    .catch((error) => {
        console.error('❌ Clear failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
