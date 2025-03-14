const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // Создаем админа, если его нет
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      });
      console.log('✅ Админ создан');
    } else {
      console.log('👍 Админ уже существует');
    }

    // Создаем города, если их нет
    const cityCount = await prisma.city.count();
    if (cityCount === 0) {
      await prisma.city.createMany({
        data: [
          { name: 'Москва' },
          { name: 'Санкт-Петербург' },
          { name: 'Екатеринбург' },
          { name: 'Новосибирск' },
          { name: 'Казань' }
        ]
      });
      console.log('✅ Города созданы');
    } else {
      console.log('👍 Города уже существуют');
    }

    // Получаем ID города Москва
    const moscow = await prisma.city.findFirst({
      where: { name: 'Москва' }
    });

    if (moscow) {
      // Создаем тестовые профили
      const profiles = await prisma.profile.findMany();
      if (profiles.length === 0) {
        await prisma.profile.createMany({
          data: [
            {
              name: 'Анна',
              age: 25,
              height: 168,
              weight: 55,
              breastSize: 3,
              phone: '+7 (999) 123-45-67',
              description: 'Красивая девушка, которая ждет тебя',
              photos: JSON.stringify(['photo1.jpg', 'photo2.jpg']),
              price1Hour: 4000,
              price2Hours: 7000,
              priceNight: 20000,
              services: JSON.stringify(['Классический', 'Массаж']),
              cityId: moscow.id,
              district: 'Центр',
              isVerified: true,
              isActive: true
            },
            {
              name: 'Мария',
              age: 27,
              height: 170,
              weight: 58,
              breastSize: 2,
              phone: '+7 (999) 987-65-43',
              description: 'Опытная и страстная',
              photos: JSON.stringify(['photo3.jpg', 'photo4.jpg']),
              price1Hour: 5000,
              price2Hours: 9000,
              priceNight: 25000,
              services: JSON.stringify(['Классический', 'Анальный', 'Массаж']),
              cityId: moscow.id,
              district: 'Арбат',
              isVerified: true,
              isActive: true
            }
          ]
        });
        console.log('✅ Профили созданы');
      } else {
        console.log('👍 Профили уже существуют');
      }
    }

    // Создаем настройки, если их нет
    const settingsCount = await prisma.settings.count();
    if (settingsCount === 0) {
      await prisma.settings.create({
        data: {
          telegramUsername: 'admin',
          notificationsEnabled: true,
          autoModeration: false,
          defaultCity: 'Москва',
          watermarkEnabled: true,
          watermarkText: '@escort',
          minPhotoCount: 3,
          maxPhotoCount: 10,
          defaultPriceHour: 5000,
          defaultPriceTwoHours: 10000,
          defaultPriceNight: 30000
        }
      });
      console.log('✅ Настройки созданы');
    } else {
      console.log('👍 Настройки уже существуют');
    }

    console.log('✅ Тестовые данные успешно добавлены');

  } catch (error) {
    console.error('❌ Ошибка при создании тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
