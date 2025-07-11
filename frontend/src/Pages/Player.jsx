import React from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import {useLocation, useNavigate} from "react-router-dom"

// const SOCKET =import.meta.env.VITE_SOCKET_URL
// const socket = io(SOCKET);

const Player = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("chess-game-user");
const user = userString ? JSON.parse(userString) : null;
const {state} = useLocation();
const {code,isCreator}=state || {};
const playerColor = isCreator ? 'white' : 'black';

console.log(playerColor);
console.log(state);


function handleClick() {
  if (user && user._id) {
    localStorage.setItem("chess-room-code", code);
    navigate(`/game/${user._id}`,{state:{playerColor,roomCode:code}});
  } else {
    console.error("User not found or invalid. Redirecting...");
    navigate("/login");
  }
}

  return(
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">ChessMate</h1>
      <p className="text-lg mb-4">
        Room Code: <strong>{code}</strong>
      </p>
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${playerColor === 'white' ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-green-500`}>
          {playerColor === 'white' ? '♙' : '♙'}
        </div>
        <span className="text-xl font-semibold">
          You are playing as <span className="capitalize">{playerColor}</span>
        </span>
      </div>
        <button onClick={handleClick} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Start Game</button>
    </div>
  )
};

export default Player;
