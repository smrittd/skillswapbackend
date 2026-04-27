document.addEventListener('DOMContentLoaded', () => {
    // Элементы UI
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const logoutBtn = document.getElementById('logout-btn');
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    
    // Вкладки
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Дашборд
    const displayUsername = document.getElementById('display-username');
    const displayEmail = document.getElementById('display-email');
    const createSkillForm = document.getElementById('create-skill-form');
    const skillsGrid = document.getElementById('skills-grid');
    const searchInput = document.getElementById('search-input');

    let allPublicSkills = []; // Хранилище всех скиллов для локального поиска

    // Проверяем токен при загрузке
    if (localStorage.getItem('token')) {
        initDashboard();
    }

    // --- ЛОГИКА ВКЛАДОК (ВХОД / РЕГИСТРАЦИЯ) ---
    tabLogin.addEventListener('click', () => {
        tabLogin.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow text-gray-800 transition-all";
        tabRegister.className = "flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-800 transition-all";
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        hideMessages();
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow text-gray-800 transition-all";
        tabLogin.className = "flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-800 transition-all";
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        hideMessages();
    });

    function hideMessages() {
        authError.classList.add('hidden');
        authSuccess.classList.add('hidden');
    }

    // --- РЕГИСТРАЦИЯ ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();
        
        const payload = {
            email: document.getElementById('reg-email').value,
            username: document.getElementById('reg-username').value,
            password: document.getElementById('reg-password').value
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                authSuccess.textContent = 'Аккаунт успешно создан! Теперь выполните вход.';
                authSuccess.classList.remove('hidden');
                registerForm.reset();
                tabLogin.click(); // Автоматически переключаем на вкладку входа
            } else {
                authError.textContent = data.detail || 'Ошибка регистрации';
                authError.classList.remove('hidden');
            }
        } catch (error) {
            authError.textContent = 'Ошибка подключения к серверу';
            authError.classList.remove('hidden');
        }
    });

    // --- ВХОД В СИСТЕМУ ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const formData = new URLSearchParams();
        formData.append('username', document.getElementById('login-username').value);
        formData.append('password', document.getElementById('login-password').value);

        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                initDashboard();
            } else {
                authError.textContent = data.detail || 'Неверный логин или пароль';
                authError.classList.remove('hidden');
            }
        } catch (error) {
            authError.textContent = 'Ошибка подключения к серверу';
            authError.classList.remove('hidden');
        }
    });

    // --- ВЫХОД ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        dashboardSection.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        authSection.classList.remove('hidden');
        loginForm.reset();
    });

    // --- ИНИЦИАЛИЗАЦИЯ ДАШБОРДА ---
    async function initDashboard() {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');

        await loadUserProfile();
        await loadPublicSkills();
    }

    // --- ЗАГРУЗКА ПРОФИЛЯ ---
    async function loadUserProfile() {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            displayUsername.textContent = user.username;
            displayEmail.textContent = user.email;
        } else {
            logoutBtn.click(); // Токен умер
        }
    }

    // --- СОЗДАНИЕ НАВЫКА ---
    createSkillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const payload = {
            title: document.getElementById('skill-title').value,
            description: document.getElementById('skill-desc').value
        };

        const response = await fetch('http://127.0.0.1:8000/skills/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            createSkillForm.reset();
            await loadPublicSkills(); // Обновляем ленту после добавления
        } else {
            alert('Не удалось создать навык. Проверьте данные.');
        }
    });

    // --- ЗАГРУЗКА ЛЕНТЫ НАВЫКОВ ---
    async function loadPublicSkills() {
        const response = await fetch('http://127.0.0.1:8000/skills/public');
        if (response.ok) {
            allPublicSkills = await response.json();
            
            // Сортируем так, чтобы новые навыки были сверху (если id идет по порядку)
            allPublicSkills.sort((a, b) => b.id - a.id);
            
            renderSkills(allPublicSkills);
        }
    }

    // --- ОТРИСОВКА КАРТОЧЕК ---
    function renderSkills(skillsArray) {
        skillsGrid.innerHTML = ''; // Очищаем старые
        
        if (skillsArray.length === 0) {
            skillsGrid.innerHTML = '<p class="text-gray-500 col-span-full">Навыки не найдены.</p>';
            return;
        }

        skillsArray.forEach(skill => {
            // Создаем красивую карточку для каждого навыка
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group';
            
            card.innerHTML = `
                <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-lg font-bold text-gray-900">${skill.title}</h4>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${skill.description || 'Описание отсутствует'}</p>
                <div class="pt-4 border-t border-gray-50 flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-primary flex items-center justify-center font-bold text-sm">
                        ${skill.owner.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-gray-700">${skill.owner.username}</p>
                        <p class="text-xs text-gray-400">${skill.owner.email}</p>
                    </div>
                </div>
            `;
            skillsGrid.appendChild(card);
        });
    }

    // --- МГНОВЕННЫЙ ПОИСК ---
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        // Фильтруем массив всех скиллов
        const filteredSkills = allPublicSkills.filter(skill => {
            const titleMatch = skill.title.toLowerCase().includes(query);
            const descMatch = (skill.description || '').toLowerCase().includes(query);
            const authorMatch = skill.owner.username.toLowerCase().includes(query);
            
            return titleMatch || descMatch || authorMatch;
        });
        
        renderSkills(filteredSkills);
    });

});