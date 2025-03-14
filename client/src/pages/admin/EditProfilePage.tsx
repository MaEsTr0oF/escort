import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import ProfileEditor from '../../components/admin/ProfileEditor';

const EditProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profileId = id ? parseInt(id) : undefined;

  const handleSave = () => {
    navigate('/admin/profiles');
  };

  const handleCancel = () => {
    navigate('/admin/profiles');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {profileId ? 'Редактирование анкеты' : 'Создание новой анкеты'}
        </Typography>
        <Button variant="outlined" onClick={handleCancel}>
          Назад к списку
        </Button>
      </Box>

      <ProfileEditor 
        profileId={profileId} 
        onSave={handleSave} 
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default EditProfilePage;
