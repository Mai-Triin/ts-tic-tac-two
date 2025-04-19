import { Cell } from "./types";

export function getInitialBoard(
    boardState: Cell[][],
    cellUpdateFn: (x: number, y: number, e: MouseEvent) => void,
    gridStartX: number = 0,
    gridStartY: number = 0,
    gridSize: number = 3
  ): HTMLDivElement {
    const board = document.createElement("div");
    board.classList.add("board");
  
    for (let i = 0; i < boardState.length; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
  
      for (let j = 0; j < boardState[i].length; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
  
        if (
          i >= gridStartX && i < gridStartX + gridSize &&
          j >= gridStartY && j < gridStartY + gridSize
        ) {
          cell.classList.add("active-grid");
        }
  
        cell.addEventListener("click", (event: MouseEvent) => cellUpdateFn(i, j, event));
        cell.innerHTML = boardState[i][j] || "&nbsp;";
        row.appendChild(cell);
      }
  
      board.appendChild(row);
    }
  
    return board;
  }

  export function updateBoard(
    boardElement: HTMLDivElement,
    boardState: Cell[][],
    gridStartX: number,
    gridStartY: number,
    gridSize: number
  ): void {
    const cells = boardElement.getElementsByClassName("cell");
    let index = 0;
  
    for (let i = 0; i < boardState.length; i++) {
      for (let j = 0; j < boardState[i].length; j++) {
        const cell = cells[index] as HTMLDivElement;
        cell.innerHTML = boardState[i][j] || "&nbsp;";
        cell.classList.remove("active-grid");
  
        if (
          i >= gridStartX && i < gridStartX + gridSize &&
          j >= gridStartY && j < gridStartY + gridSize
        ) {
          cell.classList.add("active-grid");
        }
  
        index++;
      }
    }
  }
  