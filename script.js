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
            
            // Плавная прокрутка с учетом мобильных устройств
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
            
            // Прокрутка обратно к кнопке
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
    
    // Обработка формы RSVP с оптимизацией для мобильных
    const rsvpForm = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');
    
    if (rsvpForm) {
        // Фокус на первое поле при открытии формы на мобильных
        // const firstInput = rsvpForm.querySelector('input, select, textarea');
        // if (firstInput && window.innerWidth < 768) {
        //     setTimeout(() => {
        //         firstInput.focus();
        //     }, 500);
        // }
        
        rsvpForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (isProcessing) return;
            isProcessing = true;
            
            // Получение данных формы
            const formData = new FormData(rsvpForm);
            const formDataObj = Object.fromEntries(formData.entries());
            
            // Валидация формы
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const guestsSelect = document.getElementById('guests');
            const attendanceSelect = document.getElementById('attendance');
            
            // Сброс предыдущих сообщений об ошибках
            formMessage.className = 'form-message';
            formMessage.style.display = 'none';
            
            // Проверка обязательных полей
            if (!nameInput.value.trim()) {
                formMessage.textContent = 'Пожалуйста, введите ваше имя';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                nameInput.focus();
            } else if (!emailInput.value.trim()) {
                formMessage.textContent = 'Пожалуйста, введите ваш email';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                emailInput.focus();
            } else if (!guestsSelect.value) {
                formMessage.textContent = 'Пожалуйста, выберите количество гостей';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                guestsSelect.focus();
            } else if (!attendanceSelect.value) {
                formMessage.textContent = 'Пожалуйста, выберите вариант присутствия';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                attendanceSelect.focus();
            }
            
            if (!isValid) {
                isProcessing = false;
                return;
            }
            
            // В реальном приложении здесь будет отправка данных на сервер
            console.log('Данные формы:', formDataObj);
            
            // Показать сообщение об успешной отправке
            if (attendanceSelect.value === 'yes') {
                formMessage.textContent = 'Спасибо! Ваш ответ сохранён. Мы будем ждать вас на нашей свадьбе!';
            } else {
                formMessage.textContent = 'Спасибо за ответ! Очень жаль, что вы не сможете быть с нами в этот день.';
            }
            formMessage.className = 'form-message success';
            formMessage.style.display = 'block';
            
            // Скрыть клавиатуру на мобильных
            document.activeElement.blur();
            
            // Прокрутка к сообщению
            setTimeout(() => {
                formMessage.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
            
            // Очистка формы
            setTimeout(() => {
                rsvpForm.reset();
                isProcessing = false;
            }, 2000);
            
            // Скрыть сообщение через 5 секунд
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.style.display = 'none';
            }, 5000);
        });
        
        // Оптимизация для мобильных: улучшение UX при заполнении формы
        const formInputs = rsvpForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            // Добавляем индикатор фокуса для мобильных
            input.addEventListener('focus', function() {
                this.style.backgroundColor = '#f9f9f9';
            });
            
            input.addEventListener('blur', function() {
                this.style.backgroundColor = 'white';
            });
            
            // Для селектов улучшаем UX на мобильных
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', function() {
                    // Вибрация на поддерживающих устройствах
                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }
                });
            }
        });
    }
    
    // Оптимизация плавной прокрутки для мобильных
    const smoothScroll = function(targetId) {
        if (isProcessing) return;
        isProcessing = true;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) {
            isProcessing = false;
            return;
        }
        
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(800, Math.abs(distance) / 2);
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isProcessing = false;
            }
        }
        
        // Функция плавности
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    };
    
    // Обработка кликов по навигационным ссылкам
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            smoothScroll(targetId);
        });
    });
    
    // Оптимизация для iOS: предотвращение bounce-эффекта
    let lastTouchY = 0;
    document.body.addEventListener('touchstart', function(e) {
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });
    
    document.body.addEventListener('touchmove', function(e) {
        // Разрешаем скролл внутри полей ввода
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'SELECT') {
            return;
        }
        
        const touchY = e.touches[0].clientY;
        const touchDeltaY = touchY - lastTouchY;
        
        // Предотвращаем overscroll вверху и внизу страницы
        if ((window.scrollY <= 0 && touchDeltaY > 0) || 
            (window.scrollY + window.innerHeight >= document.body.scrollHeight - 10 && touchDeltaY < 0)) {
            e.preventDefault();
        }
        
        lastTouchY = touchY;
    }, { passive: false });
    
    // Предотвращение масштабирования при двойном тапе на кнопках
    let lastTapTime = 0;
    document.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 300 && tapLength > 0) {
            // Двойной тап - предотвращаем масштабирование
            if (e.target.tagName === 'BUTTON' || 
                e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'SELECT') {
                e.preventDefault();
            }
        }
        lastTapTime = currentTime;
    });
    
    // Оптимизация загрузки изображений для мобильных
    const lazyLoadImages = function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Устанавливаем атрибут loading="lazy" для отложенной загрузки
            if (!img.getAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Добавляем fallback для ошибок загрузки
            img.addEventListener('error', function() {
                this.style.backgroundColor = '#f5f5f5';
                this.style.minHeight = '200px';
                console.warn('Не удалось загрузить изображение:', this.src);
            });
        });
    };
    
    // Запускаем ленивую загрузку после полной загрузки страницы
    window.addEventListener('load', function() {
        lazyLoadImages();
        
        // Добавляем класс loaded для плавного появления контента
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    });
    
    // Оптимизация для медленных сетей
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection) {
            // Если медленное соединение, отключаем некоторые эффекты
            if (connection.effectiveType === 'slow-2g' || 
                connection.effectiveType === '2g' ||
                connection.saveData === true) {
                console.log('Медленное соединение, оптимизируем загрузку...');
                
                // Отключаем плавные анимации
                document.documentElement.style.setProperty('--animation-duration', '0s');
                
                // Предотвращаем загрузку ненужных ресурсов
                const allImages = document.querySelectorAll('img');
                allImages.forEach((img, index) => {
                    if (index > 2) { // Оставляем только первые 3 изображения
                        img.setAttribute('loading', 'lazy');
                        img.setAttribute('decoding', 'async');
                    }
                });
            }
        }
    }
    
    // Фикс для iOS Safari 100vh
    const setVH = function() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
});


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

// Запускаем генерацию календаря
generateCalendar();