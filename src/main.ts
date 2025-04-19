import { getInitialBoard, updateBoard } from "./ui";
import { GameBrain } from "./game";
import { BasicAI } from "./ai";
import { Player, Direction } from "./types";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "hvh";
const isVsAI = mode === "hva";

const aiPlayer: Player = "O";
const ai = isVsAI ? new BasicAI(aiPlayer) : null;

const game = new GameBrain();
let boardElement: HTMLDivElement;
let gameStarted = false;
let timerInterval: ReturnType<typeof setInterval>;
let startTime: number;



// UI creation
const h1 = document.createElement("h1");
h1.textContent = "TIC TAC TWO";
document.body.appendChild(h1);

// Mode buttons
const modeButtons = document.createElement("div");
modeButtons.classList.add("mode-buttons");

const humanBtn = document.createElement("button");
humanBtn.textContent = "Human vs Human";
humanBtn.onclick = () => (window.location.search = "?mode=hvh");

const aiBtn = document.createElement("button");
aiBtn.textContent = "Human vs AI";
aiBtn.onclick = () => (window.location.search = "?mode=hva");

modeButtons.appendChild(humanBtn);
modeButtons.appendChild(aiBtn);
document.body.appendChild(modeButtons);

(mode === "hvh" ? humanBtn : aiBtn).classList.add("active-mode");

const currentModeLabel = document.createElement("p");
currentModeLabel.style.fontWeight = "bold";
currentModeLabel.style.color = "#666";
currentModeLabel.textContent = `Current Mode: ${isVsAI ? "Human vs AI 🤖" : "Human vs Human 👥"}`;
document.body.appendChild(currentModeLabel);

// Turn & status
const turnInfo = document.createElement("h2");
turnInfo.textContent = `Player Turn: ${game.currentPlayer}`;
document.body.appendChild(turnInfo);

const gameMessage = document.createElement("p");
gameMessage.textContent = "Place your pieces inside the grid.";
document.body.appendChild(gameMessage);

const timerDisplay = document.createElement("p");
timerDisplay.textContent = "Time: 0s";
document.body.appendChild(timerDisplay);


// Board
boardElement = getInitialBoard(game.boardState, handleCellClick, game.gridStartX, game.gridStartY, game.gridSize);
document.body.appendChild(boardElement);

// Grid control buttons
const controls = document.createElement("div");
controls.classList.add("controls");

const directions: Direction[] = [
  "UpLeft", "Up", "UpRight",
  "Left", "Right",
  "DownLeft", "Down", "DownRight"
];

directions.forEach(dir => {
  const btn = document.createElement("button");
  btn.textContent = dir;
  btn.disabled = true;
  btn.onclick = () => moveGrid(dir);
  controls.appendChild(btn);
});

document.body.appendChild(controls);

// Reset button
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset Game";
resetBtn.classList.add("reset-btn");
resetBtn.onclick = () => window.location.reload();
document.body.appendChild(resetBtn);


// Helper functions
function updateControls(): void {
  const moveAllowed = game.piecesPlaced["X"] >= 2 && game.piecesPlaced["O"] >= 2;
  document.querySelectorAll(".controls button").forEach(btn => {
    (btn as HTMLButtonElement).disabled = !moveAllowed;
  });
  game.allowPieceMove = moveAllowed;
  updateGameMessage();
}

function updateGameMessage(): void {
  if (game.winner) {
    gameMessage.textContent = `Player ${game.winner} wins!`;
    clearInterval(timerInterval);
    return;
  }

  if (game.piecesPlaced["X"] < game.maxPieces || game.piecesPlaced["O"] < game.maxPieces) {
    gameMessage.textContent = `Player ${game.currentPlayer}, place a piece inside the grid.`;
  } else {
    gameMessage.textContent = `Player ${game.currentPlayer}, you can move a piece or move the grid.`;
  }

  turnInfo.textContent = `Player Turn: ${game.currentPlayer}`;
}

function startTimer(): void {
  if (!gameStarted) {
    gameStarted = true;
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      timerDisplay.textContent = `Time: ${elapsed}s`;
    }, 1000);
  }
}


// Grid movement + AI trigger
function moveGrid(dir: Direction): void {
  if (game.winner) return;

  if (game.moveGrid(dir)) {
    updateBoard(boardElement, game.boardState, game.gridStartX, game.gridStartY, game.gridSize);
    updateGameMessage();
    triggerAIMoveIfNeeded();
  }
}


// Cell click handler
function handleCellClick(x: number, y: number, e: MouseEvent): void {
  if (game.winner) return;
  startTimer();

  if (game.allowPieceMove) {
    if (game.selectedPiece) {
      if (game.isWithinGrid(x, y) && game.movePiece(x, y)) {
        updateBoard(boardElement, game.boardState, game.gridStartX, game.gridStartY, game.gridSize);
        game.selectedPiece = null;
        updateGameMessage();
        triggerAIMoveIfNeeded();
        return;
      }
    } else if (game.isWithinGrid(x, y) && game.selectPiece(x, y)) {
      (e.target as HTMLDivElement).classList.add("selected");
      gameMessage.textContent = "Now click an empty spot to move the piece.";
      return;
    }
  }

  if (game.piecesPlaced[game.currentPlayer] < game.maxPieces) {
    if (game.makeAMove(x, y)) {
      updateBoard(boardElement, game.boardState, game.gridStartX, game.gridStartY, game.gridSize);
      updateControls();
      updateGameMessage();
      triggerAIMoveIfNeeded();
    } else {
      gameMessage.textContent = "Invalid move! Pick an empty cell inside the grid.";
    }
  }
}

// AI move trigger
function triggerAIMoveIfNeeded(): void {
  if (!isVsAI || game.currentPlayer !== aiPlayer || game.winner || !ai) return;

  setTimeout(() => {
    const decision = ai.pickMove(
      game.boardState,
      game.gridStartX,
      game.gridStartY,
      game.gridSize,
      game.piecesPlaced,
      game.maxPieces
    );

    if (!decision) return;

    if (decision.type === "place" && decision.to) {
      game.makeAMove(decision.to.x, decision.to.y);
    } else if (decision.type === "move" && decision.from && decision.to) {
      game.selectedPiece = decision.from;
      game.movePiece(decision.to.x, decision.to.y);
    } else if (decision.type === "grid" && decision.direction) {
      game.moveGrid(decision.direction);
    }

    updateBoard(boardElement, game.boardState, game.gridStartX, game.gridStartY, game.gridSize);
    updateControls();
    updateGameMessage();
  }, 500);
}

