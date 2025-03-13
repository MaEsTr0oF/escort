"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProfile = exports.deleteProfile = exports.updateProfile = exports.createProfile = exports.getProfileById = exports.getProfiles = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.findUnique({
            where: { id: parseInt(id) },
            include: { city: true }
        });
        if (!profile) {
            return res.status(404).json({ message: 'Профиль не найден' });
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
exports.getProfile = getProfile;
const getProfiles = async (req, res) => {
    var _a;
    try {
        const { cityId, district, services, priceRange, age, height, weight, breastSize, isVerified, } = req.query;
        // Проверяем наличие токена администратора в заголовках
        const isAdminRequest = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer ');
        console.log('Request path:', req.path);
        console.log('Is admin request:', isAdminRequest);
        console.log('Authorization header:', req.headers.authorization);
        const filters = {
            isActive: isAdminRequest ? undefined : true,
            cityId: cityId ? Number(cityId) : undefined,
        };
        if (district)
            filters.district = district;
        if (breastSize)
            filters.breastSize = Number(breastSize);
        if (isVerified)
            filters.isVerified = isVerified === 'true';
        if (services) {
            filters.services = {
                hasEvery: Array.isArray(services) ? services : [services],
            };
        }
        if (priceRange) {
            const { min, max } = JSON.parse(priceRange);
            if (min)
                filters.price1Hour = { gte: Number(min) };
            if (max)
                filters.price1Hour = Object.assign(Object.assign({}, filters.price1Hour), { lte: Number(max) });
        }
        // Удаляем undefined значения из фильтров
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });
        console.log('Applied filters:', filters);
        const profiles = await prisma.profile.findMany({
            where: filters,
            include: {
                city: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Found ${profiles.length} profiles`);
        res.json(profiles);
    }
    catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({
            error: 'Failed to fetch profiles',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
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
        console.log('Received profile data:', req.body);
        // Проверяем обязательные поля
        const requiredFields = [
            'name',
            'age',
            'height',
            'weight',
            'breastSize',
            'phone',
            'description',
            'photos',
            'price1Hour',
            'price2Hours',
            'priceNight',
            'cityId'
        ];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                error: 'Missing required fields',
                fields: missingFields
            });
        }
        // Проверяем валидность числовых полей
        const numericFields = {
            age: { min: 18, max: 70 },
            height: { min: 140, max: 195 },
            weight: { min: 40, max: 110 },
            breastSize: { min: 1, max: 10 },
            price1Hour: { min: 0 },
            price2Hours: { min: 0 },
            priceNight: { min: 0 },
            priceExpress: { min: 0 }
        };
        for (const [field, range] of Object.entries(numericFields)) {
            const value = Number(req.body[field]);
            if (isNaN(value) || value < range.min || (range.max !== undefined && value > range.max)) {
                console.log('Invalid numeric field:', field, 'value:', value, 'range:', range);
                return res.status(400).json({
                    error: `Invalid value for ${field}`,
                    field,
                    range
                });
            }
        }
        // Создаем профиль с валидными данными
        const profileData = {
            name: req.body.name,
            age: Number(req.body.age),
            height: Number(req.body.height),
            weight: Number(req.body.weight),
            breastSize: Number(req.body.breastSize),
            phone: req.body.phone,
            description: req.body.description,
            photos: req.body.photos,
            price1Hour: Number(req.body.price1Hour),
            price2Hours: Number(req.body.price2Hours),
            priceNight: Number(req.body.priceNight),
            priceExpress: Number(req.body.priceExpress || 0),
            cityId: Number(req.body.cityId),
            district: req.body.district,
            services: req.body.services || [],
            // Appearance
            nationality: req.body.nationality,
            hairColor: req.body.hairColor,
            bikiniZone: req.body.bikiniZone,
            gender: req.body.gender || 'female',
            orientation: req.body.orientation || 'hetero',
            // Verification
            isVerified: req.body.isVerified || false,
            hasVideo: req.body.hasVideo || false,
            hasReviews: req.body.hasReviews || false,
            // Location
            inCall: (_a = req.body.inCall) !== null && _a !== void 0 ? _a : true,
            outCall: (_b = req.body.outCall) !== null && _b !== void 0 ? _b : false,
            // Additional filters
            isNonSmoking: req.body.isNonSmoking || false,
            isNew: (_c = req.body.isNew) !== null && _c !== void 0 ? _c : true,
            isWaitingCall: req.body.isWaitingCall || false,
            is24Hours: req.body.is24Hours || false,
            // Neighbors
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
        const profile = await prisma.profile.update({
            where: { id: Number(id) },
            data: {
                isVerified: true,
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
