import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMobileLegends() {
  try {
    // Create Mobile Legends game
    const game = await prisma.game.create({
      data: {
        name: 'Mobile Legends: Bang Bang',
        status: 'ACTIVE',
        displayOrder: 0,
      },
    });

    console.log('Created game:', game);

    // Create packages
    const packages = [
      // Small Diamonds
      { packageName: '11 Diamond', price: 1000, category: 'Small Diamonds', displayOrder: 1 },
      { packageName: '22 Diamond', price: 2000, category: 'Small Diamonds', displayOrder: 2 },
      { packageName: '56 Diamond', price: 4500, category: 'Small Diamonds', displayOrder: 3 },
      { packageName: '112 Diamond', price: 8500, category: 'Small Diamonds', displayOrder: 4 },
      
      // Double Diamonds
      { packageName: '50+50', price: 4400, category: 'Double Diamonds', displayOrder: 1 },
      { packageName: '150+150', price: 11000, category: 'Double Diamonds', displayOrder: 2 },
      { packageName: '250+250', price: 18000, category: 'Double Diamonds', displayOrder: 3 },
      { packageName: '500+500', price: 36500, category: 'Double Diamonds', displayOrder: 4 },
      
      // Weekly Pass
      { packageName: 'Weekly Pass', price: 6700, category: 'Weekly Pass', displayOrder: 1 },
      
      // Standard Diamonds
      { packageName: '86 Diamond', price: 5500, category: 'Standard Diamonds', displayOrder: 1 },
      { packageName: '172 Diamond', price: 11000, category: 'Standard Diamonds', displayOrder: 2 },
      { packageName: '257 Diamond', price: 16500, category: 'Standard Diamonds', displayOrder: 3 },
      { packageName: '344 Diamond', price: 22000, category: 'Standard Diamonds', displayOrder: 4 },
      { packageName: '429 Diamond', price: 27500, category: 'Standard Diamonds', displayOrder: 5 },
      { packageName: '514 Diamond', price: 33000, category: 'Standard Diamonds', displayOrder: 6 },
      { packageName: '600 Diamond', price: 38500, category: 'Standard Diamonds', displayOrder: 7 },
      { packageName: '706 Diamond', price: 44000, category: 'Standard Diamonds', displayOrder: 8 },
      { packageName: '878 Diamond', price: 55000, category: 'Standard Diamonds', displayOrder: 9 },
      { packageName: '963 Diamond', price: 60500, category: 'Standard Diamonds', displayOrder: 10 },
      { packageName: '1050 Diamond', price: 66000, category: 'Standard Diamonds', displayOrder: 11 },
      { packageName: '1135 Diamond', price: 71500, category: 'Standard Diamonds', displayOrder: 12 },
      { packageName: '1412 Diamond', price: 88000, category: 'Standard Diamonds', displayOrder: 13 },
      { packageName: '2195 Diamond', price: 132000, category: 'Standard Diamonds', displayOrder: 14 },
      { packageName: '3688 Diamond', price: 220000, category: 'Standard Diamonds', displayOrder: 15 },
      { packageName: '5532 Diamond', price: 330000, category: 'Standard Diamonds', displayOrder: 16 },
      { packageName: '9288 Diamond', price: 550000, category: 'Standard Diamonds', displayOrder: 17 },
      
      // Bundles
      { packageName: 'Elite Bundle', price: 4600, category: 'Bundles', displayOrder: 1 },
      { packageName: 'Epic Bundle', price: 16800, category: 'Bundles', displayOrder: 2 },
      { packageName: 'Twilight Pass', price: 36000, category: 'Bundles', displayOrder: 3 },
    ];

    for (const pkg of packages) {
      await prisma.topUpPackage.create({
        data: {
          gameId: game.id,
          ...pkg,
          status: 'ACTIVE',
        },
      });
      console.log(`Created package: ${pkg.packageName}`);
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding Mobile Legends:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMobileLegends();
