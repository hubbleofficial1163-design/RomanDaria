document.addEventListener('DOMContentLoaded', function() {
    // Оптимизация для мобильных: предотвращаем быстрые множественные клики
    let isProcessing = false;
    
    // Обработка кнопки карты
    const mapButton = document.getElementById('map-btn');
    const mapContainer = document.getElementById('map-container');
    const closeMapButton = document.getElementById('close-map');
    
    if (mapButton && mapContainer) {
        mapButton.addEventListener('click', function(e) {
            if (isProcessing) return;
            isProcessing = true;
            
            e.preventDefault();
            mapContainer.classList.remove('hidden');
            
            setTimeout(() => {
                mapContainer.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                isProcessing = false;
            }, 300);
        });
    }
    
    if (closeMapButton) {
        closeMapButton.addEventListener('click', function(e) {
            if (isProcessing) return;
            isProcessing = true;
            
            e.preventDefault();
            mapContainer.classList.add('hidden');
            
            setTimeout(() => {
                if (mapButton) {
                    mapButton.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                isProcessing = false;
            }, 300);
        });
    }
    
    // Генерация календаря
    generateCalendar();
    
    // Инициализация формы с отправкой в Google Sheets
    initRSVPForm();
    
    // Оптимизация для iOS
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Оптимизация загрузки изображений
    lazyLoadImages();
});

// ========== МОДАЛЬНОЕ ОКНО ==========
function showModal(title, message, isError = false) {
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    const icon = isError ? '❌' : '✅';
    const btnColor = isError ? '#dc3545' : '#28a745';

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 30px 40px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            animation: slideUp 0.3s ease;
            border-top: 4px solid ${btnColor};
        ">
            <div style="font-size: 4rem; margin-bottom: 15px;">${icon}</div>
            <h3 style="
                font-family: 'Playfair Display', serif;
                font-size: 1.8rem;
                color: #333;
                margin-bottom: 15px;
            ">${title}</h3>
            <p style="
                font-family: 'Raleway', sans-serif;
                font-size: 1rem;
                color: #666;
                margin-bottom: 25px;
                line-height: 1.5;
            ">${message}</p>
            <button onclick="this.closest('#customModal').remove()" style="
                background: ${btnColor};
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 30px;
                font-family: 'Raleway', sans-serif;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                Закрыть
            </button>
        </div>
    `;

    // Добавляем анимации если нет
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    if (!isError) {
        setTimeout(() => {
            if (modal.parentElement) modal.remove();
        }, 5000);
    }
}

// ========== GOOGLE SHEETS ==========
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBkdXcxX5bz1e3NPxEq59QLp_cc4h-W-EKXzq-WU6vYEEbV2zfh61FB-FRpUOqA-F1/exec'; // ЗАМЕНИТЕ НА ВАШ URL

// Инициализация формы RSVP
function initRSVPForm() {
    const rsvpForm = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');
    
    if (!rsvpForm) return;
    
    rsvpForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Получение данных формы
        const nameInput = document.getElementById('name');
        const guestsSelect = document.getElementById('guests');
        const attendanceSelect = document.getElementById('attendance');
        const wishesTextarea = document.getElementById('wishes');
        const dietaryTextarea = document.getElementById('dietary');
        
        // Валидация
        if (!nameInput.value.trim()) {
            showModal('Ошибка', 'Пожалуйста, введите ваше имя', true);
            nameInput.focus();
            return;
        }
        
        if (!guestsSelect.value) {
            showModal('Ошибка', 'Пожалуйста, выберите количество гостей', true);
            guestsSelect.focus();
            return;
        }
        
        if (!attendanceSelect.value) {
            showModal('Ошибка', 'Пожалуйста, выберите вариант присутствия', true);
            attendanceSelect.focus();
            return;
        }
        
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Показываем загрузку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        // Создаем модальное окно загрузки
        const loadingModal = document.createElement('div');
        loadingModal.id = 'loadingModal';
        loadingModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        loadingModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px 40px;
                text-align: center;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #222;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="
                    font-family: 'Raleway', sans-serif;
                    font-size: 1rem;
                    color: #666;
                ">Отправка ответа...</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // Формируем данные для отправки
            const formDataToSend = new URLSearchParams();
            formDataToSend.append('name', nameInput.value.trim());
            formDataToSend.append('guests', guestsSelect.value);
            formDataToSend.append('attendance', attendanceSelect.value);
            formDataToSend.append('wishes', wishesTextarea ? wishesTextarea.value.trim() : '');
            formDataToSend.append('dietary', dietaryTextarea ? dietaryTextarea.value.trim() : '');
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formDataToSend.toString()
            });
            
            const result = await response.json();
            
            loadingModal.remove();
            
            if (result.result === 'success') {
                const attendanceText = attendanceSelect.value === 'yes' 
                    ? 'Ждём вас на нашей свадьбе!' 
                    : 'Очень жаль, что вы не сможете быть с нами.';
                
                showModal(
                    'Спасибо, ' + nameInput.value.trim() + '!',
                    'Ваш ответ успешно отправлен.<br>' + attendanceText + ' 🎉',
                    false
                );
                
                // Очищаем форму
                rsvpForm.reset();
                
                // Скрыть сообщение если было
                if (formMessage) {
                    formMessage.style.display = 'none';
                }
            } else {
                throw new Error(result.message || 'Ошибка отправки');
            }
        } catch (error) {
            loadingModal.remove();
            showModal(
                'Ошибка',
                error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.',
                true
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Генерация календаря на июль 2026
function generateCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) return;
    
    // Первый день июля 2026
    const firstDayOfMonth = new Date(2026, 6, 1);
    let startingDayOfWeek = firstDayOfMonth.getDay();
    // Преобразуем в формат ПН=0
    let startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const daysInMonth = 31;
    const lastDayOfPrevMonth = new Date(2026, 6, 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();
    
    calendarDays.innerHTML = '';
    
    // Дни предыдущего месяца
    for (let i = startOffset - 1; i >= 0; i--) {
        const prevMonthDay = daysInPrevMonth - i;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = prevMonthDay;
        calendarDays.appendChild(dayDiv);
    }
    
    // Дни июля
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        
        if (day === 9) {
            dayDiv.classList.add('wedding-date');
        }
        
        calendarDays.appendChild(dayDiv);
    }
    
    // Заполняем оставшиеся ячейки днями августа
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const cellsFilled = startOffset + daysInMonth;
    const remainingCells = totalCells - cellsFilled;
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = day;
        calendarDays.appendChild(dayDiv);
    }
}

// Оптимизация загрузки изображений
function lazyLoadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.getAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        img.addEventListener('error', function() {
            console.warn('Не удалось загрузить изображение:', this.src);
        });
    });
}

// Фикс для iOS Safari 100vh
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
