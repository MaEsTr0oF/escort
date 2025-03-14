import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  styled,
} from '@mui/material';
import {
  PeopleOutline as PeopleIcon,
  LocationCityOutlined as CityIcon,
  VerifiedOutlined as VerifiedIcon,
  SupervisorAccountOutlined as AdminIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const StatIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(2),
}));

// Функция для форматирования даты
const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return 'Неизвестно';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    profiles: 0,
    cities: 0,
    verified: 0,
    admins: 0,
  });
  const [latestProfiles, setLatestProfiles] = useState<any[]>([]);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchLatestProfiles = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/profiles`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 },
        });
        
        if (Array.isArray(response.data)) {
          setLatestProfiles(response.data);
        } else {
          console.error('Expected array but got:', typeof response.data);
          setLatestProfiles([]);
        }
      } catch (error) {
        console.error('Error fetching latest profiles:', error);
        setLatestProfiles([]);
      }
    };

    if (token) {
      fetchStats();
      fetchLatestProfiles();
    }
  }, [token]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Панель администратора
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StatIcon>
                <PeopleIcon fontSize="large" />
              </StatIcon>
              <Typography variant="h4" align="center">
                {stats.profiles}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Анкеты
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StatIcon>
                <CityIcon fontSize="large" />
              </StatIcon>
              <Typography variant="h4" align="center">
                {stats.cities}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Города
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StatIcon>
                <VerifiedIcon fontSize="large" />
              </StatIcon>
              <Typography variant="h4" align="center">
                {stats.verified}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Проверенные
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StatIcon>
                <AdminIcon fontSize="large" />
              </StatIcon>
              <Typography variant="h4" align="center">
                {stats.admins}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Администраторы
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Последние анкеты
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Фото</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Город</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Добавлена</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {latestProfiles.length > 0 ? (
                  latestProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <Avatar
                          alt={profile.name}
                          src={profile.photos && profile.photos.length > 0 ? profile.photos[0] : ''}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell>{profile.name}</TableCell>
                      <TableCell>{profile.city?.name || 'Неизвестно'}</TableCell>
                      <TableCell>
                        {profile.isVerified ? (
                          <Chip
                            label="Проверена"
                            color="success"
                            size="small"
                            icon={<VerifiedIcon />}
                          />
                        ) : (
                          <Chip label="Не проверена" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(profile.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Нет данных
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default AdminDashboard;
