// Интеграция с Telegram WebApp API

let tg = window.Telegram.WebApp;

// Инициализация Telegram WebApp
tg.ready();
tg.expand();

// Настройка цветовой схемы
tg.setHeaderColor('#667eea');
tg.setBackgroundColor('#667eea');

// Функция для отправки результата игры боту
function sendScoreToBot(score, difficulty) {
    if (tg && tg.sendData) {
        const data = {
            score: score,
            difficulty: difficulty,
            timestamp: new Date().toISOString()
        };
        
        tg.sendData(JSON.stringify(data));
        console.log('Результат отправлен боту:', data);
    } else {
        console.warn('Telegram WebApp API недоступен');
    }
}

// Функция для получения информации о пользователе
function getUserInfo() {
    if (tg && tg.initDataUnsafe) {
        const user = tg.initDataUnsafe.user;
        return {
            id: user?.id || null,
            username: user?.username || user?.first_name || 'Игрок',
            firstName: user?.first_name || '',
            lastName: user?.last_name || ''
        };
    }
    return {
        id: null,
        username: 'Игрок',
        firstName: '',
        lastName: ''
    };
}

// Экспорт функций для использования в game.js
window.telegramAPI = {
    sendScoreToBot: sendScoreToBot,
    getUserInfo: getUserInfo,
    tg: tg
};

