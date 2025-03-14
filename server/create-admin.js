const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'admin123';
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    // Удаляем существующего админа, если он есть
    await prisma.admin.deleteMany({});
    
    // Создаем нового администратора
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    });
    
    console.log('Admin created:', admin);
    console.log('Login with:');
    console.log('Username:', username);
    console.log('Password:', password);
    
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
