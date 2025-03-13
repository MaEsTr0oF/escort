-- Добавление городов
INSERT INTO "City" (name) VALUES ('Москва') ON CONFLICT (name) DO NOTHING;
INSERT INTO "City" (name) VALUES ('Санкт-Петербург') ON CONFLICT (name) DO NOTHING;
INSERT INTO "City" (name) VALUES ('Екатеринбург') ON CONFLICT (name) DO NOTHING;
