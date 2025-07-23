import React from "react";

function TimekeepingLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <svg className="animate-spin h-16 w-16 text-blue-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <div className="text-xl font-semibold text-blue-700 animate-pulse tracking-wide">
        Loading<span className="inline-block animate-bounce">...</span>
      </div>
    </div>
  );
}

export default TimekeepingLoading;