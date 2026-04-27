document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');
    const userProfileData = document.getElementById('user-profile-data');

    // Проверяем, есть ли уже токен при загрузке страницы
    if (localStorage.getItem('token')) {
        showDashboard();
    }

    // Обработка отправки формы логина
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Останавливаем стандартную перезагрузку страницы

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // FastAPI OAuth2PasswordRequestForm требует формат URLSearchParams (как обычная HTML-форма), а не JSON
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            // Отправляем запрос на наш бэкенд
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Если всё отлично, сохраняем токен в хранилище браузера
                localStorage.setItem('token', data.access_token);
                authError.classList.add('hidden');
                showDashboard();
            } else {
                // Если ошибка (неверный пароль)
                authError.textContent = data.detail || 'Ошибка авторизации';
                authError.classList.remove('hidden');
            }
        } catch (error) {
            authError.textContent = 'Ошибка подключения к серверу';
            authError.classList.remove('hidden');
        }
    });

    // Обработка кнопки выхода
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token'); // Удаляем пропуск
        
        // Прячем дашборд, показываем логин
        dashboardSection.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        authSection.classList.remove('hidden');
        
        loginForm.reset(); // Очищаем поля формы
    });

    // Функция, которая прячет логин, показывает дашборд и дергает защищенный роутер /users/me
    async function showDashboard() {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');

        // Достаем токен из памяти
        const token = localStorage.getItem('token');

        try {
            // Делаем запрос к ЗАЩИЩЕННОМУ эндпоинту, прикрепляя токен в заголовки
            const response = await fetch('http://127.0.0.1:8000/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                // Красиво выводим JSON на экран
                userProfileData.textContent = JSON.stringify(userData, null, 2);
            } else {
                // Если токен просрочен или сломан — выбрасываем юзера на страницу входа
                logoutBtn.click(); 
            }
        } catch (error) {
            userProfileData.textContent = "Не удалось загрузить данные профиля.";
        }
    }
});