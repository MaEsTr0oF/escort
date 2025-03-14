const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Получаем ID городов
    const cities = await prisma.city.findMany();
    if (cities.length === 0) {
      console.error('No cities found');
      return;
    }

    // Создаем тестовые профили
    for (let i = 0; i < 3; i++) {
      const cityId = cities[i % cities.length].id;
      const profile = await prisma.profile.create({
        data: {
          name: `Анкета ${i+1}`,
          age: 20 + i,
          height: 165 + i,
          weight: 50 + i,
          breastSize: 2 + (i % 3),
          phone: `+7900${i}00${i}00${i}`,
          description: `Описание анкеты ${i+1}`,
          photos: [`https://example.com/photo${i+1}.jpg`],
          price1Hour: 5000 + i*1000,
          price2Hours: 10000 + i*2000,
          priceNight: 30000 + i*5000,
          cityId: cityId,
          isActive: true,
          isVerified: i % 2 === 0,
          services: ['classic', 'massage'],
          gender: 'female'
        }
      });
      console.log(`Created profile ${i+1}:`, profile.id);
    }

    console.log('Done creating mock profiles');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
