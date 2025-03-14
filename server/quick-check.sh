#!/bin/bash

echo "=== Проверка процессов PM2 ==="
pm2 list

echo -e "\n=== Проверка прослушиваемых портов ==="
netstat -tulpn | grep 3001

echo -e "\n=== Проверка и запуск сервера вручную ==="
cd /root/escort/server
ls -la
ls -la build || echo "Директория build не существует"
