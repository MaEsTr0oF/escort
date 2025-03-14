#!/bin/bash

echo "=== Добавление функционала верификации в админку ==="
cd /root/escort/server

# Добавляем маршрут верификации в сервер
cat > src/verify-route.js << 'END'
// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DEBUG] Запрос на верификацию профиля ${id}`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус верификации
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        isVerified: !profile.isVerified,
      },
    });
    
    console.log(`[DEBUG] Статус верификации профиля ${id} изменен на: ${updatedProfile.isVerified}`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при верификации профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус верификации' });
  }
});
END

# Добавление маршрута в index.js
echo "=== Проверяем и дополняем index.js маршрутом верификации ==="
grep -q "profiles/:id/verify" build/index.js
if [ $? -ne 0 ]; then
    # Маршрут не найден, добавляем его
    cat > patch-verify.js << 'END'
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Добавляем маршрут верификации перед комментарием "// The 'catchall' handler"
const verifyRoute = `
// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(\`[DEBUG] Запрос на верификацию профиля \${id}\`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус верификации
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        isVerified: !profile.isVerified,
      },
    });
    
    console.log(\`[DEBUG] Статус верификации профиля \${id} изменен на: \${updatedProfile.isVerified}\`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при верификации профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус верификации' });
  }
});

`;

// Добавляем маршрут в файл
indexContent = indexContent.replace('// The \'catchall\' handler', verifyRoute + '// The \'catchall\' handler');

fs.writeFileSync(indexPath, indexContent);
console.log('Маршрут верификации добавлен в index.js');
END

    node patch-verify.js
    echo "Маршрут верификации добавлен в index.js"
else
    echo "Маршрут верификации уже существует в index.js"
fi

# Перезапуск сервера для применения изменений
echo "=== Перезапуск сервера ==="
pm2 restart escort-server

echo "=== Проверка маршрута верификации ==="
curl -X PATCH http://localhost:3001/admin/profiles/1/verify -v

echo -e "\n=== Готово! ==="
echo "Теперь в админке должна появиться возможность верификации профилей"
echo "Также должно работать создание новых анкет"
