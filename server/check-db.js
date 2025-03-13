const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем администраторов
    const admins = await prisma.admin.findMany();
    console.log('Admins:', admins);
    
    // Проверяем города
    const cities = await prisma.city.findMany();
    console.log('Cities:', cities);
    
    // Проверяем профили
    const profiles = await prisma.profile.findMany();
    console.log('Profiles count:', profiles.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
