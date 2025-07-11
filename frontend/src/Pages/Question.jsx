import React, { useEffect,useState } from 'react';
import GameCard from '../Components/GameCard';
import  {useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from "react-toastify";

const Question = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [code,setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const playComputer = ()=>{
    navigate("/computer")
  }

  const toastOptions = {
  position:'bottom-right',
  theme:"dark",
  autoClose:8000,
  pauseOnHover:true,
  draggable:true
 }
 
  useEffect(() => {
  if (showCreateDialog) {
    setCode(Math.random().toString(36).substring(2, 7).toUpperCase());
  }
}, [showCreateDialog]);
  return (
    <>
      {/* Main Section */}
      <ToastContainer/>
      <div className="h-screen flex flex-col items-center justify-center text-center px-4 py-8 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="logo flex justify-center mb-4">
          <div className="bg-green-400 rounded-full p-4">
            <svg
              className="w-8 h-8 text-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 6l3.89 5.26L12 6l5.11 5.26L21 6l-3 12H6L3 6zm3 13h12v2H6v-2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-green-400 text-3xl sm:text-4xl font-bold mb-2">ChessMate</h1>
        <p className="text-green-200 text-sm sm:text-base max-w-xl mb-6">
          Challenge yourself against our AI or play with friends online. Choose your battle!
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-6xl text-white">
          <div className="flex-1 w-full">
          <GameCard
            icon="fa-laptop"
            title="Play vs Computer"
            des="Test your skills against our intelligent AI opponent"
            btn="Start Game"
            onClick={playComputer}
          />
          </div>
          <div className="flex-1 w-full">
          <GameCard
            icon="fa-users"
            title="Play with Friends"
            des="Generate a game code and invite your friends to play"
            btn="Create Game"
            onClick={() => setShowCreateDialog(true)}
          />
          </div>
          <div className="flex-1 w-full">
          <GameCard
  icon="fa-sign-in-alt"
  title="Join a Game"
  des="Enter a code to join your friend's game"
  btn="Join Game"
  onClick={() => setShowJoinDialog(true)}
/>

          </div>
        </div>
      </div>

      {/* Creator Dialog Modal */}
      
      {showCreateDialog && (
     
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-black relative">
            <h2 className="text-xl font-semibold mb-4">Create Game</h2>
            <p className="text-sm text-gray-700 mb-4">Your game code is: <strong>{code}</strong></p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/code/create',{
                      method:"POST",
                      headers:{
                        "Content-Type":"application/json"
                      },
                      body:JSON.stringify({codeGet:code})
                    })
                    const data = await res.json();
                    if(data.status){
                      setShowCreateDialog(false);
                      localStorage.setItem("chess-room-code", code);
                      navigate("/player", { state: { code, isCreator: true } });
                    }
                    else{
                      toast.error(data.msg,toastOptions)
                    }
                  } catch (err) {
                    console.log(err);
                    
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
      {showJoinDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-black relative">
      <h2 className="text-xl font-semibold mb-4">Join Game</h2>
      <input
        type="text"
        placeholder="Enter game code"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        className="w-full p-2 border rounded mb-4"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowJoinDialog(false)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
                  try {
                    const res = await fetch('/api/code/join',{
                      method:"POST",
                      headers:{
                        "Content-Type":"application/json"
                      },
                      body:JSON.stringify({codeGet:joinCode})
                    })
                    const data = await res.json();
                    if(data.status){
                      setShowJoinDialog(false);
                      localStorage.setItem("chess-room-code", joinCode);
                      navigate("/player", { state: { code:joinCode, isCreator: false } });
                    }
                    else{
                      toast.error(data.msg,toastOptions)
                    }
                  } catch (err) {
                    console.log(err);
                    
                  }
                }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Join Game
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default Question;
