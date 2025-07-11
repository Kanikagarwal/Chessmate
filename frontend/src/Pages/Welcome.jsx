import React from 'react';
import bg from '../assets/bg2.jpg';
import Button from '../Components/Button';
import { useNavigate } from 'react-router-dom';
import Button2 from '../Components/Button2';

const Welcome = () => {
    const navigate = useNavigate();
    function registerPage() {
        navigate("/register");
    }
    function loginPage() {
        navigate("/login");
    }
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex flex-col justify-center items-center text-white"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <h1 className="text-5xl font-bold drop-shadow-lg text-green-400">Welcome to ChessMate ♞</h1>
      <p className="text-center mt-4 text-lg drop-shadow-sm">Master the board. Outsmart your opponent.</p>
      <div className="mt-6 flex gap-4">
        <Button2 onClick={registerPage} name={"Register"}/>
      <Button onClick={loginPage} name={"LogIn"}/>
      </div>
    </div>
  );
};

export default Welcome;
