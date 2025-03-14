import React from 'react';
import {
  Box,
  Typography,
  ImageList,
  ImageListItem,
  Paper,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { Profile } from '../types';
import { serviceTranslations } from '../utils/serviceTranslations';

interface ProfileViewProps {
  profile: Profile;
}

const ProfileImage = ({ src, alt, loading }: { src: string; alt: string; loading?: 'lazy' | 'eager' }) => (
  <img
    src={src}
    alt={alt}
    loading={loading}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '8px',
    }}
  />
);

const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  const services = JSON.parse(profile.services || '[]');
  const photos = JSON.parse(profile.photos || '[]');

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Фотографии */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Фотографии
          </Typography>
          <ImageList cols={2} gap={16}>
            {photos.map((photo: string, index: number) => (
              <ImageListItem key={index}>
                <ProfileImage
                  src={photo}
                  alt={`Фото ${index + 1}`}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        {/* Основная информация */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Основная информация
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Имя:</strong> {profile.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Возраст:</strong> {profile.age} лет
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Рост:</strong> {profile.height} см
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Вес:</strong> {profile.weight} кг
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Размер груди:</strong> {profile.breastSize}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Телефон:</strong> {profile.phone}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Описание */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Описание
          </Typography>
          <Typography variant="body1">
            {profile.description}
          </Typography>
        </Grid>

        {/* Услуги */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Услуги
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {services.map((service: string) => (
              <Chip
                key={service}
                label={serviceTranslations[service] || service}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        {/* Цены */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Цены
          </Typography>
          <Grid container spacing={2}>
            {profile.priceExpress > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle1">
                  <strong>Экспресс:</strong> {profile.priceExpress} ₽
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1">
                <strong>1 час:</strong> {profile.price1Hour} ₽
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1">
                <strong>2 часа:</strong> {profile.price2Hours} ₽
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1">
                <strong>Ночь:</strong> {profile.priceNight} ₽
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Дополнительная информация */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Дополнительная информация
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Город:</strong> {profile.city?.name}
              </Typography>
            </Grid>
            {profile.district && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  <strong>Район:</strong> {profile.district}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Место встречи:</strong>
                {profile.inCall && ' У себя'}
                {profile.outCall && ' Выезд'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Статус:</strong>
                {profile.isVerified && ' ✅ Проверенная'}
                {profile.isNew && ' 🆕 Новенькая'}
                {profile.isWaitingCall && ' 📞 Ждёт звонка'}
                {profile.is24Hours && ' ⏰ Круглосуточно'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfileView; 