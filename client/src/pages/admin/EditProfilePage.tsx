import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import ProfileEditor from '../../components/admin/ProfileEditor';
import { api } from '../../utils/api';
import { Profile } from '../../types';

const EditProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Проверяем токен через API
    const verifyToken = async () => {
      try {
        console.log('Verifying token...');
        await api.get('/admin/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Token is valid');
      } catch (error) {
        console.error('Invalid token, redirecting to login');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    };
    
    verifyToken();

    // Если есть ID, загружаем профиль
    if (id) {
      fetchProfile(parseInt(id));
    }
  }, [id, token, navigate]);

  const fetchProfile = async (profileId: number) => {
    try {
      setLoading(true);
      console.log('Fetching profile with ID:', profileId);
      
      // Используем оба пути - сначала с /admin как источник данных для редактирования
      const response = await api.get(`/admin/profiles/${profileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profile data received:', response.data);
      console.log('Photos type:', typeof response.data.photos);
      console.log('Photos value:', response.data.photos);
      console.log('Services type:', typeof response.data.services);
      console.log('Services value:', response.data.services);
      
      // Если данные получены правильно, устанавливаем их
      if (response.data) {
        console.log('Setting profile data for editor');
        
        // Проверяем и обрабатываем photos и services если они есть
        const profileData = { ...response.data };
        
        // Обработка photos
        if (profileData.photos) {
          try {
            // Если photos не строка JSON, конвертируем в строку
            if (typeof profileData.photos !== 'string') {
              console.log('Converting photos array to JSON string');
              profileData.photos = JSON.stringify(profileData.photos);
            } else {
              // Проверяем, что photos - валидный JSON
              JSON.parse(profileData.photos);
            }
          } catch (e) {
            console.error('Error processing photos:', e);
            profileData.photos = '[]';
          }
        } else {
          profileData.photos = '[]';
        }
        
        // Обработка services
        if (profileData.services) {
          try {
            // Если services не строка JSON, конвертируем в строку
            if (typeof profileData.services !== 'string') {
              console.log('Converting services array to JSON string');
              profileData.services = JSON.stringify(profileData.services);
            } else {
              // Проверяем, что services - валидный JSON
              JSON.parse(profileData.services);
            }
          } catch (e) {
            console.error('Error processing services:', e);
            profileData.services = '[]';
          }
        } else {
          profileData.services = '[]';
        }
        
        console.log('Processed profile data:', profileData);
        setProfile(profileData);
      } else {
        console.error('Received empty profile data');
        setError('Получены пустые данные анкеты');
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setError('Не удалось загрузить данные анкеты');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProfile: Profile) => {
    try {
      setLoading(true);
      if (id) {
        // Обновление существующего профиля
        await api.put(`/profiles/${id}`, updatedProfile, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Создание нового профиля
        await api.post(`/profiles`, updatedProfile, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      navigate('/admin/profiles');
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      setError('Не удалось сохранить анкету');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/profiles');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {id ? 'Редактирование анкеты' : 'Создание новой анкеты'}
        </Typography>
        <Button variant="outlined" onClick={handleCancel}>
          Назад к списку
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !profile && id ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProfileEditor 
          profile={profile || undefined}
          onSave={handleSave} 
          onClose={handleCancel}
        />
      )}
    </Container>
  );
};

export default EditProfilePage;
