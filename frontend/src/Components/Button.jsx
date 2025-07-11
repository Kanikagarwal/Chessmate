import React from 'react'

const Button = ({name,onClick,type,margin}) => {
  return (
    <button type={type} onClick={onClick} className={`px-6 py-2 bg-transparent border border--white rounded-lg hover:bg-green-400 hover:text-black transition cursor-pointer text-green-300/50 border border-green-900 ${margin}`}>
          {name}
        </button>
  )
}

export default Button
