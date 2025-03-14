const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Проверяем наличие настроек CORS
if (!indexContent.includes('app.use(cors())')) {
    console.log('Добавляем настройки CORS...');
    
    // Ищем блок импортов
    const importsBlock = indexContent.match(/const express = require\('express'\);[\s\S]*?const app = express\(\);/);
    
    if (importsBlock) {
        const newImportsBlock = `const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const prisma = new PrismaClient();
const app = express();

// Включаем CORS
app.use(cors());`;

        // Заменяем блок импортов
        indexContent = indexContent.replace(importsBlock[0], newImportsBlock);
        fs.writeFileSync(indexPath, indexContent);
        console.log('Настройки CORS успешно добавлены в index.js');
    } else {
        console.log('Не удалось найти блок импортов в index.js');
    }
} else {
    console.log('Настройки CORS уже присутствуют в index.js');
}
