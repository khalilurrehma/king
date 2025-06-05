    const boardSize = 8;
    let knightPos = null;
    let moveHistory = [];
    let numbers = [];
    let randomNumbersMode = false;
    let promptMode = false;
    let hideNumbers = true;

    function createBoard() {
      const board = document.getElementById('chessBoard');
      if (!board) return;
      board.innerHTML = '';
      const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

      board.appendChild(createNotationCell(''));
      files.forEach(letter => board.appendChild(createNotationCell(letter)));

      for (let y = 0; y < boardSize; y++) {
        const rank = boardSize - y;
        board.appendChild(createNotationCell(rank, true));
        for (let x = 0; x < boardSize; x++) {
          const square = document.createElement('div');
          square.className = 'square ' + ((x + y) % 2 === 0 ? 'light-square' : 'dark-square');
          square.id = `square-${x}-${y}`;
          square.dataset.x = x;
          square.dataset.y = y;
          square.ondragover = e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          };
          square.ondrop = handleDrop;
          square.onclick = handleClick;
          board.appendChild(square);
        }
      }
    }

    function createNotationCell(text, isRank = false) {
      const cell = document.createElement('div');
      cell.className = 'notation' + (isRank ? ' rank' : '');
      cell.textContent = text;
      return cell;
    }

    function generateUniqueNumbers() {
      const pool = Array.from({ length: 99 }, (_, i) => i + 1);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      numbers = pool.slice(0, 64);
    }

    function updateNumbersOnBoard() {
      document.querySelectorAll('.square').forEach(el => {
        const x = parseInt(el.dataset.x);
        const y = parseInt(el.dataset.y);
        const idx = getSquareIndex(x, y);
        const hasKnight = el.querySelector('.knight');
        if (hasKnight) {
          el.textContent = '';
        } else if (el.classList.contains('revisited')) {
          el.textContent = numbers[idx];
        } else if (randomNumbersMode && !hideNumbers && !el.classList.contains('visited')) {
          el.textContent = numbers[idx];
        } else {
          el.textContent = '';
        }
      });
    }

    function getSquareIndex(x, y) {
      return y * boardSize + x;
    }

    function handleDrop(e) {
      e.preventDefault();
      const x = parseInt(e.currentTarget.dataset.x);
      const y = parseInt(e.currentTarget.dataset.y);
      placeKnight(x, y);
    }

    function placeKnight(x, y) {
      const square = document.getElementById(`square-${x}-${y}`);
      if (!square) {
        console.warn(`Square square-${x}-${y} not found`);
        return;
      }
      if (knightPos && !isValidKnightMove(knightPos, { x, y })) return;

      if (knightPos) {
        const prevSquare = document.getElementById(`square-${knightPos.x}-${knightPos.y}`);
        if (prevSquare) {
          prevSquare.innerHTML = '';
          const idx = getSquareIndex(knightPos.x, knightPos.y);
          if (prevSquare.classList.contains('revisited')) {
            prevSquare.textContent = numbers[idx];
          } else if (randomNumbersMode && !hideNumbers && !prevSquare.classList.contains('visited')) {
            prevSquare.textContent = numbers[idx];
          }
        }
      }

      const idx = getSquareIndex(x, y);
      const wasVisited = square.classList.contains('visited') || square.classList.contains('revisited');
      let wasCorrect = true;
      let prevState = wasVisited ? (square.classList.contains('visited') ? 'visited' : 'revisited') : 'none';
      const prevText = square.textContent;

      square.classList.remove('visited', 'revisited');
      square.innerHTML = '';

      if (!wasVisited && randomNumbersMode && promptMode) {
        const input = prompt('Enter the number for this square:');
        if (parseInt(input) === numbers[idx]) {
          square.classList.add('visited');
        } else {
          square.classList.add('revisited');
          square.textContent = numbers[idx];
          wasCorrect = false;
        }
      } else {
        square.classList.add(wasVisited ? 'revisited' : 'visited');
        if (square.classList.contains('revisited')) {
          square.textContent = numbers[idx];
        }
      }

      const knight = document.createElement('img');
      knight.src = 'https://qchess.net/Frontend/images/ChessPieces/WhiteKnight.svg';
      knight.className = 'knight';
      knight.draggable = true;
      knight.ondragstart = handleKnightDragStart;
      knight.onerror = () => console.error(`Failed to load knight SVG at square-${x}-${y}`);
      square.appendChild(knight);
      console.log(`Knight placed at square-${x}-${y}, classes: ${square.className}`);
      knightPos = { x, y };
      moveHistory.push({ x, y, wasCorrect, wasVisited, prevState, prevText });
      updateNumberDisplay();
      checkVictory();
    }

    function handleClick(e) {
      const x = parseInt(e.currentTarget.dataset.x);
      const y = parseInt(e.currentTarget.dataset.y);
      placeKnight(x, y);
    }

    function handleKnightDragStart(e) {
      e.dataTransfer.setData('text/plain', 'knight');
      e.dataTransfer.effectAllowed = 'move';
      const dragIcon = document.createElement('img');
      dragIcon.src = 'https://qchess.net/Frontend/images/ChessPieces/WhiteKnight.svg';
      const isMobile = window.innerWidth <= 576;
      dragIcon.style.width = isMobile ? '38px' : '58px';
      dragIcon.style.height = isMobile ? '38px' : '58px';
      dragIcon.style.position = 'absolute';
      dragIcon.style.top = '-1000px';
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, isMobile ? 19 : 29, isMobile ? 19 : 29);
      setTimeout(() => document.body.removeChild(dragIcon), 0);
    }

    function isValidKnightMove(from, to) {
      const dx = Math.abs(from.x - to.x);
      const dy = Math.abs(from.y - to.y);
      return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    function updateNumberDisplay() {
      const display = document.getElementById('numberDisplay');
      const container = document.querySelector('.number-display-container');
      if (!display || !container) return;
      if (knightPos && randomNumbersMode && !hideNumbers) {
        const idx = getSquareIndex(knightPos.x, knightPos.y);
        display.textContent = numbers[idx];
        container.style.display = 'block';
      } else {
        display.textContent = '--';
        container.style.display = hideNumbers ? 'none' : 'block';
      }
    }

    function checkVictory() {
      if (document.querySelectorAll('.visited').length === 64) {
        const celebration = document.getElementById('celebration');
        if (celebration) celebration.classList.remove('d-none');
      }
    }

    function resetBoardOnly() {
      knightPos = null;
      moveHistory = [];
      const celebration = document.getElementById('celebration');
      if (celebration) celebration.classList.add('d-none'); // Always reset celebration
      document.querySelectorAll('.square').forEach(el => {
        el.className = 'square ' + ((parseInt(el.dataset.x) + parseInt(el.dataset.y)) % 2 === 0 ? 'light-square' : 'dark-square');
        el.innerHTML = '';
        const idx = getSquareIndex(parseInt(el.dataset.x), parseInt(el.dataset.y));
        if (el.classList.contains('revisited')) {
          el.textContent = numbers[idx];
        } else if (randomNumbersMode && !hideNumbers) {
          el.textContent = numbers[idx];
        } else {
          el.textContent = '';
        }
      });
      updateNumbersOnBoard();
      updateNumberDisplay();
    }
    function clearAllKnights() {
      document.querySelectorAll('.knight').forEach(k => k.remove());
    }

    function undoMove() {
      if (moveHistory.length === 0) return;

      const last = moveHistory.pop();
      const prev = moveHistory[moveHistory.length - 1] || null;

      const lastEl = document.getElementById(`square-${last.x}-${last.y}`);
      const idxLast = getSquareIndex(last.x, last.y);

      if (lastEl) {
        lastEl.className = 'square ' + ((last.x + last.y) % 2 === 0 ? 'light-square' : 'dark-square');
        lastEl.innerHTML = '';
        if (last.wasVisited && last.prevState !== 'none') {
          lastEl.classList.add(last.prevState);
          lastEl.textContent = last.prevText || '';
        } else if (randomNumbersMode && !hideNumbers) {
          lastEl.textContent = numbers[idxLast];
        }
      }

      clearAllKnights();

      if (prev) {
        const prevEl = document.getElementById(`square-${prev.x}-${prev.y}`);
        const idxPrev = getSquareIndex(prev.x, prev.y);

        if (prevEl) {
          console.log(prevEl);

          prevEl.classList.remove('visited', 'revisited');
          prevEl.classList.add(prev.wasCorrect ? 'visited' : 'revisited');
          prevEl.textContent = (!prev.wasCorrect && randomNumbersMode) ? numbers[idxPrev] : '';

          prevEl.innerHTML = ''; // Clear it fully for testing

          const knight = document.createElement('img');
          knight.src = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg'; // known good image
          knight.className = 'knight';
          knight.draggable = true;
          knight.style.width = '100%';
          knight.style.height = '100%';
          prevEl.appendChild(knight);

          console.log(`Appending knight to square-${prev.x}-${prev.y}`);

          knightPos = { x: prev.x, y: prev.y };
          console.log('Undo knightPos set to:', knightPos);
        }

      } else {
        knightPos = null;
      }

      // updateNumbersOnBoard();
      updateNumberDisplay();
    }




    document.addEventListener('DOMContentLoaded', () => {
      createBoard();
      generateUniqueNumbers();
      resetBoardOnly();

      const resetBoardBtn = document.getElementById('resetBoard');
      if (resetBoardBtn) resetBoardBtn.onclick = resetBoardOnly;

      const resetNumbersBtn = document.getElementById('resetNumbers');
      if (resetNumbersBtn) {
        resetNumbersBtn.onclick = () => {
          generateUniqueNumbers();
          resetBoardOnly();
        };
      }

      const undoMoveBtn = document.getElementById('undoMove');
      if (undoMoveBtn) undoMoveBtn.onclick = undoMove;

      const toggleRandom = document.getElementById('toggleRandom');
      if (toggleRandom) {
        toggleRandom.onchange = function () {
          randomNumbersMode = this.checked;
          const promptSwitch = document.getElementById('promptSwitch');
          const hideSwitch = document.getElementById('hideSwitch');
          const resetNumbers = document.getElementById('resetNumbers');
          const sampleTourBtn = document.getElementById('sampleTour');
          if (promptSwitch) promptSwitch.style.display = this.checked ? 'block' : 'none';
          if (hideSwitch) hideSwitch.style.display = this.checked ? 'block' : 'none';
          if (resetNumbers) resetNumbers.style.display = this.checked ? 'inline-block' : 'none';
          if (sampleTourBtn) sampleTourBtn.style.display = this.checked ? 'inline-block' : 'none';

          if (this.checked) {
            const toggleHide = document.getElementById('toggleHide');
            if (toggleHide) {
              toggleHide.checked = false;
              hideNumbers = false;
            }
            generateUniqueNumbers();   // <- NEW
            resetBoardOnly();          // <- NEW
          } else {
            const toggleHide = document.getElementById('toggleHide');
            if (toggleHide) {
              toggleHide.checked = true;
              hideNumbers = true;
            }
            resetBoardOnly();          // <- NEW to fully clear board on mode switch off
          }
        };
      }

      const togglePrompt = document.getElementById('togglePrompt');
      if (togglePrompt) {
        togglePrompt.onchange = function () {
          promptMode = this.checked;
        };
      }

      const toggleHide = document.getElementById('toggleHide');
      if (toggleHide) {
        toggleHide.onchange = function () {
          hideNumbers = this.checked;
          updateNumbersOnBoard();
          updateNumberDisplay();
        };
      }
    });
    const sampleTourNumbers = [
      25, 28, 31, 48, 53, 44, 41, 46,
      30, 49, 26, 37, 32, 47, 54, 43,
      27, 24, 29, 52, 3, 42, 45, 40,
      50, 7, 36, 33, 38, 19, 2, 55,
      23, 34, 51, 6, 1, 4, 39, 18,
      8, 13, 10, 35, 20, 61, 56, 59,
      11, 22, 15, 64, 5, 58, 17, 62,
      26, 9, 12, 21, 16, 63, 60, 57
    ];

    const sampleTourBtn = document.getElementById('sampleTour');
    if (sampleTourBtn) {
      sampleTourBtn.onclick = () => {
        numbers = [...sampleTourNumbers];
        resetBoardOnly(); 
      };
    }
