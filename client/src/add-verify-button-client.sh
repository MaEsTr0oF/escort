#!/bin/bash

echo "=== Создание тестовой страницы с клиентским кодом верификации ==="

mkdir -p /var/www/html/escort/admin-test
cat > /var/www/html/escort/admin-test/index.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>Тест функционала верификации</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        .verified { background: green; color: white; padding: 5px; border-radius: 5px; }
        .not-verified { background: gray; color: white; padding: 5px; border-radius: 5px; }
        #profiles { margin-top: 20px; }
        .profile { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Тест функционала верификации</h1>
    <button id="loadProfiles">Загрузить профили</button>
    <div id="profiles"></div>

    <script>
        // Получение токена из localStorage
        const token = localStorage.getItem('adminToken');
        
        // Функция загрузки профилей
        async function loadProfiles() {
            const profilesDiv = document.getElementById('profiles');
            profilesDiv.innerHTML = 'Загрузка...';
            
            try {
                const response = await fetch('/api/admin/profiles', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ошибка: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.length === 0) {
                    profilesDiv.innerHTML = 'Нет профилей';
                    return;
                }
                
                let html = '';
                data.forEach(profile => {
                    html += `<div class="profile">
                        <h3>${profile.name}, ${profile.age} лет</h3>
                        <p>ID: ${profile.id}</p>
                        <p>Статус: <span class="${profile.isVerified ? 'verified' : 'not-verified'}">
                            ${profile.isVerified ? 'Проверено' : 'Не проверено'}
                        </span></p>
                        <button onclick="toggleVerify(${profile.id})">
                            ${profile.isVerified ? 'Снять верификацию' : 'Верифицировать'}
                        </button>
                    </div>`;
                });
                
                profilesDiv.innerHTML = html;
            } catch (error) {
                profilesDiv.innerHTML = 'Ошибка: ' + error.message;
                console.error(error);
            }
        }
        
        // Функция изменения статуса верификации
        async function toggleVerify(id) {
            try {
                const response = await fetch(`/api/admin/profiles/${id}/verify`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ошибка: ${response.status}`);
                }
                
                // Перезагружаем профили после изменения
                loadProfiles();
                
            } catch (error) {
                alert('Ошибка: ' + error.message);
                console.error(error);
            }
        }
        
        // Привязываем обработчик события к кнопке
        document.getElementById('loadProfiles').addEventListener('click', loadProfiles);
        
        // Автоматическая загрузка при наличии токена
        if (token) {
            loadProfiles();
        } else {
            document.getElementById('profiles').innerHTML = 
                'Необходимо войти в админку. <a href="/admin/login">Войти</a>';
        }
        
        // Добавляем глобальную функцию для верификации
        window.toggleVerify = toggleVerify;
    </script>
</body>
</html>
END

echo "Тестовая страница админки создана: http://eskortvsegorodarfreal.site/admin-test/"
echo "Вам нужно залогиниться в админку до её использования"

echo "=== Настройка прав доступа ==="
chmod -R 755 /var/www/html/escort/admin-test
chown -R www-data:www-data /var/www/html/escort/admin-test
