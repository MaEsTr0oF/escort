import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const {
      cityId,
      district,
      services,
      price,
      appearance,
      verification,
      other,
      outcall
    } = req.query;

    // Проверяем наличие токена администратора в заголовках
    const isAdminRequest = req.headers.authorization?.startsWith('Bearer ');

    console.log('Request query:', req.query);
    console.log('Is admin request:', isAdminRequest);

    const filters: any = {
      isActive: isAdminRequest ? undefined : true,
    };

    // Базовые фильтры
    if (cityId) filters.cityId = Number(cityId);
    if (district) filters.district = district as string;

    // Фильтры по ценам
    if (price && typeof price === 'object') {
      const { from, to } = price as any;
      if (from) filters.price1Hour = { gte: Number(from) };
      if (to) filters.price1Hour = { ...filters.price1Hour, lte: Number(to) };
    }

    // Фильтры по внешности
    if (appearance && typeof appearance === 'object') {
      const { age, height, weight, breastSize } = appearance as any;
      if (age) {
        const [minAge, maxAge] = age;
        filters.age = { gte: Number(minAge), lte: Number(maxAge) };
      }
      if (height) {
        const [minHeight, maxHeight] = height;
        filters.height = { gte: Number(minHeight), lte: Number(maxHeight) };
      }
      if (weight) {
        const [minWeight, maxWeight] = weight;
        filters.weight = { gte: Number(minWeight), lte: Number(maxWeight) };
      }
      if (breastSize) {
        const [minBreast, maxBreast] = breastSize;
        filters.breastSize = { gte: Number(minBreast), lte: Number(maxBreast) };
      }
    }

    // Фильтр по услугам
    if (services && Array.isArray(services) && services.length > 0) {
      filters.services = {
        hasSome: services
      };
    }

    // Фильтры верификации
    if (verification && Array.isArray(verification)) {
      verification.forEach(v => {
        switch (v) {
          case 'verified':
            filters.isVerified = true;
            break;
          case 'with_video':
            filters.hasVideo = true;
            break;
          case 'with_reviews':
            filters.hasReviews = true;
            break;
        }
      });
    }

    // Прочие фильтры
    if (other && Array.isArray(other)) {
      other.forEach(o => {
        switch (o) {
          case 'non_smoking':
            filters.isNonSmoking = true;
            break;
          case 'new':
            filters.isNew = true;
            break;
          case '24_hours':
            filters.is24Hours = true;
            break;
        }
      });
    }

    // Фильтр выезда
    if (outcall === 'true') {
      filters.outCall = true;
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
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profiles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getProfileById = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const createProfile = async (req: Request, res: Response) => {
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

    interface NumericRange {
      min: number;
      max?: number;
    }

    // Проверяем валидность числовых полей
    const numericFields: Record<string, NumericRange> = {
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
      inCall: req.body.inCall ?? true,
      outCall: req.body.outCall ?? false,
      
      // Additional filters
      isNonSmoking: req.body.isNonSmoking || false,
      isNew: req.body.isNew ?? true,
      isWaitingCall: req.body.isWaitingCall || false,
      is24Hours: req.body.is24Hours || false,
      
      // Neighbors
      isAlone: req.body.isAlone ?? true,
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
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      error: 'Failed to create profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await prisma.profile.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.profile.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};

export const verifyProfile = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error verifying profile:', error);
    res.status(500).json({ error: 'Failed to verify profile' });
  }
};

export const getServices = async (_req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Ошибка при получении списка услуг:', error);
    res.status(500).json({ error: 'Не удалось получить список услуг' });
  }
};
