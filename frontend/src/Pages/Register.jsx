import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerRoute } from "../../APIRoutes";
import Button from "../Components/Button";
import {toast, ToastContainer} from "react-toastify";
import { Link,useNavigate } from "react-router-dom";
export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const toastOptions = {
  position:'bottom-right',
  theme:"dark",
  autoClose:8000,
  pauseOnHover:true,
  draggable:true
 }

 const handleValidation = ()=>{
  const { username, email, password, confirmPassword } = values;
  if(password!==confirmPassword){
     toast.error("password and confirm password must be same", toastOptions);
     return false;
   }
   else if(username.length<3){
    toast.error("Username should be greater than 3 characters", toastOptions);
    return false;
   }
   else if(password.length<8){
    toast.error("Password should be greater than or equal to 8 characters", toastOptions);
    return false;
   }
   else if(email==""){
    toast.error("Enter a valid email", toastOptions);
    return false;
   }
   return true;

 }

 useEffect(()=>{
  if(localStorage.getItem("chess-game-user")){
    navigate("/option")
  }
 },[])

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if(handleValidation()){
      const { username, email, password,confirmPassword } = values;
      const { data } = await axios.post(registerRoute, {
        username,
        email,
        password,
      });
      console.log(data.status);
      if(data.status==false){
        toast.error(data.msg,toastOptions);
      }
      if(data.status==true){
        localStorage.setItem("chess-game-user",JSON.stringify(data.user))
        navigate("/option")
        toast.success("Registration successfull",toastOptions)
      }

    }
  };

  return (
    <>
    <ToastContainer />

    <div className="h-screen w-full bg-cover bg-center flex flex-col justify-center items-center  bg-gradient-to-br from-slate-900 via-green-900 to-black">
      <form className="flex flex-col bg-black border border-green-900 h-auto sm:w-2/3 md:w-1/2 lg:w-1/3 p-6 rounded-md" onSubmit={(event) => handleSubmit(event)}>
      <div className="logo flex justify-center m-2">
        <div className=" bg-green-400 rounded-full p-4">
        <svg
        className="w-8 h-8"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 6l3.89 5.26L12 6l5.11 5.26L21 6l-3 12H6L3 6zm3 13h12v2H6v-2z" />
  </svg>
          
        </div>
      </div>
      <h2 className="text-center text-green-400 lg:text-4xl md:text-3xl sm:text-2xl m-2 font-bold">ChessMate</h2>
      <p className="text-center text-green-200 lg:text-base m-2">Join the ultimate chess expierence</p>
      <div>
     
        <input
        className="input"
          name="username"
          placeholder="Enter your username"
          value={values.username}
          onChange={handleChange}
          id="username"
          required
        />
      </div>
      <div>

        <input
        className="input"
          name="email"
          type="email"
          placeholder="Enter your email"
          id="email"
          value={values.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
    
        <input
        className="input"
          name="password"
          type="password"
          id="password"
          placeholder="Create a password"
          value={values.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <input
        className="input"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          id="cf"
          placeholder="Confirm your Password"
         
          onChange={handleChange}
          required
        />
      </div>
        <Button name={"Register"} type={"submit"}  margin={"m-2"}/>
        <p className="text-center text-green-100">Already have an account? <span className="underline text-green-700"><Link to="/login">Login</Link></span></p>
      </form>
      
    </div>
    </>
  );
}
