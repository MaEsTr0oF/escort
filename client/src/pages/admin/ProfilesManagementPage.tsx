import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  VerifiedUser as VerifiedIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Profile } from '../../types';
import { api } from '../../utils/api';
import ProfileEditor from '../../components/admin/ProfileEditor';
import { useNavigate } from 'react-router-dom';

const ProfilesManagementPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchProfiles();
  }, [navigate]);

  const fetchProfiles = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profiles for management page');
      
      const response = await api.get('/admin/profiles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profiles response:', response.data);
      if (Array.isArray(response.data)) {
        setProfiles(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Получен неверный формат данных');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Ошибка при загрузке списка анкет');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (profileId: number, currentStatus: boolean) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    try {
      setProcessingIds(prev => ({ ...prev, [profileId]: true }));
      console.log(`Verifying profile ${profileId}, current status: ${currentStatus}`);
      
      // Используем правильный API endpoint для верификации с токеном авторизации
      await api.patch(`/admin/profiles/${profileId}/verify`, {
        isVerified: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Обновляем список анкет
      fetchProfiles();
      
      // Показываем сообщение об успехе
      setSnackbar({
        open: true,
        message: `Анкета ${!currentStatus ? 'верифицирована' : 'снята с верификации'}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error verifying profile:', error);
      
      // Показываем сообщение об ошибке
      setSnackbar({
        open: true,
        message: 'Ошибка при изменении статуса верификации',
        severity: 'error',
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [profileId]: false }));
    }
  };

  const handleDelete = async (profileId: number) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
      try {
        await api.delete(`/profiles/${profileId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при удалении анкеты',
          severity: 'error',
        });
      }
    }
  };

  const handleEdit = (profile: Profile) => {
    // Вместо отображения редактора в текущем компоненте, переходим на страницу редактирования
    navigate(`/admin/profiles/${profile.id}/edit`);
  };

  const handleAdd = () => {
    navigate(`/admin/profiles/new`);
  };

  const handleSaveEdit = async (updatedProfile: Profile) => {
    try {
      await api.put(`/profiles/${updatedProfile.id}`, updatedProfile);
      setShowEditor(false);
      setEditingProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleToggleActive = async (profileId: number, currentStatus: boolean) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    try {
      setProcessingIds(prev => ({ ...prev, [profileId]: true }));
      console.log(`Toggling status for profile ${profileId}, current status: ${currentStatus}`);
      
      // Используем правильный API endpoint для переключения статуса с токеном авторизации
      await api.patch(`/admin/profiles/${profileId}/toggle-active`, {
        isActive: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Обновляем список анкет
      fetchProfiles();
      
      // Показываем сообщение об успехе
      setSnackbar({
        open: true,
        message: `Анкета ${!currentStatus ? 'активирована' : 'деактивирована'}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error toggling profile status:', error);
      
      // Показываем сообщение об ошибке
      setSnackbar({
        open: true,
        message: 'Ошибка при изменении статуса анкеты',
        severity: 'error',
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [profileId]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {!showEditor ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              правление анкетами
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Добавить анкету
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {profiles.map((profile) => (
                <Grid item xs={12} key={profile.id}>
                  <Card sx={{ 
                    bgcolor: 'background.paper',
                    border: profile.isVerified ? '2px solid green' : '1px solid grey',
                    opacity: profile.isActive ? 1 : 0.6,
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" component="div">
                            {profile.name}, {profile.age} лет
                          </Typography>
                          <Typography color="text.secondary">
                            Город: {profile.city?.name || 'не указан'}
                          </Typography>
                          <Typography color="text.secondary">
                            Телефон: {profile.phone}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={1}>
                            <Chip 
                              label={profile.isActive ? 'Активна' : 'Отключена'}
                              color={profile.isActive ? 'success' : 'default'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={profile.isVerified ? 'Верифицирована' : 'Не верифицирована'}
                              color={profile.isVerified ? 'primary' : 'default'}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Редактировать">
                            <IconButton onClick={() => handleEdit(profile)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton onClick={() => handleDelete(profile.id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={profile.isActive ? "Деактивировать" : "Активировать"}>
                            <IconButton 
                              onClick={() => handleToggleActive(profile.id, profile.isActive)}
                              color={profile.isActive ? "success" : "inherit"}
                              disabled={processingIds[profile.id]}
                            >
                              {processingIds[profile.id] ? <CircularProgress size={24} /> : <CheckIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={profile.isVerified ? "Снять верификацию" : "Верифицировать"}>
                            <IconButton 
                              onClick={() => handleVerify(profile.id, profile.isVerified)}
                              color={profile.isVerified ? "primary" : "warning"}
                              disabled={processingIds[profile.id]}
                            >
                              {processingIds[profile.id] ? <CircularProgress size={24} /> : <VerifiedIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setShowEditor(false)}
            >
              Вернуться к списку
            </Button>
          </Box>
          
          <ProfileEditor
            profile={editingProfile || undefined}
            onSave={handleSaveEdit}
            onClose={() => setShowEditor(false)}
          />
        </>
      )}
    </Box>
  );
};

export default ProfilesManagementPage; 
