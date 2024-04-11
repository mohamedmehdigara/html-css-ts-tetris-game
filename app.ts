// Constants and variables
const gameBoard = document.getElementById('game-board') as HTMLElement;
const cols = 10;
const rows = 20;
const blockSize = 20;

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
    // Add other Tetrimino shapes and colors here...
];

// Game board representation
const board: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

// Current Tetrimino
let currentTetrimino: Tetrimino;
let currentPos = { x: 4, y: 0 };

// Create game board cells
function initializeGameBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.style.width = `${blockSize}px`;
            cell.style.height = `${blockSize}px`;
            cell.style.position = 'absolute';
            cell.style.left = `${c * blockSize}px`;
            cell.style.top = `${r * blockSize}px`;
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
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
                cell.style.backgroundColor = blockColor;
            } else {
                cell.style.backgroundColor = '';
            }
        }
    }
}

// Initialize the game
function init() {
    initializeGameBoard();
    spawnTetrimino();
    renderBoard();
}

// Spawn a random Tetrimino
function spawnTetrimino() {
    const randomIndex = Math.floor(Math.random() * tetriminos.length);
    currentTetrimino = tetriminos[randomIndex];
    currentPos = { x: 4, y: 0 };
}

// Handle keypresses
function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
        // Move left
        moveTetrimino(-1, 0);
    } else if (event.key === 'ArrowRight') {
        // Move right
        moveTetrimino(1, 0);
    } else if (event.key === 'ArrowDown') {
        // Move down
        moveTetrimino(0, 1);
    } else if (event.key === 'ArrowUp') {
        // Rotate
        rotateTetrimino();
    }
}

// Move the current Tetrimino
function moveTetrimino(dx: number, dy: number) {
    currentPos.x += dx;
    currentPos.y += dy;
    renderBoard();
}

// Rotate the current Tetrimino
function rotateTetrimino() {
    const shape = currentTetrimino.shape;
    const rotatedShape = shape[0].map((_, index) =>
        shape.map(row => row[index]).reverse()
    );
    currentTetrimino.shape = rotatedShape;
    renderBoard();
}

// Event listener for keypresses
document.addEventListener('keydown', handleKeyPress);

// Initialize the game
init();
