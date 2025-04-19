import { Board, Player, Move, Direction } from "./types";

export class BasicAI {
    private player: Player;
  
    constructor(playerSymbol: Player) {
      this.player = playerSymbol;
    }
  
    private getValidPlacements(board: Board, gridStartX: number, gridStartY: number, gridSize: number): Move[] {
      const moves: Move[] = [];
      for (let x = gridStartX; x < gridStartX + gridSize; x++) {
        for (let y = gridStartY; y < gridStartY + gridSize; y++) {
          if (board[x][y] === null) {
            moves.push({ x, y });
          }
        }
      }
      return moves;
    }
  
    private getOwnPieces(board: Board): Move[] {
      const pieces: Move[] = [];
      for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
          if (board[x][y] === this.player) {
            pieces.push({ x, y });
          }
        }
      }
      return pieces;
    }
  
    private getValidGridMoves(gridStartX: number, gridStartY: number, gridSize: number, boardSize: number): Direction[] {
      const directions: Record<Direction, [number, number]> = {
        Up: [0, -1],
        Down: [0, 1],
        Left: [-1, 0],
        Right: [1, 0],
        UpLeft: [-1, -1],
        UpRight: [1, -1],
        DownLeft: [-1, 1],
        DownRight: [1, 1],
      };
  
      const valid: Direction[] = [];
  
      for (const dir in directions) {
        const [dx, dy] = directions[dir as Direction];
        const newX = gridStartX + dx;
        const newY = gridStartY + dy;
  
        if (
          newX >= 0 &&
          newY >= 0 &&
          newX + gridSize <= boardSize &&
          newY + gridSize <= boardSize
        ) {
          valid.push(dir as Direction);
        }
      }
  
      return valid;
    }
  
    private pickMoveAction(board: Board, gridStartX: number, gridStartY: number, gridSize: number): Move | null {
      const placements = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
      return placements.length > 0
        ? placements[Math.floor(Math.random() * placements.length)]
        : null;
    }
  
    private findWinningMove(board: Board, gridStartX: number, gridStartY: number, gridSize: number): { from: Move; to: Move } | null {
      const gridEndX = gridStartX + gridSize;
      const gridEndY = gridStartY + gridSize;
  
      const winningLine = (b: Board, x: number, y: number, dx: number, dy: number): boolean => {
        for (let i = 1; i < 3; i++) {
          const xi = x + dx * i;
          const yi = y + dy * i;
          if (
            xi < gridStartX || xi >= gridEndX ||
            yi < gridStartY || yi >= gridEndY ||
            b[xi][yi] !== this.player
          ) {
            return false;
          }
        }
        return true;
      };
  
      const pieces = this.getOwnPieces(board).filter(p =>
        p.x >= gridStartX && p.x < gridEndX &&
        p.y >= gridStartY && p.y < gridEndY
      );
  
      const targets = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
  
      for (const from of pieces) {
        for (const to of targets) {
          const temp: Board = board.map(row => row.slice());
          temp[from.x][from.y] = null;
          temp[to.x][to.y] = this.player;
  
          if (
            winningLine(temp, to.x, to.y, 1, 0) ||
            winningLine(temp, to.x, to.y, 0, 1) ||
            winningLine(temp, to.x, to.y, 1, 1) ||
            winningLine(temp, to.x, to.y, 1, -1)
          ) {
            return { from, to };
          }
        }
      }
  
      return null;
    }
  
    private findBlockingMove(board: Board, gridStartX: number, gridStartY: number, gridSize: number, opponent: Player): Move | null {
      const gridEndX = gridStartX + gridSize;
      const gridEndY = gridStartY + gridSize;
  
      const winningLine = (b: Board, x: number, y: number, dx: number, dy: number): boolean => {
        for (let i = 1; i < 3; i++) {
          const xi = x + dx * i;
          const yi = y + dy * i;
          if (
            xi < gridStartX || xi >= gridEndX ||
            yi < gridStartY || yi >= gridEndY ||
            b[xi][yi] !== opponent
          ) {
            return false;
          }
        }
        return true;
      };
  
      const targets = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
  
      for (const to of targets) {
        const temp: Board = board.map(row => row.slice());
        temp[to.x][to.y] = opponent;
  
        if (
          winningLine(temp, to.x, to.y, 1, 0) ||
          winningLine(temp, to.x, to.y, 0, 1) ||
          winningLine(temp, to.x, to.y, 1, 1) ||
          winningLine(temp, to.x, to.y, 1, -1)
        ) {
          return to;
        }
      }
  
      return null;
    }
  
    pickMove(
      board: Board,
      gridStartX: number,
      gridStartY: number,
      gridSize: number,
      piecesPlaced: Record<Player, number>,
      maxPieces: number
    ): { type: "place" | "move" | "grid"; to?: Move; from?: Move; direction?: Direction } | null {
      const opponent: Player = this.player === "X" ? "O" : "X";
  
      // Phase 1: Placement
      if (piecesPlaced[this.player] < maxPieces) {
        const block = this.findBlockingMove(board, gridStartX, gridStartY, gridSize, opponent);
        if (block) return { type: "place", to: block };
  
        const place = this.pickMoveAction(board, gridStartX, gridStartY, gridSize);
        if (place) return { type: "place", to: place };
  
        return null;
      }
  
      // Phase 2: Movement
      const winMove = this.findWinningMove(board, gridStartX, gridStartY, gridSize);
      if (winMove) return { type: "move", from: winMove.from, to: winMove.to };
  
      const blockMove = this.findBlockingMove(board, gridStartX, gridStartY, gridSize, opponent);
      if (blockMove) {
        const movablePieces = this.getOwnPieces(board).filter(p =>
          p.x >= gridStartX && p.x < gridStartX + gridSize &&
          p.y >= gridStartY && p.y < gridStartY + gridSize
        );
  
        if (movablePieces.length) {
          const from = movablePieces[Math.floor(Math.random() * movablePieces.length)];
          return { type: "move", from, to: blockMove };
        }
      }
  
      // Random fallback
      const allPieces = this.getOwnPieces(board);
      const targets = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
      const movablePieces = allPieces.filter(p =>
        p.x >= gridStartX && p.x < gridStartX + gridSize &&
        p.y >= gridStartY && p.y < gridStartY + gridSize
      );
  
      const options: { type: "move" | "grid"; from?: Move; to?: Move; direction?: Direction }[] = [];
  
      if (movablePieces.length && targets.length) {
        const from = movablePieces[Math.floor(Math.random() * movablePieces.length)];
        const to = targets[Math.floor(Math.random() * targets.length)];
        options.push({ type: "move", from, to });
      }
  
      const gridMoves = this.getValidGridMoves(gridStartX, gridStartY, gridSize, board.length);
      if (gridMoves.length) {
        const direction = gridMoves[Math.floor(Math.random() * gridMoves.length)];
        options.push({ type: "grid", direction });
      }
  
      if (options.length === 0) return null;
      return options[Math.floor(Math.random() * options.length)];
    }
  }
  