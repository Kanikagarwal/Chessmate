import React from 'react'
import Button2 from './Button2'

const GameCard = ({icon,title,des,btn,onClick}) => {
  return (
    <div className='min-h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 border border-green-800 hover:scale-105 transition px-8 py-8 rounded-xl'>
      <div className="icon text-green-400 text-5xl"><i className={`fa ${icon}`}></i></div>
      <h2 className='text-4xl font-bold my-4'>{title}</h2>
      <p className='my-4 text-sm'>{des}</p>
      <Button2 name={btn} property="w-full py-2" onClick={onClick}/>
    </div>
  )
}

export default GameCard
