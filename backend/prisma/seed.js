"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = 'admin@panneistore.com';
    const adminPassword = 'Admin123!';
    const passwordHash = await bcryptjs_1.default.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: 'ADMIN', passwordHash, isVerified: true, isActive: true },
        create: {
            email: adminEmail,
            passwordHash,
            name: 'PanneiStore Admin',
            role: 'ADMIN',
            isVerified: true,
            isActive: true,
        },
    });
    await prisma.seller.upsert({
        where: { userId: admin.id },
        update: { shopName: 'PanneiStore', isApproved: true, isActive: true },
        create: {
            userId: admin.id,
            shopName: 'PanneiStore',
            isApproved: true,
            isActive: true,
        },
    });
    console.log('');
    console.log('✅ Local database seeded');
    console.log('──────────────────────────────────────');
    console.log('Admin panel login:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('  URL:      http://localhost:3000/admin');
    console.log('──────────────────────────────────────');
    console.log('');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map