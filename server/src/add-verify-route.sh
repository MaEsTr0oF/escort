#!/bin/bash

# Создаем бэкап текущего файла
cp /root/escort/server/src/index.ts /root/escort/server/src/index.ts.bak

# Ищем подходящее место для добавления маршрута
line_num=$(grep -n "app.use('/admin'" /root/escort/server/src/index.ts | head -1 | cut -d':' -f1)

if [ -z "$line_num" ]; then
  echo "Не удалось найти подходящее место для добавления маршрута верификации"
  exit 1
fi

# Добавляем маршрут верификации перед line_num
sed -i "${line_num}i\
// Маршрут для верификации профиля\n\
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {\n\
  try {\n\
    const { id } = req.params;\n\
    \n\
    // Получаем текущий профиль\n\
    const profile = await prisma.profile.findUnique({\n\
      where: { id: Number(id) },\n\
    });\n\
    \n\
    if (!profile) {\n\
      return res.status(404).json({ error: 'Профиль не найден' });\n\
    }\n\
    \n\
    // Инвертируем статус верификации\n\
    const updatedProfile = await prisma.profile.update({\n\
      where: { id: Number(id) },\n\
      data: {\n\
        isVerified: !profile.isVerified,\n\
      },\n\
    });\n\
    \n\
    console.log(\`Статус верификации профиля \${id} изменен на: \${updatedProfile.isVerified}\`);\n\
    res.json(updatedProfile);\n\
  } catch (error) {\n\
    console.error('Ошибка при верификации профиля:', error);\n\
    res.status(500).json({ error: 'Не удалось изменить статус верификации' });\n\
  }\n\
});\n" /root/escort/server/src/index.ts

echo "Маршрут верификации добавлен в index.ts"
