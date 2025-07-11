import React, { useEffect, useRef, useState } from "react";
import ChessBoard from "../Components/ChessBoard";
import Username from "../Components/Username";
import { Chess } from "chess.js";

const Computer = () => {
  const gameRef = useRef(new Chess());
  const [board, setBoard] = useState(gameRef.current.board());
  const [captured, setCaptured] = useState([]);
  const [turn, setTurn] = useState("w");
  const [checkMate, setCheckMate] = useState(false);
  const [checkMateSquare, setCheckMateSquare] = useState(null);
  const [check, setCheck] = useState(false);
  const [checkSquare, setCheckSquare] = useState(null);
  const [moves, setMoves] = useState(gameRef.current.moves({ verbose: true }));
  const [winner, setWinner] = useState("");

  const [promotionFrom, setPromotionFrom] = useState(null);
  const [promotionTo, setPromotionTo] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [staleMate, setStalemate] = useState(false);

  const promote = {
    n: "♘",
  b: "♗",
  r: "♖",
  q: "♕",
  }

  const user = JSON.parse(localStorage.getItem("chess-game-user") || "{}");

  const restartGame = () => {
    const newGame = new Chess();
    gameRef.current = newGame;
    setBoard(newGame.board());
    setCaptured([]);
    setTurn("w");
    setCheckMate(false);
    setCheck(false);
    setCheckSquare(null);
    setCheckMateSquare(null);
    setMoves(newGame.moves({ verbose: true }));
    setWinner("");
    setPromotionFrom(null);
    setPromotionTo(null);
    setIsPromoting(false);
    setStalemate(false);
  };

  const findKingSquare = (color) => {
    const board = gameRef.current.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.type === "k" && piece.color !== color) {
          const file = String.fromCharCode(97 + col);
          const rank = 8 - row;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  };

  const handleMove = (from, to) => {
if (checkMate || staleMate) return;

    const piece = gameRef.current.get(from);

    // Handle promotion
    if (
      piece?.type === "p" &&
      ((piece.color === "w" && to[1] === "8") ||
        (piece.color === "b" && to[1] === "1"))
    ) {
      setPromotionFrom(from);
      setPromotionTo(to);
      setIsPromoting(true);
      return;
    }

    performMove(from, to, "q"); // default promotion to queen for non-pawn or no choice
  };

  const performMove = (from, to, promotion = "q") => {
    const move = gameRef.current.move({ from, to, promotion });

    if (move) {
      if (move.captured) {
        setCaptured((prev) => [
          ...prev,
          {
            color: move.color === "w" ? "b" : "w",
            type: move.captured,
          },
        ]);
      }

      setBoard(gameRef.current.board());
      setMoves(gameRef.current.moves({ verbose: true }));

      if (gameRef.current.isCheckmate()) {
        setCheckMate(true);
        const loser = gameRef.current.turn() === "w" ? "b" : "w";
        setCheckMateSquare(findKingSquare(loser));
        const winnerColor =
          loser === "b"
            ? "You Loose"
            : user.username + " Won" || "White";
        setWinner(winnerColor);
        return;
      }

      if (gameRef.current.isStalemate()) {
      setStalemate(true);
      setWinner("Draw by Stalemate");
    }

      if (gameRef.current.isCheck()) {
        setCheck(true);
        const checkColor = gameRef.current.turn() === "w" ? "b" : "w";
        setCheckSquare(findKingSquare(checkColor));
      } else {
        setCheck(false);
        setCheckSquare(null);
      }

      setTurn((prev) => (prev === "w" ? "b" : "w"));
    }
  };

  // Bot move
  useEffect(() => {
    if (turn === "b" && !checkMate && !isPromoting) {
      const botMove = () => {
        const moves = gameRef.current.moves({ verbose: true });
        if (moves.length === 0) return;

        const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
        let bestMove = null,
          maxValue = -1;

        for (const move of moves) {
          if (move.captured) {
            const val = pieceValue[move.captured] || 0;
            if (val > maxValue) {
              maxValue = val;
              bestMove = move;
            }
          }
        }

        const finalMove =
          bestMove || moves[Math.floor(Math.random() * moves.length)];
        performMove(finalMove.from, finalMove.to, finalMove.promotion);
      };

      setTimeout(botMove, 500);
    }
  }, [turn, checkMate, isPromoting]);

  const handlePromotion = (type) => {
    if (promotionFrom && promotionTo) {
      performMove(promotionFrom, promotionTo, type);
    }
    setIsPromoting(false);
    setPromotionFrom(null);
    setPromotionTo(null);
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 h-screen items-center justify-center">
      <Username
        username="Black(AI)"
        token={captured}
        color={"black"}
        icon="fa-laptop"
      />
      <ChessBoard
        gameRef={gameRef}
        board={board}
        onMove={handleMove}
        moves={moves}
        checkMate={checkMate}
        staleMate={staleMate}
        checkMateSquare={checkMateSquare}
        check={check}
        checkSquare={checkSquare}
        winner={winner}
        restartGame={restartGame}
        playerColor={"white"}
      />
      <Username
        username={`${user.username || "White"}`}
        token={captured}
        color={"white"}
        icon={"fa-user"}
      />

      {/* Promotion Modal */}
      {isPromoting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow text-center">
            <h2 className="text-lg font-semibold mb-2">
              Choose Promotion Piece
            </h2>
            <div className="flex justify-center gap-4">
              {["q", "r", "b", "n"].map((type) => (
                <button
                  key={type}
                  onClick={() => handlePromotion(type)}
                  className={`bg-green-500  px-4 py-2 rounded hover:bg-green-600 text-xl ${turn=='b'?'text-black':'text-white'}`}
                >
                  {promote[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Computer;
