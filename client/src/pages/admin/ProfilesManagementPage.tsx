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

const ProfilesManagementPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles for management page');
      const response = await api.get('/admin/profiles');
      console.log('Profiles response:', response.data);
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleVerify = async (profileId: number, currentStatus: boolean) => {
    try {
      setProcessingIds(prev => ({ ...prev, [profileId]: true }));
      console.log(`Verifying profile ${profileId}, current status: ${currentStatus}`);
      
      // Используем правильный API endpoint для верификации
      await api.patch(`/admin/profiles/${profileId}/verify`, {
        isVerified: !currentStatus
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
    if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
      try {
        await api.delete(`/profiles/${profileId}`);
        fetchProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setShowEditor(true);
  };

  const handleAdd = () => {
    setEditingProfile(null);
    setShowEditor(true);
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
    try {
      setProcessingIds(prev => ({ ...prev, [profileId]: true }));
      console.log(`Toggling status for profile ${profileId}, current status: ${currentStatus}`);
      
      // Используем правильный API endpoint для переключения статуса
      await api.patch(`/admin/profiles/${profileId}/toggle-active`, {
        isActive: !currentStatus
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
              Управление анкетами
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Добавить анкету
            </Button>
          </Box>

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
                          Город: {profile.city?.name || 'все города'}
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
                        <IconButton onClick={() => handleEdit(profile)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(profile.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleToggleActive(profile.id, profile.isActive)}
                          color={profile.isActive ? "success" : "inherit"}
                          disabled={processingIds[profile.id]}
                        >
                          {processingIds[profile.id] ? <CircularProgress size={24} /> : <CheckIcon />}
                        </IconButton>
                        <IconButton 
                          onClick={() => handleVerify(profile.id, profile.isVerified)}
                          color={profile.isVerified ? "success" : "inherit"}
                          disabled={processingIds[profile.id]}
                        >
                          {processingIds[profile.id] ? <CircularProgress size={24} /> : <VerifiedIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
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