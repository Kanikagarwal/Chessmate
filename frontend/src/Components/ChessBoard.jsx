import React, { useEffect,useState } from "react";

const BOARD_SIZE = 600;
const getPiece = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♙",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};

const ChessBoard = ({
  gameRef,
  board,
  onMove,
  winner,
  checkMate,
  staleMate,
  checkMateSquare,
  check,
  checkSquare,
  restartGame,
  newClass,
  classToToken,
  playerColor
}) => {
  const game = gameRef.current;
  const squareSize = BOARD_SIZE / 8;
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
  if (checkMate) {
    const timer = setTimeout(() => {
      setShowDialog(true);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup in case component unmounts
  }
}, [checkMate]);

useEffect(() => {
  if (staleMate) {
    const timer = setTimeout(() => {
      setShowDialog(true);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup in case component unmounts
  }
}, [staleMate]);

  // Get legal moves for the selected piece
  const legalMoves = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  // Create a Set of squares that can be moved to
  const highlightedSquares = new Set(legalMoves.map((move) => move.to));

  const handleSquareClick = (squareId) => {
    // If game is over, don't allow any moves
    if (checkMate) return;
    // If no square is selected, select this square if it has a piece of the current turn's color
    if (!selectedSquare) {
      const piece =
      board[8 - parseInt(squareId[1])][squareId.charCodeAt(0) - 97];
      if(piece && (piece.color!==playerColor[0] || game.turn()!== playerColor[0]))return;
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(squareId);
      }
      return;
    }

    // If clicking on the same square, deselect it
    if (selectedSquare === squareId) {
      setSelectedSquare(null);
      return;
    }

    // If clicking on a highlighted square (legal move), make the move
    if (highlightedSquares.has(squareId)) {
      onMove(selectedSquare, squareId);
      setSelectedSquare(null);
      return;
    }

    // If clicking on another piece of the same color, select that piece instead
    const piece = board[8 - parseInt(squareId[1])][squareId.charCodeAt(0) - 97];
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(squareId);
    }
  };

  return (
    <div className="flex items-center justify-center w-full relative">
      <div
        className={`grid grid-cols-8 border-2 border-green-600 ${newClass}`}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const file = String.fromCharCode(97 + colIndex);
            const rank = 8 - rowIndex;
            const squareId = `${file}${rank}`;
            const piece = square ? getPiece[square.color + square.type] : "";

            let bgColor = isDark ? "bg-emerald-900" : "bg-emerald-300";
            let border = "";
            // let selectedStyle = "";

            // Highlight selected square

            // Highlight possible moves
            if (highlightedSquares.has(squareId)) {
              bgColor =
                "bg-gradient-to-b from-[#f2f2f2] via-[#f8ffab] to-[#ffeda3]";
              border = "border border-yellow-400";
            }

            // Highlight checkmate square

            if (checkMate && squareId === checkMateSquare) {
              bgColor = "bg-red-600";
              border = "border-2 border-red-800";
            }
            if (check && squareId === checkSquare) {
              bgColor = "bg-orange-600";
              border = "border-2 border-orange-800";
            }

            const fontColor =
              square?.color === "w" ? "text-white" : "text-black";

            return (
              <div
                key={squareId}
                data-sid={squareId}
                onClick={() => handleSquareClick(squareId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (checkMate) return;
                  const from = e.dataTransfer.getData("text/plain");
                  if (highlightedSquares.has(squareId)) {
                    onMove(from, squareId);
                  }
                  setSelectedSquare(null);
                }}
                className={`${fontColor} ${bgColor} ${border} aspect-square flex items-center justify-center text-2xl font-bold cursor-pointer`}
                style={{ width: squareSize, height: squareSize }}
              >
                {piece && (
                  <div
                    draggable={!checkMate}
                    onDragStart={(e) => {
                      if (square.color === game.turn()) {
                        e.dataTransfer.setData("text/plain", squareId);
                      } else {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      width: squareSize,
                      height: squareSize,
                      fontSize: squareSize * 0.5,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: square.color === game.turn() ? "grab" : "default",
                      userSelect: "none",
                    }}
                    className={`${classToToken}`}
                  >
                    {piece}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {showDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 transition">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-black relative">
            <h2 className="text-xl font-semibold mb-4 text-center">{winner}</h2>
           
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDialog(false);
                  restartGame();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
