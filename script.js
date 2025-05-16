/* script.js */
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const winnerMessage = document.getElementById("winnerMessage");
const restartButton = document.querySelector("button");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let score = { X: 0, O: 0 };
let round = 1;
let tournamentEnded = false;
let playerSymbol = "X";
let aiSymbol = "O";

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Inicializa o jogo com base no modo e símbolo selecionado
function initializeGame() {
  playerSymbol = document.querySelector("input[name='symbol']:checked").value;
  aiSymbol = playerSymbol === "X" ? "O" : "X";
  
  board.fill("");
  cells.forEach(cell => cell.textContent = "");
  gameActive = true;
  round = 1;
  score = { X: 0, O: 0 };
  tournamentEnded = false;
  updateScore();
  currentPlayer = "X"; // Sempre começa com X
  
  if (getGameMode() === "solo" && playerSymbol === "O") {
    statusText.textContent = "Vez da IA";
    setTimeout(aiMove, 500);
  } else {
    statusText.textContent = getGameMode() === "solo" ? "Sua vez!" : "Vez do jogador X";
  }
  
  winnerMessage.textContent = "";
  restartButton.textContent = "Reiniciar";
}

document.querySelectorAll("input[name='mode']").forEach(radio => {
  radio.addEventListener("change", initializeGame);
});

document.querySelectorAll("input[name='symbol']").forEach(radio => {
  radio.addEventListener("change", initializeGame);
});

cells.forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] !== "") return;

  const isSoloMode = getGameMode() === "solo";
  
  if (isSoloMode) {
    // No modo solo, só permite clique quando for a vez do jogador
    if (currentPlayer !== playerSymbol) return;
    
    makeMove(index, playerSymbol);
    if (gameActive) {
      setTimeout(aiMove, 500);
    }
  } else {
    makeMove(index, currentPlayer);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;

  if (checkWinner(player)) {
    score[player]++;
    updateScore();
    if (score[player] >= 3) {
      const winnerText = getGameMode() === "solo" && player === playerSymbol ? 
        "🎉 PARABÉNS! VOCÊ VENCEU O TORNEIO! 🎉" : 
        `\u2728 PARABÉNS ${player}! VOCÊ VENCEU O TORNEIO! \u2728`;
      winnerMessage.textContent = winnerText;
      gameActive = false;
      tournamentEnded = true;
      restartButton.textContent = "Novo Torneio";
    } else {
      statusText.textContent = `Jogador ${player} venceu o round ${round}!`;
      setTimeout(startNewRound, 1000);
    }
  } else if (!board.includes("")) {
    statusText.textContent = "Empate!";
    setTimeout(startNewRound, 1000);
  } else {
    const isSoloMode = getGameMode() === "solo";
    if (isSoloMode) {
      currentPlayer = player === playerSymbol ? aiSymbol : playerSymbol;
      statusText.textContent = currentPlayer === playerSymbol ? "Sua vez!" : "Vez da IA";
    } else {
      currentPlayer = player === "X" ? "O" : "X";
      statusText.textContent = `Vez do jogador ${currentPlayer}`;
    }
  }
}

function startNewRound() {
  board.fill("");
  cells.forEach(cell => cell.textContent = "");
  gameActive = true;
  round++;
  
  const isSoloMode = getGameMode() === "solo";
  currentPlayer = round % 2 === 0 ? "O" : "X";
  
  if (isSoloMode) {
    if (currentPlayer !== playerSymbol) {
      statusText.textContent = "Vez da IA";
      setTimeout(aiMove, 500);
    } else {
      statusText.textContent = "Sua vez!";
    }
  } else {
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
  }
}

function aiMove() {
  if (!gameActive || currentPlayer !== aiSymbol) return;
  
  let bestScore = -Infinity;
  let bestMove = 0;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = aiSymbol;
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  makeMove(bestMove, aiSymbol);
}

function minimax(board, depth, isMaximizing) {
  if (checkWinner(aiSymbol)) return 10 - depth;
  if (checkWinner(playerSymbol)) return depth - 10;
  if (!board.includes("")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = aiSymbol;
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = playerSymbol;
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(player) {
  return winConditions.some(condition => condition.every(i => board[i] === player));
}

function getGameMode() {
  return document.querySelector("input[name='mode']:checked").value;
}

function updateScore() {
  scoreX.textContent = score.X;
  scoreO.textContent = score.O;
}

function restartGame() {
  // Se o torneio acabou, reinicia direto
  if (tournamentEnded) {
    initializeGame();
    return;
  }
  
  // Se estiver no meio do jogo, pede confirmação
  if (gameActive) {
    const confirma = confirm("Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido.");
    if (confirma) {
      initializeGame();
    }
  }
}

// Inicializa o jogo
initializeGame();