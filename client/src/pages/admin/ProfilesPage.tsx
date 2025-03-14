import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  ArrowBack as ArrowBackIcon,
  VerifiedUser as VerifyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import ProfileEditor from '../../components/admin/ProfileEditor';
import { Profile, City } from '../../types';

// Временный интерфейс для отображения в таблице
interface ProfileListItem {
  id: number;
  name: string;
  age: number;
  cityId: number;
  city?: {
    id: number;
    name: string;
  };
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

const ProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('adminToken');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchProfiles();
    fetchCities();
  }, [token, navigate]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Проверка, является ли response.data массивом
      if (Array.isArray(response.data)) {
        setProfiles(response.data);
      } else {
        console.error('Expected array but got:', typeof response.data, response.data);
        setProfiles([]);
        setError('Данные профилей в неверном формате');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Ошибка при загрузке анкет');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Функция для получения полных данных профиля
  const fetchFullProfile = async (id: number): Promise<Profile | null> => {
    try {
      const response = await api.get(`/admin/profiles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching full profile:', error);
      return null;
    }
  };

  const handleOpenEditor = async (profile?: ProfileListItem) => {
    if (profile) {
      // Получаем полные данные для редактирования
      const fullProfile = await fetchFullProfile(profile.id);
      if (fullProfile) {
        setSelectedProfile(fullProfile);
      } else {
        setError('Не удалось загрузить данные анкеты для редактирования');
        return;
      }
    } else {
      setSelectedProfile(null);
    }
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedProfile(null);
  };

  const handleSaveProfile = async (profileData: Profile) => {
    try {
      if (selectedProfile) {
        const response = await api.put(
          `/profiles/${selectedProfile.id}`,
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Update response:', response.data);
      } else {
        const response = await api.post(
          `/profiles`,
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Create response:', response.data);
      }
      fetchProfiles();
      handleCloseEditor();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении профиля');
    }
  };

  const handleToggleStatus = async (profile: ProfileListItem) => {
    try {
      await api.patch(`/admin/profiles/${profile.id}/toggle-active`, 
        { isActive: !profile.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfiles();
    } catch (error) {
      console.error('Error toggling status:', error);
      setError('Ошибка при изменении статуса анкеты');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
      return;
    }

    try {
      await api.delete(`/profiles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles(profiles.filter(profile => profile.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError('Ошибка при удалении анкеты');
    }
  };

  const handleVerify = async (id: number) => {
    try {
      const response = await api.post(`/profiles/${id}/verify`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Обновляем список анкет после верификации
      setProfiles(profiles.map(profile => 
        profile.id === id 
          ? { ...profile, isVerified: true } 
          : profile
      ));
      
    } catch (error) {
      console.error('Error verifying profile:', error);
      setError('Ошибка при верификации анкеты');
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/profiles/${id}/edit`);
  };

  const handleAddNew = () => {
    navigate('/admin/profiles/new');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {!showEditor ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Управление анкетами</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenEditor()}
            >
              Добавить анкету
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {profiles.map((profile) => (
              <Grid item xs={12} sm={6} md={4} key={profile.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {profile.name}, {profile.age} лет
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Город: {cities.find(c => c.id === profile.cityId)?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Телефон: {profile.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Статус: {profile.isActive ? 'Активна' : 'Неактивна'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleOpenEditor(profile)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(profile.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleToggleStatus(profile)} 
                      size="small"
                      color={profile.isActive ? "success" : "warning"}
                    >
                      {profile.isActive ? <CheckIcon /> : <BlockIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleCloseEditor}
            >
              Вернуться к списку
            </Button>
          </Box>
          
          <ProfileEditor
            profile={selectedProfile || undefined}
            onClose={handleCloseEditor}
            onSave={handleSaveProfile}
          />
        </>
      )}
    </Container>
  );
};

export default ProfilesPage;
