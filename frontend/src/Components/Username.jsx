import React from 'react';

const Username = ({ username, token,color, icon }) => {
  const symbolMap = {
    p: "\u2659", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
  };
  
  // console.log(user);
  

  return (
    <div className="w-full h-20 bg-gray-800 max-w-[600px] my-2 px-4 rounded">
      <p className="text-white font-semibold"><i className={`fa ${icon} px-2`} aria-hidden="true"></i>{username}</p>

      <div>
         {token
          .filter(p => (color=="white" ? p.color === "w" : p.color === "b"))
          .map((p, idx) => {
            const symbol = p.color === 'w'
              ? symbolMap[p.type.toUpperCase()]
              : symbolMap[p.type];
            const key = `${p.color}-${p.type}-${idx}`;
            const colorClass = p.color === 'w' ? 'text-white' : 'text-black';

            return (
              <span key={key} className={`text-xl ${colorClass}`}>
                {symbol}
              </span>
            );
          })}
      </div>
    </div>
  );
};

export default Username;
