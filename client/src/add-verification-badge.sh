#!/bin/bash

# Проверяем, существует ли компонент ProfileCard
if [ -f "/root/escort/client/src/components/ProfileCard.tsx" ]; then
  # Создаем бэкап текущего файла
  cp /root/escort/client/src/components/ProfileCard.tsx /root/escort/client/src/components/ProfileCard.tsx.bak

  # Проверяем, есть ли уже компонент VerificationBadge
  if ! grep -q "VerificationBadge" /root/escort/client/src/components/ProfileCard.tsx; then
    # Добавляем импорт Chip и VerifiedIcon, если их нет
    sed -i '/import {/,/} from ".*mui\/material";/s/} from/  Chip,\n} from/' /root/escort/client/src/components/ProfileCard.tsx
    sed -i '/import {/,/} from ".*mui\/icons-material";/s/} from/  VerifiedUser as VerifiedIcon,\n} from/' /root/escort/client/src/components/ProfileCard.tsx
    
    # Находим подходящее место в карточке для отображения статуса верификации
    # Обычно это возле цены или имени
    line_num=$(grep -n "profile.name" /root/escort/client/src/components/ProfileCard.tsx | head -1 | cut -d':' -f1)
    
    if [ -n "$line_num" ]; then
      # Добавляем компонент верификации после имени
      sed -i "${line_num}a\
          {profile.isVerified && (\
            <Chip\
              color=\"success\"\
              size=\"small\"\
              label=\"Проверено\"\
              icon={<VerifiedIcon />}\
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}\
            />\
          )}" /root/escort/client/src/components/ProfileCard.tsx
    fi
  fi
  
  echo "Статус верификации добавлен в карточку профиля"
else
  echo "Файл ProfileCard.tsx не найден. Проверьте путь к компоненту карточки профиля."
fi
