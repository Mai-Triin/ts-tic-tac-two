export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[][];
export type Move = { x: number; y: number };
export type Direction =
  | "Up" | "Down" | "Left" | "Right"
  | "UpLeft" | "UpRight" | "DownLeft" | "DownRight";
