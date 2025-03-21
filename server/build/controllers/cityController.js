"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistrictsByCityId = exports.deleteCity = exports.updateCity = exports.createCity = exports.getCities = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCities = async (_req, res) => {
    try {
        console.log('Fetching cities...');
        const cities = await prisma.city.findMany({
            include: {
                _count: {
                    select: { profiles: true }
                }
            }
        });
        console.log('Found cities:', cities);
        // Возвращаем данные в ожидаемом клиентом формате
        res.json(cities);
    }
    catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
};
exports.getCities = getCities;
const createCity = async (req, res) => {
    try {
        const city = await prisma.city.create({
            data: req.body,
        });
        res.status(201).json(city);
    }
    catch (error) {
        console.error('Error creating city:', error);
        res.status(500).json({ error: 'Failed to create city' });
    }
};
exports.createCity = createCity;
const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await prisma.city.update({
            where: { id: Number(id) },
            data: req.body,
        });
        res.json(city);
    }
    catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ error: 'Failed to update city' });
    }
};
exports.updateCity = updateCity;
const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.city.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({ error: 'Failed to delete city' });
    }
};
exports.deleteCity = deleteCity;
const getDistrictsByCityId = async (req, res) => {
    try {
        const { cityId } = req.params;
        console.log('Fetching districts for city ID:', cityId);
        // Находим все анкеты в указанном городе
        const profiles = await prisma.profile.findMany({
            where: {
                cityId: Number(cityId),
                district: { not: null }
            },
            select: {
                district: true
            }
        });
        // Извлекаем уникальные районы
        const districts = [...new Set(profiles.map(p => p.district).filter(Boolean))];
        console.log('Found districts:', districts);
        res.json(districts);
    }
    catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
};
exports.getDistrictsByCityId = getDistrictsByCityId;
