"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCity = exports.updateCity = exports.createCity = exports.getCities = void 0;
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
        // Преобразуем данные для совместимости с фронтендом
        const formattedCities = cities.map(city => ({
            id: city.id,
            name: city.name,
            profiles: { length: city._count.profiles }
        }));
        console.log('Formatted cities:', formattedCities);
        res.json(formattedCities);
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
