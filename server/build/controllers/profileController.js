"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProfile = exports.getProfilesByCity = exports.toggleProfileActive = exports.updateProfile = exports.getProfileById = exports.getAllProfiles = exports.getFilteredProfiles = exports.createProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Функция для создания профиля с корректной обработкой JSON полей
const createProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Вызвана функция createProfile с данными:", req.body);
        
        // Проверка обязательных полей
        const requiredFields = ['name', 'age', 'height', 'weight', 'breastSize', 'phone', 'description', 'cityId', 'price1Hour', 'price2Hours', 'priceNight'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Отсутствуют обязательные поля: ${missingFields.join(', ')}`
            });
        }
        
        // Обработка JSON полей
        let photosValue = req.body.photos || [];
        if (Array.isArray(photosValue)) {
            photosValue = JSON.stringify(photosValue);
        } else if (typeof photosValue !== 'string') {
            photosValue = JSON.stringify([]);
        }
        
        let servicesValue = req.body.services || [];
        if (Array.isArray(servicesValue)) {
            servicesValue = JSON.stringify(servicesValue);
        } else if (typeof servicesValue !== 'string') {
            servicesValue = JSON.stringify([]);
        }
        
        // Создание профиля
        const profile = yield prisma.profile.create({
            data: {
                name: req.body.name,
                age: Number(req.body.age),
                height: Number(req.body.height),
                weight: Number(req.body.weight),
                breastSize: Number(req.body.breastSize),
                phone: req.body.phone,
                description: req.body.description,
                photos: photosValue,
                price1Hour: Number(req.body.price1Hour),
                price2Hours: Number(req.body.price2Hours),
                priceNight: Number(req.body.priceNight),
                priceExpress: Number(req.body.priceExpress || 0),
                cityId: Number(req.body.cityId),
                district: req.body.district,
                services: servicesValue,
                // Дополнительные поля
                nationality: req.body.nationality,
                hairColor: req.body.hairColor,
                bikiniZone: req.body.bikiniZone,
                gender: req.body.gender || 'female',
                orientation: req.body.orientation || 'hetero',
                // Булевы поля с дефолтными значениями
                isVerified: req.body.isVerified || false,
                hasVideo: req.body.hasVideo || false,
                hasReviews: req.body.hasReviews || false,
                // Дополнительные булевы поля
                inCall: req.body.inCall ?? true,
                outCall: req.body.outCall ?? false,
                // Другие флаги
                isNonSmoking: req.body.isNonSmoking || false,
                isNew: req.body.isNew ?? true,
                isWaitingCall: req.body.isWaitingCall || false,
                is24Hours: req.body.is24Hours || false,
                // Поля для группы
                isAlone: req.body.isAlone ?? true,
                withFriend: req.body.withFriend || false,
                withFriends: req.body.withFriends || false,
            },
            include: {
                city: true
            }
        });
        
        console.log("Создан профиль:", profile);
        res.status(201).json(profile);
    }
    catch (error) {
        console.error("Ошибка при создании профиля:", error);
        res.status(500).json({
            error: 'Не удалось создать профиль',
            details: error.message
        });
    }
});
exports.createProfile = createProfile;

// Остальной код контроллера остается без изменений
            where: { id: Number(id) },
            data: req.body,
        });
        res.json(profile);
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.profile.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
};
exports.deleteProfile = deleteProfile;
const verifyProfile = async (req, res) => {
    try {
        const { id } = req.params;
        // Сначала получаем текущий профиль
        const existingProfile = await prisma.profile.findUnique({
            where: { id: Number(id) },
        });
        if (!existingProfile) {
            return res.status(404).json({ error: "Профиль не найден" });
        }
        // Теперь обновляем профиль
        const profile = await prisma.profile.update({
            where: { id: Number(id) },
            data: {
                isVerified: !existingProfile.isVerified,
            },
            include: {
                city: true,
            },
        });
        res.json(profile);
    }
    catch (error) {
        console.error('Error verifying profile:', error);
        res.status(500).json({ error: 'Failed to verify profile' });
    }
};
exports.verifyProfile = verifyProfile;
const getServices = async (_req, res) => {
    try {
        const services = [
            // Секс
            'classic', 'anal', 'lesbian', 'group_mmf', 'group_ffm', 'with_toys', 'in_car',
            // Ласки клиенту
            'blowjob_with_condom', 'blowjob_without_condom', 'deep_blowjob', 'car_blowjob',
            'anilingus_to_client', 'fisting_to_client', 'kisses',
            // BDSM и фетиш
            'light_domination', 'mistress', 'flogging', 'trampling', 'face_sitting',
            'strapon', 'bondage', 'slave', 'role_play', 'foot_fetish',
            'golden_rain_out', 'golden_rain_in', 'copro_out', 'copro_in', 'enema',
            // Эротический массаж
            'relaxing', 'professional', 'body_massage', 'lingam_massage', 'four_hands', 'urological',
            // Шоу
            'strip_pro', 'strip_amateur', 'belly_dance', 'twerk', 'lesbian_show',
            // Виртуальные услуги
            'sex_chat'
        ];
        console.log('Отправка списка услуг');
        res.json(services);
    }
    catch (error) {
        console.error('Ошибка при получении списка услуг:', error);
        res.status(500).json({ error: 'Не удалось получить список услуг' });
    }
};
exports.getServices = getServices;
const getAdminProfiles = async (req, res) => {
    try {
        const { limit } = req.query;
        const limitNumber = limit ? parseInt(limit) : undefined;
        const profiles = await prisma.profile.findMany({
            take: limitNumber,
            include: {
                city: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Found ${profiles.length} profiles for admin dashboard`);
        return res.json(profiles);
    }
    catch (error) {
        console.error('Error fetching admin profiles:', error);
        return res.status(500).json({ error: 'Failed to fetch profiles' });
    }
};
exports.getAdminProfiles = getAdminProfiles;
const toggleProfileActive = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[DEBUG] Переключение статуса профиля с ID: ${id}`);
        // Получаем текущий профиль
        const profile = await prisma.profile.findUnique({
            where: { id: Number(id) },
        });
        if (!profile) {
            console.log(`[DEBUG] Профиль с ID ${id} не найден`);
            return res.status(404).json({ error: "Профиль не найден" });
        }
        // Инвертируем статус isActive
        const updatedProfile = await prisma.profile.update({
            where: { id: Number(id) },
            data: { isActive: !profile.isActive },
        });
        console.log(`[DEBUG] Профиль ${id} обновлен, isActive: ${updatedProfile.isActive}`);
        res.json(updatedProfile);
    }
    catch (error) {
        console.error("Ошибка при изменении статуса профиля:", error);
        res.status(500).json({ error: "Не удалось изменить статус профиля" });
    }
};
exports.toggleProfileActive = toggleProfileActive;
