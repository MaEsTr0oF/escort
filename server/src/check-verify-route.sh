#!/bin/bash
# Проверяем наличие маршрута верификации в коде

echo "Проверка маршрута верификации в index.ts..."
grep -n "verify" /root/escort/server/src/index.ts

echo -e "\nПроверка контроллера verifyProfile..."
grep -n "verifyProfile" /root/escort/server/src/controllers/profileController.ts

echo -e "\nПроверка клиентского кода для верификации..."
find /root/escort/client/src -type f -name "*.tsx" -exec grep -l "verify" {} \;
