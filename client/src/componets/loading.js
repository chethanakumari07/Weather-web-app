import React from "react";

function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 text-center px-4">

      {/* Loading Spinner */}
      <div
        className="w-16 h-16 rounded-full border-4 border-sky-200
          border-t-sky-600
          animate-spin
          mb-6
        "
      ></div>

      {/* Loading Text */}
      <h3 className="
        text-2xl
        font-bold
        text-sky-700
      ">
        Fetching Weather...
      </h3>

      {/* Description */}
      <p className="
        mt-2
        text-slate-500
        text-sm
        md:text-base
      ">
        Please wait while we get the latest weather.
      </p>

    </div>
  );
}

export default Loading;