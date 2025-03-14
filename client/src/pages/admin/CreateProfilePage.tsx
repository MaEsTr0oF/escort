import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

interface City {
  id: number;
  name: string;
}

const CreateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('adminToken');
  
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    height: 165,
    weight: 55,
    breastSize: 3,
    phone: '+7',
    description: '',
    photos: [] as string[], // Исправлено: явно указываем тип string[]
    price1Hour: 5000,
    price2Hours: 10000,
    priceNight: 30000,
    priceExpress: 0,
    cityId: 0,
    district: '',
    services: [] as string[], // Исправлено: явно указываем тип string[]
    nationality: '',
    hairColor: '',
    isVerified: false,
    hasVideo: false,
    isActive: true,
    inCall: true,
    outCall: false,
    isNonSmoking: false,
    is24Hours: false,
  });

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchCities = async () => {
      try {
        const response = await axios.get(`${API_URL}/cities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCities(response.data);
        
        // Устанавливаем первый город как выбранный по умолчанию, если есть города
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, cityId: response.data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setError('Не удалось загрузить список городов');
      }
    };

    fetchCities();
  }, [token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const photoPromises = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            resolve(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(photoArray => {
      setFormData(prev => ({ ...prev, photos: [...photoArray] }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Убедимся, что cityId - число
      const dataToSend = {
        ...formData,
        cityId: Number(formData.cityId),
      };

      const response = await axios.post(`${API_URL}/profiles`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess(true);
      setLoading(false);
      
      // Перенаправляем на страницу со списком анкет после успешного создания
      setTimeout(() => {
        navigate('/admin/profiles');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setError(error.response?.data?.error || 'Не удалось создать анкету');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Добавление новой анкеты
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Анкета успешно создана! Перенаправление...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Имя"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Телефон"
                name="phone"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Возраст"
                name="age"
                type="number"
                fullWidth
                value={formData.age}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 18, max: 70 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Рост (см)"
                name="height"
                type="number"
                fullWidth
                value={formData.height}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 140, max: 195 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Вес (кг)"
                name="weight"
                type="number"
                fullWidth
                value={formData.weight}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 40, max: 110 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Размер груди"
                name="breastSize"
                type="number"
                fullWidth
                value={formData.breastSize}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Город</InputLabel>
                <Select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleSelectChange}
                  label="Город"
                >
                  {cities.map(city => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Район"
                name="district"
                fullWidth
                value={formData.district}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Цена 1 час (₽)"
                name="price1Hour"
                type="number"
                fullWidth
                value={formData.price1Hour}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Цена 2 часа (₽)"
                name="price2Hours"
                type="number"
                fullWidth
                value={formData.price2Hours}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Цена ночь (₽)"
                name="priceNight"
                type="number"
                fullWidth
                value={formData.priceNight}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                label="Цена экспресс (₽)"
                name="priceExpress"
                type="number"
                fullWidth
                value={formData.priceExpress}
                onChange={handleNumberChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Описание"
                name="description"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Фотографии
              </Typography>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ marginBottom: '10px', display: 'block' }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Array.isArray(formData.photos) 
                  ? formData.photos.map((photo, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={photo}
                        alt={`Фото ${index + 1}`}
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ))
                  : (formData.photos && typeof formData.photos === 'string' && JSON.parse(formData.photos || '[]').map((photo: string, index: number) => (
                      <Box
                        key={index}
                        component="img"
                        src={photo}
                        alt={`Фото ${index + 1}`}
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )))}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Опции
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleSwitchChange}
                        name="isActive"
                      />
                    }
                    label="Активна"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isVerified}
                        onChange={handleSwitchChange}
                        name="isVerified"
                      />
                    }
                    label="Проверенная"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.inCall}
                        onChange={handleSwitchChange}
                        name="inCall"
                      />
                    }
                    label="Принимает"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.outCall}
                        onChange={handleSwitchChange}
                        name="outCall"
                      />
                    }
                    label="Выезжает"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isNonSmoking}
                        onChange={handleSwitchChange}
                        name="isNonSmoking"
                      />
                    }
                    label="Не курит"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is24Hours}
                        onChange={handleSwitchChange}
                        name="is24Hours"
                      />
                    }
                    label="24 часа"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* Здесь можно добавить выбор услуг */}
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/admin/profiles')}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateProfilePage;
