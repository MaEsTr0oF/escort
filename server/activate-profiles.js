const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Активируем все анкеты
    const result = await prisma.profile.updateMany({
      where: {
        isActive: false
      },
      data: {
        isActive: true
      }
    });
    
    console.log(`Активировано ${result.count} анкет`);
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
