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
      
      // Исправлено: используем прямой путь без префикса /admin
      const response = await api.get(`/profiles/${profileId}`, {
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
        setProfile(response.data);
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
