import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Grid,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  FormGroup,
  Card,
  CardMedia,
  CardActions,
  Alert,
  FormHelperText,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Profile, City } from '../../types';
import { api } from '../../utils/api';
import { serviceTranslations } from '../../utils/serviceTranslations';

interface ProfileEditorProps {
  profile?: Profile;
  profileId?: number;
  onSave: (profile: Profile) => void;
  onClose?: () => void;
  onCancel?: () => void;
}

interface NumericRange {
  min: number;
  max?: number;
}

const MAX_PHOTOS = 3;

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, profileId, onSave, onClose, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Обрабатываем photos при инициализации
  const initialPhotos = useMemo(() => {
    if (!profile?.photos) return [];
    try {
      if (typeof profile.photos === 'string') {
        return JSON.parse(profile.photos);
      } else if (Array.isArray(profile.photos)) {
        return profile.photos;
      }
    } catch (e) {
      console.error('Error parsing photos in ProfileEditor:', e);
    }
    return [];
  }, [profile?.photos]);
  
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  
  // Обрабатываем данные профиля при инициализации
  const initialFormData = useMemo(() => {
    console.log('Initializing form data from profile:', profile);
    
    if (!profile) {
      // Возвращаем объект с значениями по умолчанию, если профиль не передан
      return {
        name: '',
        age: 18,
        height: 165,
        weight: 55,
        breastSize: 3,
        phone: '',
        description: '',
        photos: '[]',
        price1Hour: 3000,
        price2Hours: 6000,
        priceNight: 15000,
        priceExpress: 2000,
        services: '[]',
        cityId: 1,
        district: '',
        isVerified: false,
        hasVideo: false,
        hasReviews: false,
        inCall: true,
        outCall: false,
        isNonSmoking: false,
        isNew: true,
        isWaitingCall: false,
        is24Hours: false,
        isAlone: true,
        withFriend: false,
        withFriends: false,
        gender: 'female',
        orientation: 'hetero',
        nationality: 'slavic',
        hairColor: 'blonde',
        bikiniZone: 'smooth',
      };
    }
    
    // Создаем безопасную копию данных профиля
    const safeProfile = { ...profile };
    
    // Обработка photos
    try {
      if (safeProfile.photos) {
        if (typeof safeProfile.photos === 'string') {
          // Проверяем, что это валидный JSON
          try {
            JSON.parse(safeProfile.photos);
          } catch (e) {
            console.error('Error parsing photos JSON, resetting:', e);
            safeProfile.photos = '[]';
          }
        } else if (Array.isArray(safeProfile.photos)) {
          // Преобразуем массив в JSON-строку
          safeProfile.photos = JSON.stringify(safeProfile.photos);
        }
      } else {
        safeProfile.photos = '[]';
      }
    } catch (e) {
      console.error('Error processing photos:', e);
      safeProfile.photos = '[]';
    }
    
    // Обработка services
    try {
      if (safeProfile.services) {
        if (typeof safeProfile.services === 'string') {
          // Проверяем, что это валидный JSON
          try {
            JSON.parse(safeProfile.services);
          } catch (e) {
            console.error('Error parsing services JSON, resetting:', e);
            safeProfile.services = '[]';
          }
        } else if (Array.isArray(safeProfile.services)) {
          // Преобразуем массив в JSON-строку
          safeProfile.services = JSON.stringify(safeProfile.services);
        }
      } else {
        safeProfile.services = '[]';
      }
    } catch (e) {
      console.error('Error processing services:', e);
      safeProfile.services = '[]';
    }
    
    console.log('Initialized safe profile:', safeProfile);
    return safeProfile;
  }, [profile]);
  
  const [formData, setFormData] = useState<Partial<Profile>>(initialFormData);

  // Обновляем formData при изменении initialFormData
  useEffect(() => {
    console.log('initialFormData changed, updating formData');
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching cities in ProfileEditor...');
        
        const response = await api.get('/cities');
        console.log('Cities response status:', response.status);
        console.log('Cities data length:', response.data?.length);
        
        if (response.data && Array.isArray(response.data)) {
          setCities(response.data);
          
          // Если в формах нет выбранного города, выбираем первый из списка
          if (response.data.length > 0 && (!formData.cityId || formData.cityId === 0)) {
            console.log('Setting default city to:', response.data[0].id);
            setFormData(prev => ({
              ...prev,
              cityId: response.data[0].id
            }));
          }
        } else {
          console.error('Invalid response format:', response.data);
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Ошибка при загрузке списка городов');
        
        // Создаем фейковый список городов для предотвращения ошибок в интерфейсе
        setCities([
          { id: 1, name: 'Москва' },
          { id: 2, name: 'Санкт-Петербург' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Вызываем загрузку городов
    fetchCities();
  }, [formData.cityId]);

  useEffect(() => {
    console.log('Cities state updated:', cities);
  }, [cities]);

  // Функция для сжатия изображения
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Сжимаем до качества 0.7 (70%)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Ошибка при загрузке изображения'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка при чтении файла'));
      };
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Можно загрузить максимум ${MAX_PHOTOS} фотографий`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('photo', file);

        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.url) {
          newPhotos.push(response.data.url);
        }
      }

      setPhotos([...photos, ...newPhotos]);
      setFormData({
        ...formData,
        photos: JSON.stringify([...photos, ...newPhotos])
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError('Ошибка при загрузке фотографий');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDelete = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setFormData({
      ...formData,
      photos: JSON.stringify(newPhotos)
    });
  };

  const handleChange = (field: keyof Profile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleCheckboxChange = (field: keyof Profile) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.checked,
    });
  };

  const handleSelectChange = (field: keyof Profile) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleServiceChange = (
    service: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      console.log('Handling service change for:', service);
      console.log('Current services data:', formData.services);
      
      // Получаем текущий список сервисов
      let currentServices: string[] = [];
      
      if (formData.services) {
        if (typeof formData.services === 'string') {
          try {
            currentServices = JSON.parse(formData.services);
            if (!Array.isArray(currentServices)) {
              console.warn('Services parsed but not an array, resetting to empty array');
              currentServices = [];
            }
          } catch (e) {
            console.error('Error parsing services JSON in handleServiceChange:', e);
            currentServices = [];
          }
        } else if (Array.isArray(formData.services)) {
          currentServices = formData.services;
        }
      }
      
      console.log('Current services array:', currentServices);
      console.log('Checked status:', event.target.checked);
      
      // Обновляем список сервисов
      const newServices = event.target.checked
        ? [...currentServices, service]
        : currentServices.filter((s: string) => s !== service);
      
      console.log('New services array:', newServices);
      
      // Обновляем данные формы
      setFormData({
        ...formData,
        services: JSON.stringify(newServices),
      });
    } catch (e) {
      console.error('Error in handleServiceChange:', e);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Submitting form with data:', formData);
    console.log('Photos state:', photos);
    
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

    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof Profile];
      return !value || (field === 'photos' && photos.length === 0);
    });

    if (missingFields.length > 0) {
      setError(`Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`);
      return;
    }

    if (photos.length === 0) {
      setError('Добавьте хотя бы одно фото');
      return;
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
      const value = Number(formData[field as keyof Profile]);
      if (isNaN(value) || value < range.min || (range.max !== undefined && value > range.max)) {
        setError(`Неверное значение для поля ${field}. Допустимый диапазон: от ${range.min}${range.max ? ` до ${range.max}` : ''}`);
        return;
      }
    }

    setError(null);

    // Преобразуем массивы в JSON строки перед отправкой
    const dataToSend = {
      ...formData,
      photos: typeof formData.photos === 'string' ? formData.photos : JSON.stringify(photos),
      services: typeof formData.services === 'string' ? formData.services : JSON.stringify([])
    } as Profile;

    console.log('Sending profile data:', dataToSend);
    onSave(dataToSend);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {profile || profileId ? 'Редактирование анкеты' : 'Создание анкеты'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Фотографии */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Фотографии ({photos.length}/{MAX_PHOTOS})
              </Typography>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <Grid container spacing={2}>
                {photos.map((photo, index) => (
                  <Grid item xs={4} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={photo}
                        alt={`Фото ${index + 1}`}
                      />
                      <CardActions>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handlePhotoDelete(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <Grid item xs={4}>
                    <Card
                      sx={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <AddPhotoIcon sx={{ fontSize: 60, color: 'action.active' }} />
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Основная информация */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Имя"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!formData.cityId}>
                <InputLabel>Город</InputLabel>
                <Select
                  value={formData.cityId?.toString() || ''}
                  onChange={(e) => {
                    console.log('Selected city:', e.target.value);
                    setFormData({
                      ...formData,
                      cityId: Number(e.target.value)
                    });
                  }}
                  label="Город"
                  disabled={loading}
                >
                  {loading ? (
                    <MenuItem disabled value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        Загрузка...
                      </Box>
                    </MenuItem>
                  ) : cities.length === 0 ? (
                    <MenuItem disabled value="">
                      Нет доступных городов
                    </MenuItem>
                  ) : (
                    cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {!formData.cityId && !loading && (
                  <FormHelperText>Выберите город</FormHelperText>
                )}
                {error && (
                  <FormHelperText error>
                    {error}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Район"
                value={formData.district || ''}
                onChange={handleChange('district')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Описание"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            {/* Внешность */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Внешность
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Возраст"
                value={formData.age}
                onChange={handleChange('age')}
                InputProps={{ inputProps: { min: 18, max: 70 } }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Рост"
                value={formData.height}
                onChange={handleChange('height')}
                InputProps={{ inputProps: { min: 140, max: 195 } }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Вес"
                value={formData.weight}
                onChange={handleChange('weight')}
                InputProps={{ inputProps: { min: 40, max: 110 } }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Размер груди"
                value={formData.breastSize}
                onChange={handleChange('breastSize')}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Национальность</InputLabel>
                <Select
                  value={formData.nationality}
                  onChange={handleSelectChange('nationality')}
                  label="Национальность"
                >
                  <MenuItem value="slavic">Славянка</MenuItem>
                  <MenuItem value="caucasian">Кавказская</MenuItem>
                  <MenuItem value="asian">Азиатка</MenuItem>
                  <MenuItem value="african">Африканка</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Цвет волос</InputLabel>
                <Select
                  value={formData.hairColor}
                  onChange={handleSelectChange('hairColor')}
                  label="Цвет волос"
                >
                  <MenuItem value="blonde">Блондинка</MenuItem>
                  <MenuItem value="brunette">Брюнетка</MenuItem>
                  <MenuItem value="brown">Шатенка</MenuItem>
                  <MenuItem value="red">Рыжая</MenuItem>
                  <MenuItem value="other">Другой</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Зона бикини</InputLabel>
                <Select
                  value={formData.bikiniZone}
                  onChange={handleSelectChange('bikiniZone')}
                  label="Зона бикини"
                >
                  <MenuItem value="smooth">Гладкая</MenuItem>
                  <MenuItem value="strip">Интимная стрижка</MenuItem>
                  <MenuItem value="natural">Мохнатка</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Услуги */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Услуги
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Секс
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('classic')}
                      onChange={(e) => handleServiceChange('classic', e)}
                    />
                  }
                  label={serviceTranslations['classic']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('anal')}
                      onChange={(e) => handleServiceChange('anal', e)}
                    />
                  }
                  label={serviceTranslations['anal']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('lesbian')}
                      onChange={(e) => handleServiceChange('lesbian', e)}
                    />
                  }
                  label={serviceTranslations['lesbian']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('group_mmf')}
                      onChange={(e) => handleServiceChange('group_mmf', e)}
                    />
                  }
                  label={serviceTranslations['group_mmf']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('group_ffm')}
                      onChange={(e) => handleServiceChange('group_ffm', e)}
                    />
                  }
                  label={serviceTranslations['group_ffm']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('with_toys')}
                      onChange={(e) => handleServiceChange('with_toys', e)}
                    />
                  }
                  label={serviceTranslations['with_toys']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('in_car')}
                      onChange={(e) => handleServiceChange('in_car', e)}
                    />
                  }
                  label={serviceTranslations['in_car']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ласки клиенту
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('blowjob_with_condom')}
                      onChange={(e) => handleServiceChange('blowjob_with_condom', e)}
                    />
                  }
                  label={serviceTranslations['blowjob_with_condom']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('blowjob_without_condom')}
                      onChange={(e) => handleServiceChange('blowjob_without_condom', e)}
                    />
                  }
                  label={serviceTranslations['blowjob_without_condom']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('deep_blowjob')}
                      onChange={(e) => handleServiceChange('deep_blowjob', e)}
                    />
                  }
                  label={serviceTranslations['deep_blowjob']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('car_blowjob')}
                      onChange={(e) => handleServiceChange('car_blowjob', e)}
                    />
                  }
                  label={serviceTranslations['car_blowjob']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('anilingus_to_client')}
                      onChange={(e) => handleServiceChange('anilingus_to_client', e)}
                    />
                  }
                  label={serviceTranslations['anilingus_to_client']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('fisting_to_client')}
                      onChange={(e) => handleServiceChange('fisting_to_client', e)}
                    />
                  }
                  label={serviceTranslations['fisting_to_client']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('kisses')}
                      onChange={(e) => handleServiceChange('kisses', e)}
                    />
                  }
                  label={serviceTranslations['kisses']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                BDSM и фетиш
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('light_domination')}
                      onChange={(e) => handleServiceChange('light_domination', e)}
                    />
                  }
                  label={serviceTranslations['light_domination']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('mistress')}
                      onChange={(e) => handleServiceChange('mistress', e)}
                    />
                  }
                  label={serviceTranslations['mistress']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('flogging')}
                      onChange={(e) => handleServiceChange('flogging', e)}
                    />
                  }
                  label={serviceTranslations['flogging']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('trampling')}
                      onChange={(e) => handleServiceChange('trampling', e)}
                    />
                  }
                  label={serviceTranslations['trampling']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('face_sitting')}
                      onChange={(e) => handleServiceChange('face_sitting', e)}
                    />
                  }
                  label={serviceTranslations['face_sitting']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('strapon')}
                      onChange={(e) => handleServiceChange('strapon', e)}
                    />
                  }
                  label={serviceTranslations['strapon']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('bondage')}
                      onChange={(e) => handleServiceChange('bondage', e)}
                    />
                  }
                  label={serviceTranslations['bondage']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('slave')}
                      onChange={(e) => handleServiceChange('slave', e)}
                    />
                  }
                  label={serviceTranslations['slave']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('role_play')}
                      onChange={(e) => handleServiceChange('role_play', e)}
                    />
                  }
                  label={serviceTranslations['role_play']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('foot_fetish')}
                      onChange={(e) => handleServiceChange('foot_fetish', e)}
                    />
                  }
                  label={serviceTranslations['foot_fetish']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('golden_rain_out')}
                      onChange={(e) => handleServiceChange('golden_rain_out', e)}
                    />
                  }
                  label={serviceTranslations['golden_rain_out']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('golden_rain_in')}
                      onChange={(e) => handleServiceChange('golden_rain_in', e)}
                    />
                  }
                  label={serviceTranslations['golden_rain_in']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('copro_out')}
                      onChange={(e) => handleServiceChange('copro_out', e)}
                    />
                  }
                  label={serviceTranslations['copro_out']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('copro_in')}
                      onChange={(e) => handleServiceChange('copro_in', e)}
                    />
                  }
                  label={serviceTranslations['copro_in']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('enema')}
                      onChange={(e) => handleServiceChange('enema', e)}
                    />
                  }
                  label={serviceTranslations['enema']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Эротический массаж
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('relaxing')}
                      onChange={(e) => handleServiceChange('relaxing', e)}
                    />
                  }
                  label={serviceTranslations['relaxing']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('professional')}
                      onChange={(e) => handleServiceChange('professional', e)}
                    />
                  }
                  label={serviceTranslations['professional']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('body_massage')}
                      onChange={(e) => handleServiceChange('body_massage', e)}
                    />
                  }
                  label={serviceTranslations['body_massage']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('lingam_massage')}
                      onChange={(e) => handleServiceChange('lingam_massage', e)}
                    />
                  }
                  label={serviceTranslations['lingam_massage']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('four_hands')}
                      onChange={(e) => handleServiceChange('four_hands', e)}
                    />
                  }
                  label={serviceTranslations['four_hands']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('urological')}
                      onChange={(e) => handleServiceChange('urological', e)}
                    />
                  }
                  label={serviceTranslations['urological']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Шоу
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('strip_pro')}
                      onChange={(e) => handleServiceChange('strip_pro', e)}
                    />
                  }
                  label={serviceTranslations['strip_pro']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('strip_amateur')}
                      onChange={(e) => handleServiceChange('strip_amateur', e)}
                    />
                  }
                  label={serviceTranslations['strip_amateur']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('belly_dance')}
                      onChange={(e) => handleServiceChange('belly_dance', e)}
                    />
                  }
                  label={serviceTranslations['belly_dance']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('twerk')}
                      onChange={(e) => handleServiceChange('twerk', e)}
                    />
                  }
                  label={serviceTranslations['twerk']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('lesbian_show')}
                      onChange={(e) => handleServiceChange('lesbian_show', e)}
                    />
                  }
                  label={serviceTranslations['lesbian_show']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Виртуальные услуги
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('sex_chat')}
                      onChange={(e) => handleServiceChange('sex_chat', e)}
                    />
                  }
                  label={serviceTranslations['sex_chat']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('phone_sex')}
                      onChange={(e) => handleServiceChange('phone_sex', e)}
                    />
                  }
                  label={serviceTranslations['phone_sex']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('video_sex')}
                      onChange={(e) => handleServiceChange('video_sex', e)}
                    />
                  }
                  label={serviceTranslations['video_sex']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('photo_video')}
                      onChange={(e) => handleServiceChange('photo_video', e)}
                    />
                  }
                  label={serviceTranslations['photo_video']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Могу позвать
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('invite_girlfriend')}
                      onChange={(e) => handleServiceChange('invite_girlfriend', e)}
                    />
                  }
                  label={serviceTranslations['invite_girlfriend']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('invite_friend')}
                      onChange={(e) => handleServiceChange('invite_friend', e)}
                    />
                  }
                  label={serviceTranslations['invite_friend']}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Дополнительно
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('escort')}
                      onChange={(e) => handleServiceChange('escort', e)}
                    />
                  }
                  label={serviceTranslations['escort']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('photoshoot')}
                      onChange={(e) => handleServiceChange('photoshoot', e)}
                    />
                  }
                  label={serviceTranslations['photoshoot']}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services?.includes('skirt')}
                      onChange={(e) => handleServiceChange('skirt', e)}
                    />
                  }
                  label={serviceTranslations['skirt']}
                />
              </FormGroup>
            </Grid>

            {/* Цены */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Цены
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Экспресс"
                value={formData.priceExpress}
                onChange={handleChange('priceExpress')}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="1 час"
                value={formData.price1Hour}
                onChange={handleChange('price1Hour')}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="2 часа"
                value={formData.price2Hours}
                onChange={handleChange('price2Hours')}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Ночь"
                value={formData.priceNight}
                onChange={handleChange('priceNight')}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            {/* Место встречи */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Место встречи
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.inCall}
                    onChange={handleCheckboxChange('inCall')}
                  />
                }
                label="У себя"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.outCall}
                    onChange={handleCheckboxChange('outCall')}
                  />
                }
                label="Выезд"
              />
            </Grid>

            {/* Дополнительно */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Дополнительно
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isNonSmoking}
                    onChange={handleCheckboxChange('isNonSmoking')}
                  />
                }
                label="Не курит"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isNew}
                    onChange={handleCheckboxChange('isNew')}
                  />
                }
                label="Новенькая"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isWaitingCall}
                    onChange={handleCheckboxChange('isWaitingCall')}
                  />
                }
                label="Ждёт звонка"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is24Hours}
                    onChange={handleCheckboxChange('is24Hours')}
                  />
                }
                label="Круглосуточно"
              />
            </Grid>

            {/* Соседи */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Соседи
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isAlone}
                    onChange={handleCheckboxChange('isAlone')}
                  />
                }
                label="Одна"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.withFriend}
                    onChange={handleCheckboxChange('withFriend')}
                  />
                }
                label="С подругой"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.withFriends}
                    onChange={handleCheckboxChange('withFriends')}
                  />
                }
                label="С несколькими подругами"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {(onClose || onCancel) && (
              <Button 
                onClick={onCancel || onClose} 
                sx={{ mr: 1 }}
              >
                Отмена
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {profile || profileId ? 'Сохранить' : 'Создать'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ProfileEditor; 