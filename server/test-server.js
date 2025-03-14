const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server is running' });
});

app.get('/cities', (req, res) => {
  res.json([{ id: 1, name: 'Москва' }, { id: 2, name: 'Санкт-Петербург' }]);
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Test server running on port 3001');
});
