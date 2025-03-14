#!/bin/bash

# Создаем бэкап текущего файла
cp /root/escort/client/src/pages/admin/ProfilesPage.tsx /root/escort/client/src/pages/admin/ProfilesPage.tsx.bak

# Ищем функцию handleVerify в файле
if grep -q "handleVerify" /root/escort/client/src/pages/admin/ProfilesPage.tsx; then
  # Функция уже существует, проверяем, правильно ли она работает
  # Заменяем текущую функцию handleVerify на новую
  sed -i '/const handleVerify/,/};/c\
  const handleVerify = async (id: number) => {\
    try {\
      await api.patch(`/admin/profiles/${id}/verify`, {}, {\
        headers: {\
          Authorization: `Bearer ${token}`,\
        },\
      });\
      fetchProfiles();\
    } catch (error) {\
      console.error("Ошибка при изменении статуса верификации:", error);\
      setError("Ошибка при изменении статуса верификации");\
    }\
  };' /root/escort/client/src/pages/admin/ProfilesPage.tsx
else
  # Функция не существует, добавляем ее после handleToggleStatus
  sed -i '/handleToggleStatus/,/};/a\
\
  const handleVerify = async (id: number) => {\
    try {\
      await api.patch(`/admin/profiles/${id}/verify`, {}, {\
        headers: {\
          Authorization: `Bearer ${token}`,\
        },\
      });\
      fetchProfiles();\
    } catch (error) {\
      console.error("Ошибка при изменении статуса верификации:", error);\
      setError("Ошибка при изменении статуса верификации");\
    }\
  };' /root/escort/client/src/pages/admin/ProfilesPage.tsx
fi

# Убеждаемся что кнопка верификации добавлена в UI
# Ищем <CardActions> и добавляем в него кнопку верификации, если её нет
if ! grep -q "VerifyIcon" /root/escort/client/src/pages/admin/ProfilesPage.tsx; then
  # Импортируем нужную иконку, если её нет
  sed -i '/import {/,/} from ".*mui\/icons-material";/s/} from/  VerifiedUser as VerifyIcon,\n} from/' /root/escort/client/src/pages/admin/ProfilesPage.tsx

  # Добавляем кнопку верификации в CardActions
  sed -i '/<\/IconButton>/a\
                    <IconButton \
                      onClick={() => handleVerify(profile.id)} \
                      size="small"\
                      color={profile.isVerified ? "success" : "default"}\
                    >\
                      <VerifyIcon />\
                    </IconButton>' /root/escort/client/src/pages/admin/ProfilesPage.tsx
fi

echo "Кнопка верификации добавлена в админ-панель"
