const form = document.querySelector("form");
const input1 = document.querySelector("#p1");
const input2 = document.querySelector("#p2");
const gameBoard = document.querySelector(".game");
const winMessage = document.querySelector(".winMsg");
const resetBtn = document.querySelector(".reset-btn");
const boardDiv = document.querySelector(".board");

function Gameboard() {
  const board = [];

  for (let i = 0; i < 3; i++) {
    board[i] = [];
    for (let j = 0; j < 3; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const putMark = (row, column) => {
    const chosenCell = board[row][column];

    if (chosenCell.getValue() !== "") return false;

    return true;
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, putMark, printBoard };
}

function Cell() {
  let value = "";

  const addMark = (mark) => {
    value = mark;
  };

  const getValue = () => value;

  return {
    addMark,
    getValue,
  };
}

function GameController(playerOneName, playerTwoName) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      mark: "O",
    },
    {
      name: playerTwoName,
      mark: "X",
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const resetPlayer = () => {
    activePlayer = players[0];
  };

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const transpose = (array) => {
    return array[0].map((col, i) => array.map((row) => row[i]));
  };

  const checkWin = () => {
    const isBoardFull = board
      .getBoard()
      .every((row) => row.every((cell) => cell.getValue() !== ""));

    const boardRows = board
      .getBoard()
      .some((row) =>
        row.every((cell) => cell.getValue() === getActivePlayer().mark)
      );

    const boardCols = transpose(board.getBoard()).some((row) =>
      row.every((cell) => cell.getValue() === getActivePlayer().mark)
    );

    const firstDiagonals = [];
    const secondDiagonals = [];
    const combineDiagonals = [];

    for (let i = 0; i < 3; i++) {
      firstDiagonals.push(board.getBoard()[i][i]);
      secondDiagonals.push(
        board.getBoard()[i][board.getBoard().length - 1 - i]
      );
    }

    combineDiagonals.push(firstDiagonals);
    combineDiagonals.push(secondDiagonals);

    const boardDiagonals = combineDiagonals.some((row) =>
      row.every((cell) => cell.getValue() === getActivePlayer().mark)
    );

    if (boardRows || boardCols || boardDiagonals) {
      return "win";
    } else if (!boardRows && !boardCols && !boardDiagonals && isBoardFull) {
      return "tie";
    }

    return "continue";
  };

  const playRound = (row, column, endGame) => {
    console.log(
      `Putting ${
        getActivePlayer().name
      }'s mark into row ${row} column ${column}...`
    );
    const placeMark = board.putMark(row, column);

    if (placeMark) {
      board.getBoard()[row][column].addMark(getActivePlayer().mark);
      const result = checkWin();
      if (result === "win") {
        board.printBoard();
        endGame(`${getActivePlayer().name} wins!`);
        return;
      } else if (result === "tie") {
        board.printBoard();
        endGame("Its a tie!");
        return;
      }

      switchPlayerTurn();
      printNewRound();
    } else {
      printNewRound();
    }
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    resetPlayer,
  };
}

function ScreenController(p1, p2) {
  const game = GameController(p1, p2);
  const playerTurnDiv = document.querySelector(".turn");

  const endGame = (message) => {
    boardDiv.style.pointerEvents = "none";
    winMessage.textContent = message;
    resetBtn.style.display = "block";
  };

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.name}'s Turn`;

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = colIndex;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });
  };

  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    const selectedRow = e.target.dataset.row;

    if (!selectedColumn && !selectedRow) return;

    game.playRound(selectedRow, selectedColumn, endGame);
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  resetBtn.addEventListener("click", () => {
    game.getBoard().forEach((row) => row.forEach((cell) => cell.addMark("")));

    game.resetPlayer();

    ScreenController(p1, p2);
    winMessage.textContent = "";
    resetBtn.style.display = "none";
    boardDiv.style.pointerEvents = "auto";
  });

  updateScreen();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let p1 = input1.value;
  let p2 = input2.value;

  if (p1 === "" && p2 === "") {
    p1 = "Player One";
    p2 = "Player Two";
    ScreenController(p1, p2);
  } else if (p2 === "") {
    p2 = "Player Two";
    ScreenController(p1, p2);
  } else if (p1 === "") {
    p1 = "Player One";
    ScreenController(p1, p2);
  } else {
    ScreenController(p1, p2);
  }

  gameBoard.style.display = "flex";
  form.style.display = "none";
});

gameBoard.style.display = "none";
