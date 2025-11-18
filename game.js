// Игра Змейка

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Настройка canvas
function setupCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 20, 480);
    canvas.width = size;
    canvas.height = size;
    
    // Размер сетки
    const gridSize = 20;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);
    
    return { gridSize, cols, rows };
}

let { gridSize, cols, rows } = setupCanvas();

// Настройки игры
const DIFFICULTY_SETTINGS = {
    easy: { speed: 100, scoreMultiplier: 1 },
    medium: { speed: 70, scoreMultiplier: 1.5 },
    hard: { speed: 50, scoreMultiplier: 2 }
};

let gameState = {
    snake: [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: null,
    score: 0,
    level: 1,
    difficulty: 'easy',
    gameLoop: null,
    isRunning: false,
    isPaused: false
};

// Генерация еды
function generateFood() {
    let food;
    do {
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    } while (gameState.snake.some(segment => segment.x === food.x && segment.y === food.y));
    
    gameState.food = food;
}

// Отрисовка
function draw() {
    // Очистка canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка сетки
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Отрисовка еды
    if (gameState.food) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(
            gameState.food.x * gridSize + gridSize / 2,
            gameState.food.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // Отрисовка змейки
    gameState.snake.forEach((segment, index) => {
        if (index === 0) {
            // Голова
            ctx.fillStyle = '#4ecdc4';
        } else {
            // Тело
            ctx.fillStyle = '#45b7b8';
        }
        
        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4
        );
        
        // Глаза на голове
        if (index === 0) {
            ctx.fillStyle = '#1a1a2e';
            const eyeSize = 3;
            const eyeOffset = 5;
            
            if (gameState.direction.x === 1) {
                // Смотрит вправо
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (gameState.direction.x === -1) {
                // Смотрит влево
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (gameState.direction.y === -1) {
                // Смотрит вверх
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
            } else if (gameState.direction.y === 1) {
                // Смотрит вниз
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });
}

// Обновление игры
function update() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    // Обновление направления
    gameState.direction = { ...gameState.nextDirection };
    
    // Движение головы
    const head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;
    
    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с собой
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    gameState.snake.unshift(head);
    
    // Проверка поедания еды
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        const points = Math.floor(10 * DIFFICULTY_SETTINGS[gameState.difficulty].scoreMultiplier);
        gameState.score += points;
        scoreElement.textContent = gameState.score;
        
        // Увеличение уровня каждые 50 очков
        const newLevel = Math.floor(gameState.score / 50) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            levelElement.textContent = gameState.level;
        }
        
        generateFood();
    } else {
        gameState.snake.pop();
    }
    
    draw();
}

// Управление
function changeDirection(newDirection) {
    // Предотвращение движения в противоположном направлении
    if (newDirection.x === -gameState.direction.x && newDirection.y === -gameState.direction.y) {
        return;
    }
    
    // Предотвращение дублирования направления
    if (newDirection.x === gameState.direction.x && newDirection.y === gameState.direction.y) {
        return;
    }
    
    gameState.nextDirection = newDirection;
}

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            changeDirection({ x: 0, y: -1 });
            break;
        case 'ArrowDown':
            e.preventDefault();
            changeDirection({ x: 0, y: 1 });
            break;
        case 'ArrowLeft':
            e.preventDefault();
            changeDirection({ x: -1, y: 0 });
            break;
        case 'ArrowRight':
            e.preventDefault();
            changeDirection({ x: 1, y: 0 });
            break;
    }
});

// Кнопки управления на экране
document.getElementById('btnUp').addEventListener('click', () => {
    if (gameState.isRunning) changeDirection({ x: 0, y: -1 });
});
document.getElementById('btnDown').addEventListener('click', () => {
    if (gameState.isRunning) changeDirection({ x: 0, y: 1 });
});
document.getElementById('btnLeft').addEventListener('click', () => {
    if (gameState.isRunning) changeDirection({ x: -1, y: 0 });
});
document.getElementById('btnRight').addEventListener('click', () => {
    if (gameState.isRunning) changeDirection({ x: 1, y: 0 });
});

// Свайпы для мобильных устройств
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameState.isRunning) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Горизонтальный свайп
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                changeDirection({ x: 1, y: 0 }); // Вправо
            } else {
                changeDirection({ x: -1, y: 0 }); // Влево
            }
        }
    } else {
        // Вертикальный свайп
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                changeDirection({ x: 0, y: 1 }); // Вниз
            } else {
                changeDirection({ x: 0, y: -1 }); // Вверх
            }
        }
    }
});

// Начало игры
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.level = 1;
    gameState.isRunning = true;
    gameState.isPaused = false;
    
    scoreElement.textContent = '0';
    levelElement.textContent = '1';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    generateFood();
    draw();
    
    const speed = DIFFICULTY_SETTINGS[difficulty].speed;
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    gameState.gameLoop = setInterval(update, speed);
}

// Конец игры
function gameOver() {
    gameState.isRunning = false;
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    finalScoreElement.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
    
    // Отправка результата боту
    if (window.telegramAPI && window.telegramAPI.sendScoreToBot) {
        window.telegramAPI.sendScoreToBot(gameState.score, gameState.difficulty);
    }
}

// Кнопки выбора сложности
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.getAttribute('data-difficulty');
        startGame(difficulty);
    });
});

// Кнопка перезапуска
restartBtn.addEventListener('click', () => {
    startGame(gameState.difficulty);
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    const newSetup = setupCanvas();
    gridSize = newSetup.gridSize;
    cols = newSetup.cols;
    rows = newSetup.rows;
    
    if (gameState.isRunning) {
        draw();
    }
});

// Инициализация при загрузке
draw();

