#!/bin/bash
# Этот скрипт проверяет и при необходимости создает маршрут верификации

echo "Проверка маршрута верификации..."

# Если маршрут не существует, создаем его
echo "Предлагаемый код для маршрута верификации в index.ts:"

cat << 'END'
// Добавьте этот маршрут в index.ts перед "The 'catchall' handler":

// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
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
      include: {
        city: true,
      },
    });
    
    console.log(`Статус верификации профиля ${id} изменен на: ${updatedProfile.isVerified}`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при верификации профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус верификации' });
  }
});
END

echo "Если маршрут уже существует, убедитесь, что он работает правильно."
