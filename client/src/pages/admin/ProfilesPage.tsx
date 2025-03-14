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
      setError('');
      console.log('Загрузка списка анкет...');
      
      // Проверяем, есть ли токен
      if (!token) {
        console.error('Отсутствует токен авторизации');
        navigate('/admin/login');
        return;
      }
      
      const response = await api.get('/admin/profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Проверяем ответ
      if (response.status >= 200 && response.status < 300) {
        console.log('Успешно получены данные анкет:', response.data);
        
        // Проверка, является ли response.data массивом
        if (Array.isArray(response.data)) {
          console.log(`Получено ${response.data.length} анкет`);
          setProfiles(response.data);
        } else {
          console.error('Expected array but got:', typeof response.data, response.data);
          setProfiles([]);
          setError('Данные профилей в неверном формате');
        }
      } else {
        throw new Error(`Ошибка API: ${response.status}`);
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
      console.log('Fetching full profile data for ID:', id);
      const response = await api.get(`/profiles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Full profile data received:', response.data);
      console.log('Photos type:', typeof response.data.photos);
      console.log('Photos value:', response.data.photos);
      console.log('Services type:', typeof response.data.services);
      console.log('Services value:', response.data.services);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching full profile:', error);
      return null;
    }
  };

  const handleOpenEditor = async (profile?: ProfileListItem) => {
    if (profile) {
      // Получаем полные данные для редактирования
      console.log('Opening editor for profile:', profile.id);
      const fullProfile = await fetchFullProfile(profile.id);
      if (fullProfile) {
        console.log('Setting profile data for editor:', fullProfile);
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
      console.log(`Переключение статуса для профиля ${profile.id}, текущий статус: ${profile.isActive}`);
      
      // Проверяем, есть ли токен
      if (!token) {
        console.error('Отсутствует токен авторизации');
        navigate('/admin/login');
        return;
      }
      
      // Используем правильный эндпоинт с токеном авторизации
      const response = await api.patch(`/admin/profiles/${profile.id}/toggle-active`, 
        { isActive: !profile.isActive },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      // Проверяем успешность ответа
      if (response.status >= 200 && response.status < 300) {
        console.log('Успешное переключение статуса, ответ:', response.data);
        
        // Показываем уведомление об успехе
        setSnackbar({
          open: true,
          message: `Анкета ${!profile.isActive ? 'активирована' : 'деактивирована'}`,
          severity: 'success',
        });
        
        // Обновляем список анкет
        fetchProfiles();
      } else {
        throw new Error(`Ошибка API: ${response.status}`);
      }
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
      console.log(`Верификация профиля с ID ${id}`);
      
      // Находим профиль в текущем списке для определения текущего статуса
      const profile = profiles.find(p => p.id === id);
      if (!profile) {
        throw new Error('Профиль не найден');
      }
      
      const newVerifiedStatus = !profile.isVerified;
      console.log(`Текущий статус верификации: ${profile.isVerified}, новый статус: ${newVerifiedStatus}`);
      
      // Используем правильный эндпоинт с токеном авторизации
      const response = await api.patch(`/admin/profiles/${id}/verify`, 
        { isVerified: newVerifiedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Проверяем успешность ответа
      if (response.status >= 200 && response.status < 300) {
        console.log('Успешная верификация, получен ответ:', response.data);
        
        // Показываем уведомление об успехе
        setSnackbar({
          open: true,
          message: `Анкета ${newVerifiedStatus ? 'проверена' : 'отмечена как непроверенная'}`,
          severity: 'success',
        });
        
        // Обновляем список анкет
        fetchProfiles();
      } else {
        throw new Error(`Ошибка API: ${response.status}`);
      }
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

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              <strong>Верификация анкет:</strong> Нажмите на статус &quot;Проверено/Не проверено&quot; или используйте кнопку <VerifyIcon fontSize="small" sx={{ verticalAlign: 'middle' }}/> для верификации анкеты. Верифицированные анкеты помечаются зеленым цветом.
            </Typography>
          </Alert>

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
                      <Tooltip title={profile.isVerified ? "Нажмите, чтобы отменить верификацию" : "Нажмите, чтобы верифицировать анкету"}>
                        <Chip
                          size="small"
                          icon={<VerifyIcon />}
                          label={profile.isVerified ? "Проверено" : "Не проверено"}
                          color={profile.isVerified ? "success" : "warning"}
                          onClick={() => handleVerify(profile.id)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9,
                              transform: 'scale(1.05)',
                            }
                          }}
                        />
                      </Tooltip>
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
                        sx={{ 
                          transition: 'all 0.2s',
                          animation: processingIds[profile.id] ? 'none' : 'pulse 1.5s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' },
                          }
                        }}
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
