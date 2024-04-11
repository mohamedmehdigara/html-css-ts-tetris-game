// Constants and variables
const gameBoard = document.getElementById('game-board') as HTMLElement;
const nextBoard = document.getElementById('next-board') as HTMLElement;
const startButton = document.getElementById('start-button') as HTMLElement;
const scoreValue = document.getElementById('score-value') as HTMLElement;
const cols = 10;
const rows = 20;
const blockSize = 20;
const gameSpeed = 500; // Speed of game loop (ms)

// Game state variables
let gameInterval: ReturnType<typeof setInterval>;
let isGameOver = false;
let isGameRunning = false;
let score = 0;

// Tetrimino shapes and colors
type Tetrimino = { shape: number[][]; color: string };

const tetriminos: Tetrimino[] = [
    {
        shape: [[1, 1, 1, 1]],
        color: 'cyan'
    },
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: 'blue'
    },
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: 'yellow'
    },
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: 'red'
    },
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: 'green'
    },
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: 'purple'
    },
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: 'orange'
    }
];

// Game board representation
const board: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

// Current Tetrimino and next Tetrimino
let currentTetrimino: Tetrimino;
let nextTetrimino: Tetrimino;
let currentPos = { x: 4, y: 0 };

// Initialize the game
function init() {
    initializeGameBoard();
    initNextBoard();
    spawnTetrimino();
    spawnNextTetrimino();
    renderBoard();
    renderNextBoard();
    addEventListeners();
    updateScore(0);
}

// Initialize the game board
function initializeGameBoard() {
    gameBoard.innerHTML = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.style.width = `${blockSize}px`;
            cell.style.height = `${blockSize}px`;
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
        }
    }
}

// Initialize the next piece board
function initNextBoard() {
    nextBoard.innerHTML = '';
    const nextBoardSize = 4;
    for (let r = 0; r < nextBoardSize; r++) {
        for (let c = 0; c < nextBoardSize; c++) {
            const cell = document.createElement('div');
            cell.style.width = `${blockSize / 2}px`;
            cell.style.height = `${blockSize / 2}px`;
            cell.classList.add('cell');
            nextBoard.appendChild(cell);
        }
    }
}

// Render the game board
function renderBoard() {
    const cells = Array.from(gameBoard.children) as HTMLElement[];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellIndex = r * cols + c;
            const cell = cells[cellIndex];
            const blockColor = board[r][c];
            if (blockColor) {
                cell.className = `cell ${blockColor}`;
            } else {
                cell.className = 'cell';
            }
        }
    }
}

// Render the next piece board
function renderNextBoard() {
    const nextCells = Array.from(nextBoard.children) as HTMLElement[];
    const shape = nextTetrimino.shape;
    const color = nextTetrimino.color;
    nextCells.forEach(cell => {
        cell.className = 'cell';
    });

    shape.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            if (cellValue === 1) {
                const cellIndex = rowIndex * 4 + colIndex;
                const cell = nextCells[cellIndex];
                cell.className = `cell ${color}`;
            }
        });
    });
}

// Spawn a random tetrimino
function spawnTetrimino() {
    currentTetrimino = nextTetrimino;
    currentPos = { x: 4, y: 0 };
    spawnNextTetrimino();
    if (!isPositionValid()) {
        endGame();
    }
}

// Spawn the next tetrimino piece
function spawnNextTetrimino() {
    const randomIndex = Math.floor(Math.random() * tetriminos.length);
    nextTetrimino = tetriminos[randomIndex];
    renderNextBoard();
}

// Check if the position is valid for the current tetrimino
function isPositionValid() {
    const { shape } = currentTetrimino;
    const { x, y } = currentPos;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] === 1) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= cols || newY >= rows || board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Handle keypresses
function handleKeyPress(event: KeyboardEvent) {
    if (isGameOver || !isGameRunning) return;

    if (event.key === 'ArrowLeft') {
        moveTetrimino(-1, 0);
    } else if (event.key === 'ArrowRight') {
        moveTetrimino(1, 0);
    } else if (event.key === 'ArrowDown') {
        moveTetrimino(0, 1);
    } else if (event.key === 'ArrowUp') {
        rotateTetrimino();
    }
}

// Move the current tetrimino
function moveTetrimino(dx: number, dy: number) {
    currentPos.x += dx;
    currentPos.y += dy;

    if (!isPositionValid()) {
        currentPos.x -= dx;
        currentPos.y -= dy;
    } else {
        renderBoard();
    }
}

// Rotate the current tetrimino
function rotateTetrimino() {
    const shape = currentTetrimino.shape;
    const rotatedShape = shape[0].map((_, index) =>
        shape.map(row => row[index]).reverse()
    );
    const originalShape = currentTetrimino.shape;
    currentTetrimino.shape = rotatedShape;

    if (!isPositionValid()) {
        currentTetrimino.shape = originalShape;
    } else {
        renderBoard();
    }
}

// Place the current tetrimino on the board
function placeTetrimino() {
    const { shape, color } = currentTetrimino;
    const { x, y } = currentPos;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] === 1) {
                const newX = x + col;
                const newY = y + row;
                board[newY][newX] = color;
            }
        }
    }
    clearFullLines();
    spawnTetrimino();
    renderBoard();
}

// Clear full lines and shift rows down
function clearFullLines() {
    let linesCleared = 0;
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== null)) {
            board.splice(r, 1);
            board.unshift(Array(cols).fill(null));
            linesCleared++;
            r++;
        }
    }
    updateScore(linesCleared);
}

// Update the player's score
function updateScore(linesCleared: number) {
    const scoreMapping = [0, 100, 300, 500, 800];
    score += scoreMapping[linesCleared];
    scoreValue.textContent = score.toString();
}

// Game loop to handle piece movement
function gameLoop() {
    if (isGameRunning && !isGameOver) {
        moveTetrimino(0, 1);
        if (!isPositionValid()) {
            currentPos.y--;
            placeTetrimino();
        }
    }
}

// End the game
function endGame() {
    isGameOver = true;
    isGameRunning = false;
    clearInterval(gameInterval);
    alert('Game over!');
}

// Start or resume the game
function startGame() {
    if (isGameOver) {
        resetGame();
    } else {
        isGameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// Reset the game
function resetGame() {
    isGameOver = false;
    isGameRunning = true;
    score = 0;
    updateScore(0);
    currentTetrimino = null;
    nextTetrimino = null;
    currentPos = { x: 4, y: 0 };
    for (let r = 0; r < rows; r++) {
        board[r].fill(null);
    }
    spawnTetrimino();
    spawnNextTetrimino();
    renderBoard();
    renderNextBoard();
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Event listener for keypresses
function addEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
}

// Initialize the game
init();
