"use strict";
// Замените данный фрагмент в функции createProfile в файле profileController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = void 0;
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
        // Важно: преобразуем photos в строку JSON, если это массив или объект
        let photosValue = req.body.photos;
        if (typeof photosValue !== 'string') {
            photosValue = JSON.stringify(photosValue);
        }
        // Также проверяем и преобразуем services в строку JSON
        let servicesValue = req.body.services || [];
        if (typeof servicesValue !== 'string') {
            servicesValue = JSON.stringify(servicesValue);
        }
        const profileData = {
            name: req.body.name,
            age: Number(req.body.age),
            height: Number(req.body.height),
            weight: Number(req.body.weight),
            breastSize: Number(req.body.breastSize),
            phone: req.body.phone,
            description: req.body.description,
            photos: photosValue, // Используем преобразованное значение
            price1Hour: Number(req.body.price1Hour),
            price2Hours: Number(req.body.price2Hours),
            priceNight: Number(req.body.priceNight),
            priceExpress: Number(req.body.priceExpress || 0),
            cityId: Number(req.body.cityId),
            district: req.body.district,
            services: servicesValue, // Используем преобразованное значение
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
