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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VerifiedUser as VerifyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

interface Profile {
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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchProfiles();
  }, [token, navigate]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/profiles`, {
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/profiles/${id}`, {
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
      const response = await axios.post(`${API_URL}/profiles/${id}/verify`, {}, {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Управление анкетами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Добавить анкету
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Город</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Верификация</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Нет анкет для отображения
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.id}</TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.city?.name || 'Неизвестно'}</TableCell>
                  <TableCell>{profile.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={profile.isActive ? 'Активна' : 'Неактивна'}
                      color={profile.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={profile.isVerified ? 'Проверена' : 'Не проверена'}
                      color={profile.isVerified ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => handleEdit(profile.id)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {!profile.isVerified && (
                      <Tooltip title="Подтвердить анкету">
                        <IconButton
                          onClick={() => handleVerify(profile.id)}
                          size="small"
                          color="primary"
                        >
                          <VerifyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDelete(profile.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProfilesPage;
