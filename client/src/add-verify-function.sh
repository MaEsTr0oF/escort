#!/bin/bash
# Этот скрипт предлагает код для добавления функции верификации

echo "Функция для верификации профилей:"
cat << 'END'
// Добавьте эту функцию в компонент AdminProfilesPage или аналогичный:

const handleVerify = async (profileId: number, currentStatus: boolean) => {
  try {
    // Отправляем запрос на изменение статуса верификации
    await api.patch(`/admin/profiles/${profileId}/verify`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Обновляем список профилей после успешного изменения
    fetchProfiles();
    
    // Показываем уведомление об успехе (если у вас есть компонент для уведомлений)
    // showNotification('Статус верификации успешно изменен', 'success');
  } catch (error) {
    console.error('Ошибка при изменении статуса верификации:', error);
    // showNotification('Ошибка при изменении статуса верификации', 'error');
  }
};

// Убедитесь, что у вас есть кнопка, которая вызывает эту функцию:
<IconButton 
  onClick={() => handleVerify(profile.id, profile.isVerified)} 
  size="small"
  color={profile.isVerified ? "success" : "default"}
>
  <VerifiedUser />
</IconButton>
END

echo "Добавьте этот код в файл AdminProfilesPage.tsx или аналогичный компонент управления профилями"
