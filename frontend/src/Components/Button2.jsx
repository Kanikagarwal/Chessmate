import React from 'react'

const Button2 = ({name,onClick,property}) => {
  return (
    <button onClick={onClick} className={`${property} px-6 bg-green-400 text-black rounded-lg shadow hover:bg-green-300 transition cursor-pointer`}>
          {name}
        </button>
  )
}

export default Button2
