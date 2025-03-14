#!/bin/bash

echo "=== Исправление контроллера профилей ==="
cd /root/escort/server

# Создаем резервную копию
cp build/controllers/profileController.js build/controllers/profileController.js.bak

# Исправляем контроллер для обработки JSON полей
cat > build/controllers/profileController.js.fix << 'END'
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
END

# Проверяем текущий файл и копируем остальную часть
tail -n +100 build/controllers/profileController.js >> build/controllers/profileController.js.fix

# Применяем исправление
mv build/controllers/profileController.js.fix build/controllers/profileController.js

echo "=== Контроллер профилей исправлен ==="
