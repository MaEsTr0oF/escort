"use strict";
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
    }
    catch (error) {
        console.error('Ошибка при верификации профиля:', error);
        res.status(500).json({ error: 'Не удалось изменить статус верификации' });
    }
});
