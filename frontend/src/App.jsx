import React,{ useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Register from './Pages/Register'
import Welcome from './Pages/Welcome'
import Login from './Pages/Login'
import Question from './Pages/Question'
import ChessBoard from './Components/ChessBoard'
import Computer from './Pages/Computer'
import Player from './Pages/Player'
import GamePage from './Pages/GamePage'

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/register" element={<Register/>}/>
      <Route path="/" element={<Welcome/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/option" element={<Question/>}/>
      {/* <Route path="/game" element={<ChessBoard/>}/> */}
      <Route path="/computer" element={<Computer/>}/>
      <Route path="/player" element={<Player/>}/>
      <Route path="/game/:id" element={<GamePage />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
