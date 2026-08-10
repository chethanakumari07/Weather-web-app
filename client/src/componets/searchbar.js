import React, { useState } from "react";

function SearchBar({
  onSearch,
  onCurrentLocation,
  onRefresh,
  loading
}) {
  const [city, setCity] = useState("");

  const handleSearch = () => {
    if (city.trim() === "") {
      return;
    }

    onSearch(city.trim());
    setCity("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6">

      <div className="flex flex-col md:flex-row gap-3">

        {/* Search Input */}
        <div className="flex flex-1 bg-white rounded-2xl shadow-md overflow-hidden">

          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city..."
            className="
              flex-1
              px-5 py-3
              outline-none
              text-slate-700
              placeholder:text-slate-400
            "
          />

          <button
            onClick={handleSearch}
            className="
              px-5 py-3
            rounded-2xl
            bg-blue-600
            text-white
            font-semibold
            shadow-md
            hover:bg-blue-700
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
            "
          >
            🔍
          </button>

        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="
            px-5 py-3
            rounded-2xl
            bg-blue-600
            text-white
            font-semibold
            shadow-md
            hover:bg-blue-700
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Refreshing..." : "↻ "}
        </button>

      </div>

    </section>
  );
}

export default SearchBar;