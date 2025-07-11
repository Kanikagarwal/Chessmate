import React, { useEffect, useRef, useState } from "react";
import ChessBoard from "../Components/ChessBoard";
import Username from "../Components/Username";
import { Chess } from "chess.js";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// ✅ Connect to backend server
const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001");

const GamePage = () => {
  const gameRef = useRef(new Chess());
  const navigate = useNavigate();
  const { state } = useLocation();
  const roomCode = state?.roomCode || localStorage.getItem("chess-room-code");

  const user = JSON.parse(localStorage.getItem("chess-game-user") || "{}");

  const [playerColor, setPlayerColor] = useState(null);
  const [board, setBoard] = useState(gameRef.current.board());
  const [captured, setCaptured] = useState([]);
  const [turn, setTurn] = useState("w");
  const [check, setCheck] = useState(false);
  const [checkMate, setCheckMate] = useState(false);
  const [checkSquare, setCheckSquare] = useState(null);
  const [checkMateSquare, setCheckMateSquare] = useState(null);
  const [moves, setMoves] = useState(gameRef.current.moves({ verbose: true }));
  const [winner, setWinner] = useState("");
  const [staleMate, setStalemate] = useState(false);

  const [promotionFrom, setPromotionFrom] = useState(null);
  const [promotionTo, setPromotionTo] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);

  const rotate = playerColor === "black" ? "transform rotate-180" : "";
  const promote = { n: "♘", b: "♗", r: "♖", q: "♕" };

  // 🧠 Get king square for check/checkmate
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

  // ✅ Join room
  useEffect(() => {
    if (!roomCode || !user.username) {
      navigate("/");
      return;
    }

    const storedColor = localStorage.getItem("chess-player-color");
    if (storedColor) {
      setPlayerColor(storedColor);
      setTurn(storedColor === "white" ? "w" : "b");
    }

    socket.emit("join-room", {
      roomCode,
      username: user.username,
      playerColor: localStorage.getItem("chess-player-color"),
    });

    socket.on("joined", ({ playerColor }) => {
      setPlayerColor(playerColor);
      localStorage.setItem("chess-player-color", playerColor);
      setTurn(playerColor === "white" ? "w" : "b");
    });

    socket.on("room-full", () => {
      alert("Room is full");
      navigate("/");
    });

    socket.on("start-game", () => {
      console.log("Game started");
    });

    return () => {
      socket.off("joined");
      socket.off("room-full");
      socket.off("start-game");
    };
  }, [roomCode, user.username]);

  // ✅ Handle opponent move
  useEffect(() => {
    socket.on("opponent-move", ({ from, to, promotion }) => {
      gameRef.current.move({ from, to, promotion });
      setBoard(gameRef.current.board());
      setMoves(gameRef.current.moves({ verbose: true }));
      setTurn(gameRef.current.turn());
    });

    return () => socket.off("opponent-move");
  }, []);

  // ✅ Handle move
  const handleMove = (from, to) => {
    if (checkMate || staleMate) return;

    const piece = gameRef.current.get(from);
    if (!piece) return;

    // ✅ Allow move only if it's your turn AND your own piece
    if (
      (playerColor === "white" && (turn !== "w" || piece.color !== "w")) ||
      (playerColor === "black" && (turn !== "b" || piece.color !== "b"))
    ) {
      return;
    }

    // 👑 Handle promotion
    if (
      piece.type === "p" &&
      ((piece.color === "w" && to[1] === "8") ||
        (piece.color === "b" && to[1] === "1"))
    ) {
      setPromotionFrom(from);
      setPromotionTo(to);
      setIsPromoting(true);
      return;
    }

    performMove(from, to, "q");
  };

  // ✅ Execute move
  const performMove = (from, to, promotion = "q") => {
    const move = gameRef.current.move({ from, to, promotion });
    if (!move) return;

    if (move.captured) {
      console.log("Move calture confirme");

      socket.emit("tokenCaptured", {
        move: {
          captured: move.captured,
          color: move.color,
        },
        roomCode,
      });
    }

    setBoard(gameRef.current.board());
    setMoves(gameRef.current.moves({ verbose: true }));

    socket.emit("make-move", { roomCode, from, to, promotion });
    if (gameRef.current.isStalemate()) {
      socket.emit("stalemateConfirmed", { roomCode });
    }

    if (gameRef.current.isCheckmate()) {
      const loserColor = gameRef.current.turn() === "w" ? "b" : "w";
      socket.emit("checkMateConfirmed", { roomCode, loserColor });
    }

    if (gameRef.current.isCheck()) {
      const loserColor = gameRef.current.turn() === "w" ? "b" : "w";
      socket.emit("checkConfirmed", { roomCode, loserColor });
    } else {
      socket.emit("checkRemovedConfirmed", { roomCode });
    }

    setTurn((prev) => (prev === "w" ? "b" : "w"));
  };

  useEffect(() => {
    socket.on("stalemate", () => {
      setStalemate(true);
      setWinner("Draw by Stalemate");
    });

    return () => socket.off("stalemate");
  }, []);

  useEffect(() => {
    socket.on("capture", (move) => {
      console.log("Move caltured succcess");
      if (!move || !move.captured || !move.color) return;

      setCaptured((prev) => [
        ...prev,
        {
          color: move.color === "w" ? "b" : "w",
          type: move.captured,
        },
      ]);
    });

    return () => socket.off("capture");
  }, []);

  useEffect(() => {
    socket.on("checkRemove", () => {
      setCheck(false);
      setCheckSquare(null);
    });
    return () => socket.off("checkRemove");
  }, [playerColor, user.username]);
  useEffect(() => {
    socket.on("check", ({ loserColor }) => {
      setCheck(true);
      const checkColor = gameRef.current.turn() === "w" ? "b" : "w";
      setCheckSquare(findKingSquare(checkColor));
    });

    return () => socket.off("check");
  }, [playerColor, user.username]);

  useEffect(() => {
    socket.on("checkmate", ({ loserColor }) => {
      setCheckMate(true);
      setCheckMateSquare(findKingSquare(loserColor));
      const isLoser = loserColor === playerColor?.[0];
      setWinner(isLoser ? "You Win" : "You Lose");
    });

    return () => socket.off("checkmate");
  }, [playerColor, user.username]);

  // ✅ Handle promotion
  const handlePromotion = (type) => {
    if (promotionFrom && promotionTo) {
      performMove(promotionFrom, promotionTo, type);
    }
    setIsPromoting(false);
    setPromotionFrom(null);
    setPromotionTo(null);
  };

  // ✅ Restart game
  const restartGame = () => {
    const newGame = new Chess();
    gameRef.current = newGame;
    setBoard(newGame.board());
    setCaptured([]);
    setTurn("w");
    setCheck(false);
    setCheckMate(false);
    setCheckSquare(null);
    setCheckMateSquare(null);
    setMoves(newGame.moves({ verbose: true }));
    setWinner("");
    setPromotionFrom(null);
    setPromotionTo(null);
    setIsPromoting(false);
    setStalemate(false);
    localStorage.removeItem("chess-player-color");
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 h-screen items-center justify-center">
      <Username
        username="Black"
        token={captured}
        color="black"
        icon="fa-user"
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
        newClass={rotate}
        classToToken={rotate}
        playerColor={playerColor}
      />

      <Username
        username="White"
        token={captured}
        color="white"
        icon="fa-user"
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
                  className={`bg-green-500 px-4 py-2 rounded hover:bg-green-600 text-xl ${
                    turn === "b" ? "text-black" : "text-white"
                  }`}
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

export default GamePage;
