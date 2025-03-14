-- Добавление городов
INSERT INTO "City" (name) VALUES ('Москва') ON CONFLICT (name) DO NOTHING;
INSERT INTO "City" (name) VALUES ('Санкт-Петербург') ON CONFLICT (name) DO NOTHING;
INSERT INTO "City" (name) VALUES ('Екатеринбург') ON CONFLICT (name) DO NOTHING;

-- Получение ID города Москва для использования в анкетах
WITH moscow AS (SELECT id FROM "City" WHERE name = 'Москва' LIMIT 1)
INSERT INTO "Profile" (
  name, age, height, weight, breastSize, phone, description, 
  photos, price1Hour, price2Hours, priceNight, cityId, 
  isActive, isVerified, services, gender
)
VALUES (
  'Анна', 25, 170, 55, 3, '+7 (999) 123-45-67', 
  'Красивая девушка ждет в гости состоятельного мужчину.',
  '["photo1.jpg", "photo2.jpg"]', 5000, 10000, 30000, 
  (SELECT id FROM moscow), 
  true, true, '["classic", "massage"]', 'female'
) ON CONFLICT DO NOTHING;

WITH spb AS (SELECT id FROM "City" WHERE name = 'Санкт-Петербург' LIMIT 1)
INSERT INTO "Profile" (
  name, age, height, weight, breastSize, phone, description, 
  photos, price1Hour, price2Hours, priceNight, cityId, 
  isActive, isVerified, services, gender
)
VALUES (
  'Елена', 23, 165, 50, 2, '+7 (999) 987-65-43', 
  'Приятная во всех отношениях девушка.',
  '["photo3.jpg", "photo4.jpg"]', 6000, 12000, 35000, 
  (SELECT id FROM spb), 
  true, true, '["classic", "massage", "blowjob_with_condom"]', 'female'
) ON CONFLICT DO NOTHING;
