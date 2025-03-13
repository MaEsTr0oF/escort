"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = require("./middleware/auth");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const cityRoutes_1 = __importDefault(require("./routes/cityRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 5002;
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
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Публичные маршруты
app.use('/api/profiles', profileRoutes_1.default);
app.use('/api/cities', cityRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
// Маршруты администратора
app.use('/api/admin', auth_1.authMiddleware);
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
