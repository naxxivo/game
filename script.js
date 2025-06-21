const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;
const GEM_COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

let board = [];
let score = 0;
let selectedGem = null;
let isProcessing = false;

const boardElement = document.getElementById('board');
const scoreElement = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');
const themeToggle = document.getElementById('theme-toggle');

// --- Helpers ---
function getRandomColor() {
  return GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
}

function renderBoard() {
  boardElement.innerHTML = '';
  boardElement.style.display = 'grid';
  boardElement.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${BOARD_HEIGHT}, 1fr)`;
  boardElement.style.width = `${BOARD_WIDTH * 50}px`;
  boardElement.style.height = `${BOARD_HEIGHT * 50}px`;
  boardElement.style.maxWidth = 'calc(100vw - 32px)';
  boardElement.style.maxHeight = 'calc(100vw - 32px)';

  board.forEach((row, r) => {
    row.forEach((color, c) => {
      const gem = document.createElement('div');
      gem.className = `w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-md cursor-pointer transition-all duration-150 ease-in-out ${getColorClass(color)}`;
      if (selectedGem && selectedGem.row === r && selectedGem.col === c) {
        gem.classList.add('ring-4', 'ring-blue-300', 'ring-offset-2', 'ring-offset-gray-900');
      }
      gem.addEventListener('click', () => handleGemClick(r, c));
      boardElement.appendChild(gem);
    });
  });
}

function getColorClass(color) {
  return {
    red: 'bg-red-500 hover:bg-red-600',
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  }[color] || '';
}

function initializeBoard() {
  let newBoard;
  let hasMatch;
  do {
    newBoard = Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => getRandomColor())
    );
    hasMatch = checkAllMatches(newBoard).length > 0;
  } while (hasMatch);

  board = newBoard;
  score = 0;
  selectedGem = null;
  renderBoard();
  updateScore();
}

function updateScore() {
  scoreElement.textContent = score;
}

function checkAllMatches(currentBoard) {
  const matches = [];

  for (let r = 0; r < BOARD_HEIGHT; r++) {
    for (let c = 0; c < BOARD_WIDTH - 2; c++) {
      if (currentBoard[r][c] === currentBoard[r][c + 1] && currentBoard[r][c] === currentBoard[r][c + 2]) {
        let k = 0;
        while (c + k < BOARD_WIDTH && currentBoard[r][c] === currentBoard[r][c + k]) {
          matches.push(JSON.stringify({ row: r, col: c + k }));
          k++;
        }
      }
    }
  }

  for (let c = 0; c < BOARD_WIDTH; c++) {
    for (let r = 0; r < BOARD_HEIGHT - 2; r++) {
      if (currentBoard[r][c] === currentBoard[r + 1][c] && currentBoard[r][c] === currentBoard[r + 2][c]) {
        let k = 0;
        while (r + k < BOARD_HEIGHT && currentBoard[r][c] === currentBoard[r + k][c]) {
          matches.push(JSON.stringify({ row: r + k, col: c }));
          k++;
        }
      }
    }
  }

  return [...new Set(matches)].map(s => JSON.parse(s));
}

function applyGravity(currentBoard) {
  let newBoard = currentBoard.map(row => [...row]);
  let points = 0;

  while (true) {
    const matches = checkAllMatches(newBoard);
    if (matches.length === 0) break;

    points += matches.length;
    matches.forEach(({ row, col }) => {
      newBoard[row][col] = null;
    });

    for (let c = 0; c < BOARD_WIDTH; c++) {
      let empty = 0;
      for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
        if (newBoard[r][c] === null) {
          empty++;
        } else if (empty > 0) {
          newBoard[r + empty][c] = newBoard[r][c];
          newBoard[r][c] = null;
        }
      }
      for (let r = 0; r < empty; r++) {
        newBoard[r][c] = getRandomColor();
      }
    }
  }

  score += points;
  updateScore();
  return newBoard;
}

async function handleGemClick(r, c) {
  if (isProcessing) return;
  if (!selectedGem) {
    selectedGem = { row: r, col: c };
    renderBoard();
  } else {
    const { row: r1, col: c1 } = selectedGem;
    const isAdjacent = (Math.abs(r - r1) === 1 && c === c1) || (Math.abs(c - c1) === 1 && r === r1);
    if (!isAdjacent) {
      selectedGem = { row: r, col: c };
      renderBoard();
      return;
    }

    isProcessing = true;
    [board[r1][c1], board[r][c]] = [board[r][c], board[r1][c1]];
    renderBoard();

    await new Promise(res => setTimeout(res, 150));
    if (checkAllMatches(board).length > 0) {
      board = applyGravity(board);
      renderBoard();
    } else {
      await new Promise(res => setTimeout(res, 150));
      [board[r1][c1], board[r][c]] = [board[r][c], board[r1][c1]];
      renderBoard();
    }

    selectedGem = null;
    isProcessing = false;
  }
}

newGameBtn.addEventListener('click', initializeBoard);

// Theme toggling
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  html.classList.remove('dark', 'light');
  html.classList.add(isDark ? 'light' : 'dark');
  themeToggle.innerHTML = `<i data-lucide="${isDark ? 'moon' : 'sun'}" class="w-6 h-6"></i>`;
  lucide.createIcons();
});

// Initialize
initializeBoard();
