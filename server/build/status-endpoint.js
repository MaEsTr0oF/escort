"use strict";
// Эндпоинт для проверки статуса сервера
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        endpoints: [
            '/cities',
            '/profiles',
            '/admin/profiles',
            '/auth/login'
        ]
    });
});
