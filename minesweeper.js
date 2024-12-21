const boardSize = 10;
const numBombs = Math.floor(boardSize * boardSize * 0.25);
const board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({
        isBomb: false,
        isOpen: false,
        isFlagged: false,
        neighborBombs: 0
    }))
);

function placeBomb(bombsPlaced) {
    if (bombsPlaced === numBombs) {
        return;
    }
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!board[row][col].isBomb) {
        board[row][col].isBomb = true;
        placeBomb(bombsPlaced + 1);
    } else {
        placeBomb(bombsPlaced);
    }
}

function initBoard() {
    placeBomb(0);

    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            cell.neighborBombs = countNeighborBombs(rowIndex, colIndex);
        });
    });
}

function countNeighborBombs(row, col) {
    const neighbors = getNeighbors(row, col);
    return neighbors.reduce((acc, { row, col }) => acc + (board[row][col].isBomb ? 1 : 0), 0);
}

function getNeighbors(row, col) {
    const neighbors = [];
    [-1, 0, 1].forEach(rowOffset => {
        [-1, 0, 1].forEach(colOffset => {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && !(rowOffset === 0 && colOffset === 0)) {
                neighbors.push({ row: newRow, col: newCol });
            }
        });
    });
    return neighbors;
}
function revealCell(row, col) {
    const cell = board[row][col];
    if (cell.isFlagged || cell.isOpen) return;
    cell.isOpen = true;
    const cellElement = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cellElement.classList.remove('hidden');
    
    if (cell.isBomb) {
      revealAllBombs();
      endGame(false);
      return;
    }
    if (cell.neighborBombs === 0) {
      const neighbors = getNeighbors(row, col);
      neighbors.forEach(({ row, col }) => revealCell(row, col));
      cellElement.classList.add('empty');
    } else {
      cellElement.textContent = cell.neighborBombs;
      cellElement.classList.add(`number${cell.neighborBombs}`);
    }
    if (checkVictory()) {
      endGame(true);
    }
  }
  
  function revealAllBombs() {
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.isBomb) {
          const cellElement = document.querySelector(`[data-row='${rowIndex}'][data-col='${colIndex}']`);
          cellElement.textContent = '💣';
          cellElement.classList.remove('hidden');
        }
      });
    });
  }

function toggleFlag(row, col) {
    const cell = board[row][col];
    if (cell.isOpen) return;
    cell.isFlagged = !cell.isFlagged;
    const cellElement = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell.isFlagged) {
        cellElement.textContent = '🚩';
        cellElement.classList.add('flagged');
    } else {
        cellElement.textContent = '';
        cellElement.classList.remove('flagged');
    }
    if (checkVictory()) {
        endGame(true);
    }
}

function checkVictory() {
    let allCellsOpened = true;
    let allBombsFlagged = true;
    board.forEach(row => {
        row.forEach(cell => {
            if (cell.isBomb && !cell.isFlagged) {
                allBombsFlagged = false;
            }
            if (!cell.isBomb && !cell.isOpen) {
                allCellsOpened = false;
            }
        });
    });
    return allCellsOpened && allBombsFlagged;
}

const messageElement = document.getElementById('message');

function endGame(victory) {
    const cellElements = document.querySelectorAll('.cell');
    cellElements.forEach(cellElement => {
        cellElement.removeEventListener('click', cellClickHandler);
        cellElement.removeEventListener('contextmenu', cellContextMenuHandler);
    });
    if (victory) {
        boardElement.classList.add('victory');
        messageElement.textContent = 'Victory!';
    } else {
        boardElement.classList.add('defeat');
        messageElement.textContent = 'Defeat!';
    }
}

function cellClickHandler(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    revealCell(row, col);
}

function cellContextMenuHandler(event) {
    event.preventDefault();
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    toggleFlag(row, col);
}

const boardElement = document.getElementById('board');
initBoard();
board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell', 'hidden');
        cellElement.dataset.row = rowIndex;
        cellElement.dataset.col = colIndex;
        cellElement.addEventListener('click', cellClickHandler);
        cellElement.addEventListener('contextmenu', cellContextMenuHandler);
        boardElement.appendChild(cellElement);
    });
    boardElement.appendChild(document.createElement('br'));
});

  function resetGame() {
    boardElement.innerHTML = '';
    initBoard();
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell', 'hidden');
        cellElement.dataset.row = rowIndex;
        cellElement.dataset.col = colIndex;
        cellElement.addEventListener('click', cellClickHandler);
        cellElement.addEventListener('contextmenu', cellContextMenuHandler);
        boardElement.appendChild(cellElement);
      });
      boardElement.appendChild(document.createElement('br'));
    });
    boardElement.classList.remove('victory', 'defeat');
    messageElement.textContent = '';
    board.forEach(row => {
      row.forEach(cell => {
        cell.isBomb = false;
        cell.isOpen = false;
        cell.isFlagged = false;
        cell.neighborBombs = 0;
      });
    });
    placeBomb(0);
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cell.neighborBombs = countNeighborBombs(rowIndex, colIndex);
      });
    });
  }
  const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', resetGame);
