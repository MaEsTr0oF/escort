const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  try {
    // Удаляем существующую запись, если она есть
    await prisma.admin.deleteMany({
      where: { username: 'admin' }
    });
    
    // Создаем нового администратора
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });
    
    console.log('Admin created:', admin);
    
    // Проверяем, что администратор создан
    const allAdmins = await prisma.admin.findMany();
    console.log('All admins:', allAdmins);
    
    // Добавляем тестовый город
    const city = await prisma.city.create({
      data: {
        name: 'Москва'
      }
    });
    
    console.log('City created:', city);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
