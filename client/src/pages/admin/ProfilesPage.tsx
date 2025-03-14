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
  Divider,
  Avatar,
  Snackbar,
  SnackbarContent,
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
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

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
      setProcessingIds(prev => ({ ...prev, [profile.id]: true }));
      setError('');
      
      await api.patch(`/admin/profiles/${profile.id}/toggle-active`, 
        { isActive: !profile.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: `Анкета ${!profile.isActive ? 'активирована' : 'деактивирована'}`,
        severity: 'success',
      });
      
      fetchProfiles();
    } catch (error) {
      console.error('Error toggling status:', error);
      setError('Ошибка при изменении статуса анкеты');
      
      // Показываем уведомление об ошибке
      setSnackbar({
        open: true,
        message: "Ошибка при изменении статуса анкеты",
        severity: 'error',
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [profile.id]: false }));
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
      setProcessingIds(prev => ({ ...prev, [id]: true }));
      setError('');
      
      const response = await api.patch(`/admin/profiles/${id}/verify`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Находим профиль в текущем списке
      const profile = profiles.find(p => p.id === id);
      const newVerifiedStatus = !profile?.isVerified;
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: `Анкета ${newVerifiedStatus ? 'проверена' : 'отмечена как непроверенная'}`,
        severity: 'success',
      });
      
      fetchProfiles();
    } catch (error) {
      console.error("Ошибка при изменении статуса верификации:", error);
      setError("Ошибка при изменении статуса верификации");
      
      // Показываем уведомление об ошибке
      setSnackbar({
        open: true,
        message: "Ошибка при изменении статуса верификации",
        severity: 'error',
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    ...(profile.isVerified && {
                      border: '1px solid',
                      borderColor: 'success.main'
                    }),
                    ...(profile.isActive ? {} : {
                      opacity: 0.7
                    })
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {profile.name}, {profile.age} лет
                      </Typography>
                      <Chip
                        size="small"
                        icon={<VerifyIcon />}
                        label={profile.isVerified ? "Проверено" : "Не проверено"}
                        color={profile.isVerified ? "success" : "warning"}
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Город:
                      </Typography>
                      <Typography variant="body2">
                        {cities.find(c => c.id === profile.cityId)?.name || 'Не указан'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Телефон:
                      </Typography>
                      <Typography variant="body2">
                        {profile.phone || 'Не указан'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Статус:
                      </Typography>
                      <Chip 
                        size="small" 
                        label={profile.isActive ? 'Активна' : 'Неактивна'} 
                        color={profile.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Tooltip title="Редактировать">
                      <IconButton onClick={() => handleOpenEditor(profile)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton onClick={() => handleDelete(profile.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={profile.isActive ? "Деактивировать" : "Активировать"}>
                      <IconButton 
                        onClick={() => handleToggleStatus(profile)} 
                        size="small"
                        color={profile.isActive ? "success" : "warning"}
                      >
                        {profile.isActive ? <CheckIcon /> : <BlockIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={profile.isVerified ? "Отменить проверку" : "Отметить как проверенную"}>
                      <IconButton 
                        onClick={() => handleVerify(profile.id)} 
                        size="small"
                        color={profile.isVerified ? "success" : "warning"}
                        disabled={processingIds[profile.id]}
                      >
                        {processingIds[profile.id] ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <VerifyIcon />
                        )}
                      </IconButton>
                    </Tooltip>
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
      
      {/* Добавляем Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilesPage;
