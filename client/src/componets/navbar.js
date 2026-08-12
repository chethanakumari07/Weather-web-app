import React from 'react';

function Navbar({location,onRefresh,loading}) {
  return (
  <nav px-5 py-3
            rounded-2xl
            bg-blue-600
            text-white
            font-semibold
            shadow-md
            transition
           >
    <div className="text-center border-spacing-2 text-white p-4 bg-blue-600/80 border-yellow-300 ring-4 ring-yellow-300/40 scale-105">
      <h1>Weather App</h1>
    </div>
    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 justify-center mt-4">
        <span className="text-gray-xl-700">Location: </span>
        <span className="font-medium">{location}
        </span>
     </div>
    </nav>
  );
}
export default Navbar;