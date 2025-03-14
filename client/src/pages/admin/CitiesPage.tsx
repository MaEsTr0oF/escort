import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { api } from '../../utils/api';
import { City } from '../../types';
import { useNavigate } from 'react-router-dom';

interface CityWithCount extends City {
  _count?: {
    profiles: number;
  };
}

const CitiesPage: React.FC = () => {
  const [cities, setCities] = useState<CityWithCount[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<Partial<City> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/cities');
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setError('Ошибка при загрузке списка городов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleOpen = (city?: City) => {
    setEditingCity(city || { name: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setEditingCity(null);
    setOpen(false);
    setError('');
  };

  const handleSave = async () => {
    if (!editingCity?.name) {
      setError('Название города не может быть пустым');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingCity.id) {
        await api.put(`/admin/cities/${editingCity.id}`, editingCity);
      } else {
        await api.post('/admin/cities', editingCity);
      }

      fetchCities();
      handleClose();
    } catch (error) {
      console.error('Error saving city:', error);
      setError('Ошибка при сохранении города');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот город?')) return;

    try {
      setLoading(true);
      setError('');
      await api.delete(`/admin/cities/${id}`);
      fetchCities();
    } catch (error) {
      console.error('Error deleting city:', error);
      setError('Ошибка при удалении города');
    } finally {
      setLoading(false);
    }
  };

  if (loading && cities.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Управление городами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить город
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
              <TableCell>Название</TableCell>
              <TableCell>Кол-во анкет</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell>{city.id}</TableCell>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city._count?.profiles || 0}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(city)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(city.id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {cities.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Нет доступных городов
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingCity?.id ? 'Редактировать город' : 'Добавить город'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название города"
            fullWidth
            value={editingCity?.name || ''}
            onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
            error={!editingCity?.name}
            helperText={!editingCity?.name ? 'Название города обязательно' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Отмена</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading || !editingCity?.name}
          >
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CitiesPage; 