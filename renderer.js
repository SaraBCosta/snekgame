const outputEl = document.getElementById('output');
const startBtn = document.querySelector('.start-btn');

const LEVEL_SCORE_INTERVAL = 10;
const applesmax = 5;



let loopId = null;
let gameRunning = false;
let score = 0;
let steps = 0;
let level = 1;
let TICK_MS= 300;
let GRID_SIZE = 9;
let snakelength = 1;



let snakeHead = { x: 4, y: 4 };
let snakeBody = [];
let direction = { x: 1, y: 0 };
let pendingDirection = { x: 1, y: 0 };
let items = [];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hasItemAt(x, y) {
    return items.some((item) => item.x === x && item.y === y);
}

function isSnakeAt(x, y) {
    return (snakeHead.x === x && snakeHead.y === y)
        || snakeBody.some((segment) => segment.x === x && segment.y === y);
}

function spawnItem() {
    let x = getRandomInt(0, GRID_SIZE - 1);
    let y = getRandomInt(0, GRID_SIZE - 1);

    while ((isSnakeAt(x,y)) || hasItemAt(x, y)) {
        x = getRandomInt(0, GRID_SIZE - 1);
        y = getRandomInt(0, GRID_SIZE - 1);
    }

    return { x, y };
}

function syncItemsToLevel() {
    const applesCount = Math.min(level, applesmax);

    while (items.length < applesCount) {
        items.push(spawnItem());
    }
}

function render() {
    const lines = [];
    lines.push(`<div class="hud">Score: ${score}  Level: ${level}  TICK: ${TICK_MS} ms    Steps: ${steps}</div>`);
    lines.push('<div class="hud">Controls: WASD or Arrow Keys </div>');
    lines.push('<div class="spacer"></div>');

    for (let y = 0; y < GRID_SIZE; y++) {
        let row = '';

        for (let x = 0; x < GRID_SIZE; x++) {
            const isHead = snakeHead.x === x && snakeHead.y === y;
            const isBody = snakeBody.some(segment => segment.x === x && segment.y === y);

            if (isHead) {
                row += '<span class="cell player">🟢</span>';
            } else if (isBody) {
                row += '<span class="cell snakeBody">🐍</span>';
            } else if (hasItemAt(x, y)) {
                row += '<span class="cell item">🍎</span>';
            } else {
                row += '<span class="cell empty">*</span>';
            }
        }

        lines.push(`<div class="row">${row}</div>`);
    }

    outputEl.innerHTML = lines.join('');
}

function tick() {
    direction = pendingDirection;

    const nextX = snakeHead.x + direction.x;
    const nextY = snakeHead.y + direction.y;

    if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        stopGame('Game over! You hit the wall.');
        return;
    }

    const hitSelf = snakeBody.some((segment) => segment.x === nextX && segment.y === nextY);
    if (hitSelf) {
        stopGame('Game over! You hit yourself.');
        return;
    }

    const eatenIndex = items.findIndex((item) => item.x === nextX && item.y === nextY);
    const previousHead = { x: snakeHead.x, y: snakeHead.y };
    snakeHead = { x: nextX, y: nextY };
    snakeBody.unshift(previousHead);

    if (eatenIndex !== -1) {
        score += 1;
        items[eatenIndex] = spawnItem();

        const nextLevel = Math.floor(score / LEVEL_SCORE_INTERVAL) + 1;
        if (nextLevel > level) {
            level = nextLevel;
            speed();
            snakelength+=1;
            syncItemsToLevel();
            aummentGridSize();
        }
    }

    const maxBodyLength = Math.max(0, snakelength - 1);
    if (snakeBody.length > maxBodyLength) {
        snakeBody.pop();
    }

    steps += 1;
    render();
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();
    let next = null;

    if (key === 'w' || key === 'arrowup') {
        next = { x: 0, y: -1 };
    } else if (key === 's' || key === 'arrowdown') {
        next = { x: 0, y: 1 };
    } else if (key === 'a' || key === 'arrowleft') {
        next = { x: -1, y: 0 };
    } else if (key === 'd' || key === 'arrowright') {
        next = { x: 1, y: 0 };
    }

    if (!next) {
        return;
    }

    event.preventDefault();
    pendingDirection = next;
}

function stopGame(message) {
    if (loopId) {
        clearInterval(loopId);
        loopId = null;
    }

    gameRunning = false;
    startBtn.textContent = 'Start Game';

    if (message) {
        outputEl.innerHTML += `<div class="game-message">${message}</div>`;
    }
}

function main() {
    if (gameRunning) {
        stopGame('Game stopped.');
        return;
    }
    snakeHead = { x: 4, y: 4 };
    snakeBody = [];
    snakelength=1;
    score = 0;
    steps = 0;
    level = 1;
    direction = { x: 1, y: 0 };
    pendingDirection = { x: 1, y: 0 };
    items = [];
    GRID_SIZE = 9;
    syncItemsToLevel();
    TICK_MS = 300;
    gameRunning = true;
    startBtn.textContent = 'Stop Game';

    render();
    loopId = setInterval(tick, TICK_MS);
}

function speed(){
    TICK_MS = Math.max(60,TICK_MS - (level-1)*5);
    if (gameRunning) {
        clearInterval(loopId);
        loopId = setInterval(tick, TICK_MS);
    }
}

function aummentGridSize() {
    if (GRID_SIZE < 12) {
        GRID_SIZE += 1;
    }
}



window.addEventListener('keydown', onKeyDown);

// Keep this global for the existing inline onclick in index.html.
window.main = main;
