import React from "react";

function Error({ message, onRetry }) {
  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-sky-50
      px-4
    ">
      
      <div className="
        w-full
        max-w-md
        bg-white
        rounded-3xl
        shadow-xl
        p-8
        text-center
        border
        border-slate-100
      ">

        {/* Error Icon */}
        <div className="
          w-20
          h-20
          mx-auto
          flex
          items-center
          justify-center
          rounded-full
          bg-red-100
          text-4xl
          mb-5
        ">
          ⚠️
        </div>

        {/* Title */}
        <h2 className="
          text-2xl
          font-bold
          text-slate-800
        ">
          Something went wrong
        </h2>

        {/* Error Message */}
        <p className="
          mt-3
          text-slate-500
          leading-relaxed
        ">
          {message || "Unable to fetch weather information."}
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="
            mt-6
            px-6
            py-3
            rounded-full
            bg-sky-600
            text-white
            font-semibold
            shadow-md
            hover:bg-sky-700
            hover:-translate-y-0.5
            transition-all
            duration-300
          "
        >
          ↻ Try Again
        </button>

      </div>

    </div>
  );
  
}

export default Error;