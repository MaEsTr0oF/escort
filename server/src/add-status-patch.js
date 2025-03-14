const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Добавляем эндпоинт статуса перед комментарием "// The 'catchall' handler"
const statusEndpoint = `
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

`;

// Добавляем маршрут в файл
indexContent = indexContent.replace('// The \'catchall\' handler', statusEndpoint + '// The \'catchall\' handler');

fs.writeFileSync(indexPath, indexContent);
console.log('Эндпоинт статуса добавлен в index.js');
