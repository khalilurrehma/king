    const boardSize = 8;
    const knightIcon = '♞';
    let knightPos = null;
    let moveHistory = [];
    let randomNumbersMode = false;
    let promptMode = false;
    let hideNumbers = false;
    let numbers = [];

    // Generates 64 unique random integers between 1 and 99 (inclusive)
    function generateNumbers() {
      // Create array from 1..99
      const pool = Array.from({ length: 99 }, (_, i) => i + 1);
      // Shuffle pool using Fisher-Yates
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      // Take first 64
      numbers = pool.slice(0, 64);

      // Display (or hide) each number on board
      $('.square').each((i, el) => {
        if (!hideNumbers) {
          $(el).text(numbers[i]);
        } else {
          $(el).text('');
        }
      });
    }

    function getNumber(pos) {
      if (!numbers.length) return '';
      const idx = pos.y * boardSize + pos.x;
      return numbers[idx];
    }

    function promptNumber(pos, square) {
      const expected = getNumber(pos);
      const input = prompt('Enter number for this square:');
      if (parseInt(input) === expected) {
        square.addClass('visited').text('');
      } else {
        square.addClass('revisited').text(expected);
      }
    }

    function checkComplete() {
      if ($('.visited').length === boardSize * boardSize) {
        $('#celebration').removeClass('d-none');
      }
    }

    function getSquareId(x, y) {
      return `square-${x}-${y}`;
    }

    function isValidKnightMove(from, to) {
      const dx = Math.abs(from.x - to.x);
      const dy = Math.abs(from.y - to.y);
      return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    function resetBoard() {
      knightPos = null;
      moveHistory = [];
      $('.square').removeClass('visited revisited knight').text('');
      $('#celebration').addClass('d-none');
      if (randomNumbersMode) generateNumbers();
    }

    function undoMove() {
      if (moveHistory.length < 2) return;
      const last = moveHistory.pop();
      const prev = moveHistory[moveHistory.length - 1];

      // Clear last square’s highlight (visited or revisited) and show its number again
      $(`#${getSquareId(last.x, last.y)}`)
        .removeClass('visited revisited knight')
        .text(getNumber(last));

      // Move knight back to prev square
      $('.square').removeClass('knight');
      const prevSquare = $(`#${getSquareId(prev.x, prev.y)}`);
      prevSquare.addClass('knight').html(knightIcon);

      knightPos = prev;
    }

    function initBoard() {
      const $board = $('#chessBoard');
      $board.empty();
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          const isDark = (x + y) % 2 === 1;
          const $square = $('<div></div>')
            .addClass('square')
            .addClass(isDark ? 'dark-square' : 'light-square')
            .attr('id', getSquareId(x, y))
            .data('pos', { x, y });
          $board.append($square);
        }
      }
    }

    $(document).ready(() => {
      initBoard();

      // Handle clicks on any square
      $(document).on('click', '.square', function () {
        const $this = $(this);
        const pos = $this.data('pos');

        // First click: place knight off-board → put on this square
        if (!knightPos) {
          knightPos = pos;
          moveHistory.push(pos);
          $this.addClass('visited knight').html(knightIcon);
          return;
        }

        // Only allow legal L-shaped moves
        if (isValidKnightMove(knightPos, pos)) {
          if ($this.hasClass('visited')) {
            // Already visited → turn it red (revisited)
            $this.removeClass('visited').addClass('revisited');
          } else {
            // Not visited yet
            if (randomNumbersMode && promptMode) {
              promptNumber(pos, $this);
            } else {
              $this.addClass('visited');
              if (randomNumbersMode && !hideNumbers) {
                // remove the displayed number once visited
                $this.text('');
              }
            }
          }

          // Move knight icon
          $('.square').removeClass('knight');
          $this.addClass('knight').html(knightIcon);

          knightPos = pos;
          moveHistory.push(pos);

          document.getElementById('moveSound').play();
          checkComplete();
        }
      });

      // Reset board button
      $('#resetBoard').click(() => resetBoard());

      // Undo move button
      $('#undoMove').click(() => undoMove());

      // Toggle Random Numbers Mode
      $('#toggleRandom').on('change', function () {
        randomNumbersMode = this.checked;
        $('#resetNumbers, #promptSwitch, #hideSwitch').toggleClass(
          'd-none',
          !randomNumbersMode
        );
        resetBoard();
      });

      // Reset numbers button (only visible in Random Mode)
      $('#resetNumbers').click(() => resetBoard());

      // Toggle Prompt Numbers (only visible in Random Mode)
      $('#togglePrompt').on('change', function () {
        promptMode = this.checked;
      });

      // Toggle Hide Numbers (only visible in Random Mode)
      $('#toggleHide').on('change', function () {
        hideNumbers = this.checked;
        generateNumbers();
      });
    });