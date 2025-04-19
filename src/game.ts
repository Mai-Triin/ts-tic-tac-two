import { Board, Player, Direction } from "./types";
import { Cell } from "./types";


export class GameBrain {
  private board: Board;
  currentPlayer: Player = "X";
  moveCount = 0;
  maxPieces = 4;
  piecesPlaced: Record<Player, number> = { X: 0, O: 0 };
  boardSize = 5;
  gridSize = 3;
  selectedPiece: { x: number; y: number } | null = null;
  winner: Player | null = null;
  gridStartX: number;
  gridStartY: number;
  allowPieceMove = false;

  constructor(boardSize = 5) {
    this.boardSize = boardSize;
    this.board = Array.from({ length: boardSize }, () =>
      Array<Cell>(boardSize).fill(null)
    );
    this.gridStartX = Math.floor((this.boardSize - this.gridSize) / 2);
    this.gridStartY = Math.floor((this.boardSize - this.gridSize) / 2);
  }

  get boardState(): Board {
    return this.board;
  }

  makeAMove(x: number, y: number): boolean {
    if (!this.isWithinGrid(x, y) || this.winner) return false;

    if (this.piecesPlaced[this.currentPlayer] < this.maxPieces) {
      if (this.board[x][y] === null) {
        this.board[x][y] = this.currentPlayer;
        this.piecesPlaced[this.currentPlayer]++;
        this.checkForWin();
        if (!this.winner) this.switchPlayer();
        return true;
      }
    }
    return false;
  }

  selectPiece(x: number, y: number): boolean {
    if (this.board[x][y] === this.currentPlayer) {
      this.selectedPiece = { x, y };
      return true;
    }
    return false;
  }

  movePiece(newX: number, newY: number): boolean {
    if (!this.selectedPiece || !this.isWithinGrid(newX, newY) || this.winner) return false;

    const { x, y } = this.selectedPiece;
    if (this.board[newX][newY] === null) {
      this.board[newX][newY] = this.currentPlayer;
      this.board[x][y] = null;
      this.selectedPiece = null;
      this.checkForWin();
      if (!this.winner) this.switchPlayer();
      return true;
    }
    return false;
  }

  moveGrid(direction: Direction): boolean {
    if (this.winner) return false;

    const moves: Record<Direction, [number, number]> = {
      Up: [0, -1],
      Down: [0, 1],
      Left: [-1, 0],
      Right: [1, 0],
      UpLeft: [-1, -1],
      UpRight: [1, -1],
      DownLeft: [-1, 1],
      DownRight: [1, 1]
    };

    const [dx, dy] = moves[direction];
    const newX = this.gridStartX + dx;
    const newY = this.gridStartY + dy;

    if (
      newX >= 0 && newX + this.gridSize <= this.boardSize &&
      newY >= 0 && newY + this.gridSize <= this.boardSize
    ) {
      this.gridStartX = newX;
      this.gridStartY = newY;
      this.checkForWin();
      if (!this.winner) this.switchPlayer();
      return true;
    }

    return false;
  }

  isWithinGrid(x: number, y: number): boolean {
    return (
      x >= this.gridStartX && x < this.gridStartX + this.gridSize &&
      y >= this.gridStartY && y < this.gridStartY + this.gridSize
    );
  }

  private checkForWin(): void {
    const winCondition = 3;
    for (let x = this.gridStartX; x < this.gridStartX + this.gridSize; x++) {
      for (let y = this.gridStartY; y < this.gridStartY + this.gridSize; y++) {
        if (this.board[x][y] !== null) {
          if (
            this.checkLine(x, y, 1, 0, winCondition) ||
            this.checkLine(x, y, 0, 1, winCondition) ||
            this.checkLine(x, y, 1, 1, winCondition) ||
            this.checkLine(x, y, 1, -1, winCondition)
          ) {
            this.winner = this.board[x][y];
            return;
          }
        }
      }
    }
  }

  private checkLine(startX: number, startY: number, dx: number, dy: number, length: number): boolean {
    const piece = this.board[startX][startY];
    for (let i = 1; i < length; i++) {
      const x = startX + dx * i;
      const y = startY + dy * i;
      if (!this.isWithinGrid(x, y) || this.board[x][y] !== piece) {
        return false;
      }
    }
    return true;
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
  }
}
