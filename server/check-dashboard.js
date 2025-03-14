const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Статистика для дашборда
    const profilesCount = await prisma.profile.count();
    const citiesCount = await prisma.city.count();
    const adminsCount = await prisma.admin.count();
    
    console.log('Dashboard stats:', {
      profiles: profilesCount,
      cities: citiesCount,
      admins: adminsCount
    });
    
    // Последние профили
    const latestProfiles = await prisma.profile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { city: true }
    });
    
    console.log('Latest profiles:', latestProfiles);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
