#!/bin/bash
echo "=== Поиск файла CitiesPage.tsx ==="
find /root/escort/client/src -name "CitiesPage.tsx" -type f -exec cat {} \;
