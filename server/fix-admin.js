const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Используем bcrypt вместо bcryptjs

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  try {
    // Удаляем существующую запись админа
    await prisma.admin.deleteMany();
    
    // Создаем нового администратора
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });
    
    console.log('Admin created:', admin);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
