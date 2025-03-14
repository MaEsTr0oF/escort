import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStats = async (_req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
