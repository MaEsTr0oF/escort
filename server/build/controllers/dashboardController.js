"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getStats = async (_req, res) => {
    try {
        const [profilesCount, citiesCount, verifiedCount, adminsCount] = await Promise.all([
            prisma.profile.count(),
            prisma.city.count(),
            prisma.profile.count({ where: { isVerified: true } }),
            prisma.admin.count(),
        ]);
        res.json({
            profiles: profilesCount,
            cities: citiesCount,
            verified: verifiedCount,
            admins: adminsCount,
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
exports.getStats = getStats;
