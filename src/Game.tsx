import React from 'react';

type SquareValue = "X" | "O" | null;

interface SquareProps {
  value: SquareValue;
  onSquareClick: () => void;
  highlight?: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onSquareClick, highlight }) => {
  return (
    <button
      className={`square ${highlight ? 'highlight' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

interface BoardProps {
  squares: SquareValue[];
  onClick: (i: number) => void;
  winningSquares: number[] | null;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, winningSquares }) => {
  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const cols = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const highlight = winningSquares ? winningSquares.includes(index) : false;
      cols.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => onClick(index)}
          highlight={highlight}
        />
      );
    }

    boardRows.push(
      <div key={row} className="board-row">
        {cols}
      </div>
    );
  }

  return <div>{boardRows}</div>;
}

function calculateWinner(squares: SquareValue[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ] as const;

  for (const line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: line as unknown as number[] };
    }
  }
  return { winner: null as SquareValue, line: null as number[] | null };
}

function getMoveLocation(history: { squares: SquareValue[] }[], move: number) {
  if (move === 0) return null;
  const prev = history[move - 1].squares;
  const curr = history[move].squares;
  for (let i = 0; i < curr.length; i++) {
    if (curr[i] !== prev[i]) {
      const row = Math.floor(i / 3) + 1;
      const col = (i % 3) + 1;
      return `(${row}, ${col})`;
    }
  }
  return null;
}

function Game() {
  const [history, setHistory] = React.useState<{squares: SquareValue[] }[]>([
    { squares: Array(9).fill(null) }
  ]);
  const [stepNumber, setStepNumber] = React.useState(0);
  const [xIsNext, setXIsNext] = React.useState(true);
  const [isAscending, setIsAscending] = React.useState(true);

  const current = history[stepNumber];
  const { winner, line: winningSquares } = calculateWinner(current.squares);

  const handleClick = (i: number) => {
    const hist = history.slice(0, stepNumber + 1);
    const current = hist[hist.length - 1];
    const squares = current.squares.slice();

    if (winner || squares[i]) {
      return;
    }

    squares[i] = xIsNext ? "X" : "O";
    setHistory(hist.concat([{ squares }]));
    setStepNumber(hist.length);
    setXIsNext(!xIsNext);
  };

  const jumpTo = (step: number) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const moves = history.map((step, move) => {
    const location = getMoveLocation(history, move);
    if (move === stepNumber) {
      return (
        <li key={move}>
          <span style={{ fontWeight: "bold" }}>
            You are at move #{move} {location ? location : ""}
          </span>
        </li>
      );
    }
    const desc = move
      ? `Go to move #${move} ${location ? location : ""}`
      : "Go to game start";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  }
  else if (stepNumber === 9) {
    status = "It's a draw!";
  }
  else {
    status = `Next player: ${xIsNext ? "X" : "O"}`;
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.squares}
          onClick={handleClick}
          winningSquares={winningSquares}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <button onClick={() => setIsAscending(!isAscending)}>
          Sort {isAscending ? "Descending" : "Ascending"}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}

export default Game;
