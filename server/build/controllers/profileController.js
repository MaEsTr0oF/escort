"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProfileActive = exports.getAdminProfiles = exports.getServices = exports.verifyProfile = exports.deleteProfile = exports.updateProfile = exports.createProfile = exports.getProfileById = exports.getProfiles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfiles = async (req, res) => {
    try {
        const _a = req.query, { cityId } = _a, filters = __rest(_a, ["cityId"]);
        const where = {};
        if (cityId) {
            where.cityId = Number(cityId);
        }
        // Активные анкеты
        where.isActive = true;
        const profiles = await prisma.profile.findMany({
            where,
            include: {
                city: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(profiles);
    }
    catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
};
exports.getProfiles = getProfiles;
const getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.findUnique({
            where: { id: Number(id) },
            include: {
                city: true,
            },
        });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getProfileById = getProfileById;
const createProfile = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        // Преобразуем массивы в JSON строки
        const photos = Array.isArray(req.body.photos) ? JSON.stringify(req.body.photos) : req.body.photos;
        const services = Array.isArray(req.body.services) ? JSON.stringify(req.body.services) : req.body.services || '[]';
        const profileData = {
            name: req.body.name,
            age: Number(req.body.age),
            height: Number(req.body.height),
            weight: Number(req.body.weight),
            breastSize: Number(req.body.breastSize),
            phone: req.body.phone,
            description: req.body.description,
            photos,
            price1Hour: Number(req.body.price1Hour),
            price2Hours: Number(req.body.price2Hours),
            priceNight: Number(req.body.priceNight),
            priceExpress: Number(req.body.priceExpress || 0),
            cityId: Number(req.body.cityId),
            district: req.body.district,
            services,
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
            inCall: (_a = req.body.inCall) !== null && _a !== void 0 ? _a : true,
            outCall: (_b = req.body.outCall) !== null && _b !== void 0 ? _b : false,
            // Другие флаги
            isNonSmoking: req.body.isNonSmoking || false,
            isNew: (_c = req.body.isNew) !== null && _c !== void 0 ? _c : true,
            isWaitingCall: req.body.isWaitingCall || false,
            is24Hours: req.body.is24Hours || false,
            // Поля для группы
            isAlone: (_d = req.body.isAlone) !== null && _d !== void 0 ? _d : true,
            withFriend: req.body.withFriend || false,
            withFriends: req.body.withFriends || false,
        };
        console.log('Creating profile with data:', profileData);
        const profile = await prisma.profile.create({
            data: profileData,
            include: {
                city: true,
            },
        });
        console.log('Created profile:', profile);
        res.status(201).json(profile);
    }
    catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({
            error: 'Failed to create profile',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createProfile = createProfile;
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.update({
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
            where: { id: Number(id) }
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
