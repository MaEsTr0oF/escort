"use strict";
// Это временный файл для исправления маршрута создания профиля
// Создаем новый маршрут для обработки создания профилей
app.post('/temp-create-profile', authMiddleware, async (req, res) => {
    try {
        console.log('Получен запрос на создание профиля:', req.body);
        // Преобразуем photos в строковый формат, если они приходят как массив
        const photosData = Array.isArray(req.body.photos) ? JSON.stringify(req.body.photos) : req.body.photos;
        console.log('Преобразованные фотографии:', photosData);
        // Преобразуем services аналогично
        const servicesData = Array.isArray(req.body.services) ? JSON.stringify(req.body.services) : (req.body.services || '[]');
        // Создаем данные профиля с преобразованными полями
        const profileData = Object.assign(Object.assign({}, req.body), { photos: photosData, services: servicesData });
        // Создаем профиль
        const profile = await prisma.profile.create({
            data: profileData,
            include: {
                city: true
            }
        });
        console.log('Профиль успешно создан:', profile);
        res.status(201).json(profile);
    }
    catch (error) {
        console.error('Ошибка при создании профиля:', error);
        res.status(500).json({
            error: 'Не удалось создать профиль',
            details: error.message
        });
    }
});
console.log('Временный маршрут для создания профилей добавлен');
