"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const profileController = __importStar(require("./controllers/profileController"));
const authController = __importStar(require("./controllers/authController"));
const auth_1 = require("./middleware/auth");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const cityRoutes_1 = __importDefault(require("./routes/cityRoutes"));
const adminCityRoutes_1 = __importDefault(require("./routes/adminCityRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const dashboardController = __importStar(require("./controllers/dashboardController"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 5001;
// Проверка подключения к базе данных
async function checkDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Успешное подключение к базе данных');
        // Проверяем наличие админа
        const adminCount = await prisma.admin.count();
        if (adminCount === 0) {
            // Создаем дефолтного админа если нет ни одного
            const defaultAdmin = await prisma.admin.create({
                data: {
                    username: 'admin',
                    password: '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WXgRWQP4hRj0IXIWEkyG', // пароль: admin123
                },
            });
            console.log('✅ Создан дефолтный администратор (логин: admin, пароль: admin123)');
        }
        // Проверяем наличие настроек
        const settingsCount = await prisma.settings.count();
        if (settingsCount === 0) {
            await prisma.settings.create({ data: {} }); // Создаем настройки по умолчанию
            console.log('✅ Созданы настройки по умолчанию');
        }
    }
    catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error);
        process.exit(1);
    }
}
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://eskortvsegorodarfreal.site'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
// Логирование запросов для отладки
app.use((req, res, next) => {
    console.log(`[DEBUG] Получен запрос: ${req.method} ${req.url}`);
    next();
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Тестовый маршрут
app.get('/api/test', (_req, res) => {
    res.status(200).json({ message: 'API работает!' });
});
// Публичные маршруты
app.use('/api/profiles', profileRoutes_1.default);
app.use('/api/cities', cityRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
// Защищенные административные маршруты
app.use('/api/admin', auth_1.authMiddleware);
// Админские маршруты для городов
app.use('/api/admin/cities', adminCityRoutes_1.default);
// Маршрут для получения статистики дашборда
app.get('/api/admin/dashboard/stats', async (req, res) => {
    await dashboardController.getStats(req, res);
});
// Получение списка профилей для админки
app.get('/api/admin/profiles', async (req, res) => {
    await profileController.getAdminProfiles(req, res);
});
// Маршрут для получения отдельного профиля для админки
app.get('/api/admin/profiles/:id', async (req, res) => {
    await profileController.getProfileById(req, res);
});
// Маршрут для активации/деактивации профиля
app.patch('/api/admin/profiles/:id/toggle-active', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[DEBUG] Переключение статуса профиля с ID: ${id}`);
        // Получаем текущий профиль
        const profile = await prisma.profile.findUnique({
            where: { id: Number(id) },
        });
        if (!profile) {
            console.log(`[DEBUG] Профиль с ID ${id} не найден`);
            return res.status(404).json({ error: 'Профиль не найден' });
        }
        // Инвертируем статус isActive
        const updatedProfile = await prisma.profile.update({
            where: { id: Number(id) },
            data: { isActive: !profile.isActive },
        });
        console.log(`[DEBUG] Профиль ${id} обновлен, isActive: ${updatedProfile.isActive}`);
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Ошибка при изменении статуса профиля:', error);
        res.status(500).json({ error: 'Не удалось изменить статус профиля' });
    }
});
// Маршрут для верификации профиля
app.patch('/api/admin/profiles/:id/verify', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[DEBUG] Верификация профиля с ID: ${id}`);
        // Получаем текущий профиль
        const profile = await prisma.profile.findUnique({
            where: { id: Number(id) },
        });
        if (!profile) {
            console.log(`[DEBUG] Профиль с ID ${id} не найден`);
            return res.status(404).json({ error: 'Профиль не найден' });
        }
        // Инвертируем статус isVerified
        const updatedProfile = await prisma.profile.update({
            where: { id: Number(id) },
            data: { isVerified: !profile.isVerified },
        });
        console.log(`[DEBUG] Профиль ${id} обновлен, isVerified: ${updatedProfile.isVerified}`);
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Ошибка при верификации профиля:', error);
        res.status(500).json({ error: 'Не удалось верифицировать профиль' });
    }
});
// Маршрут проверки валидности токена
app.get('/api/admin/verify-token', async (req, res) => {
    res.status(200).json({ valid: true });
});
// Прямой маршрут для авторизации (для отладки)
app.post('/api/auth/login', async (req, res) => {
    console.log('Получен запрос на авторизацию:', req.body);
    await authController.login(req, res);
});
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Запускаем сервер только после проверки подключения к БД
checkDatabaseConnection().then(() => {
    app.listen(port, () => {
        console.log(`✅ Сервер запущен на порту ${port}`);
        console.log(`📝 Админ-панель доступна по адресу: http://localhost:${port}/admin`);
        console.log(`🔑 API доступно по адресу: http://localhost:${port}/api`);
    });
}).catch((error) => {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
});
