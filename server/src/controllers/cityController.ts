import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCities = async (_req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

export const createCity = async (req: Request, res: Response) => {
  try {
    const city = await prisma.city.create({
      data: req.body,
    });
    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: 'Failed to create city' });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ error: 'Failed to update city' });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.city.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city' });
  }
<<<<<<< HEAD
}; 
=======
};

>>>>>>> 47edeae3aeafc63911c3a57a44c28eb507634ed8
export const getDistrictsByCityId = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    
<<<<<<< HEAD
    console.log('Получение районов для города ID:', cityId);
    
=======
    console.log('Fetching districts for city ID:', cityId);
    
    // Находим все анкеты в указанном городе
>>>>>>> 47edeae3aeafc63911c3a57a44c28eb507634ed8
    const profiles = await prisma.profile.findMany({
      where: { 
        cityId: Number(cityId),
        district: { not: null }
      },
      select: { 
        district: true 
      }
    });
    
<<<<<<< HEAD
    const districts = [...new Set(profiles.map(p => p.district).filter(Boolean))];
    
    console.log('Найдены районы:', districts);
    res.json(districts);
  } catch (error) {
    console.error('Ошибка при получении районов:', error);
    res.status(500).json({ error: 'Не удалось получить список районов' });
  }
};
=======
    // Извлекаем уникальные районы
    const districts = [...new Set(profiles.map(p => p.district).filter(Boolean))];
    
    console.log('Found districts:', districts);
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
}; 
>>>>>>> 47edeae3aeafc63911c3a57a44c28eb507634ed8
