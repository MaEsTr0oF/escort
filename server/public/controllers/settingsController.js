"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSettings = exports.updateSettings = exports.getSettings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getSettings = async (_req, res) => {
    try {
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            // Если настройки не найдены, создаем их с дефолтными значениями
            settings = await prisma.settings.create({
                data: {} // Используются дефолтные значения из схемы
            });
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const settings = await prisma.settings.findFirst();
        if (!settings) {
            const newSettings = await prisma.settings.create({
                data: req.body
            });
            return res.json(newSettings);
        }
        const updatedSettings = await prisma.settings.update({
            where: { id: settings.id },
            data: req.body
        });
        res.json(updatedSettings);
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
// Публичный endpoint для получения только публичных настроек
const getPublicSettings = async (_req, res) => {
    try {
        const settings = await prisma.settings.findFirst();
        if (!settings) {
            return res.json({
                telegramUsername: 'your_admin_username',
                maintenanceMode: false
            });
        }
        // Возвращаем только публичные настройки
        res.json({
            telegramUsername: settings.telegramUsername,
            maintenanceMode: settings.maintenanceMode
        });
    }
    catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ error: 'Failed to fetch public settings' });
    }
};
exports.getPublicSettings = getPublicSettings;
