import React, { useState, useEffect } from "react";
import Navbar from "./componets/navbar";
import SearchBar from "./componets/searchbar";
import WeatherOverview from "./componets/weather";
import Loading from "./componets/loading";
import Error from "./componets/Error";
import weatherBackground from "./assets/background.jpeg";
import {
  getWeatherByCoordinates,
  getWeatherByCity
} from "./WeatherApi";

function App() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("");
  const [previousHours, setPreviousHours] = useState([]);
  const [nextHours, setNextHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentCoords, setCurrentCoords] = useState(null);

  // Apply weather data
  const applyWeatherData = (data) => {
    console.log("Weather API DATA:", data);

    setWeather(data?.current || null);

    setPreviousHours(
      Array.isArray(data?.previousHours)
        ? data.previousHours
        : []
    );

    setNextHours(
      Array.isArray(data?.nextHours)
        ? data.nextHours
        : []
    );
    const cityName = 
    data?.address ||
    data?.city || 
    data?.location?.name ||
    data?.current?.address ||
    data?.current?.city;

    if (cityName && typeof cityName === "string") {
      setLocation(cityName);
    } 
  };
   // Convert coordinates to city name
    const getCityFromCoordinates = async (latitude, longitude) => {
      try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    const data = await response.json();

    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      "Current Location"
    );
   } catch (err) {
    console.error("Reverse geocoding error:", err);
    return "Current Location";
   }
   };
  // Current location weather
  const fetchCurrentLocationWeather = () => {
  setLoading(true);
  setError("");

  if (!navigator.geolocation) {
    setError("Geolocation is not supported.");
    setLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        setCurrentCoords({
          latitude,
          longitude
        });

        const data = await getWeatherByCoordinates(
          latitude,
          longitude
        );

        // Get city name from coordinates
        const cityName = await getCityFromCoordinates(
          latitude,
          longitude
        );

        // Store city name, NOT coordinates
        setLocation(cityName);

        applyWeatherData({
          ...data,
          location: cityName
        });
      } catch (err) {
        console.error(
          "Current location weather error:",
          err
        );

        setError(
          err.message || "Unable to fetch weather."
        );
      } finally {
        setLoading(false);
      }
    },
    () => {
      setError(
        "Location permission denied. Please allow location access."
      );

      setLoading(false);
    }
  );
};

  // Search city
  const searchCity = async (city) => {
    if (!city || !city.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const searchedCity = city.trim();

      console.log(
        "Searching weather for:",
        searchedCity
      );

      const data = await getWeatherByCity(
        searchedCity
      );

      console.log(
        "City weather API:",
        data
      );

      applyWeatherData(data);
    } catch (err) {
      console.error(
        "Search weather error:",
        err
      );

      setError(
        err.message ||
        "Unable to fetch weather."
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const refreshWeather = async () => {
    setError("");

    if (!currentCoords) {
      fetchCurrentLocationWeather();
      return;
    }

    setLoading(true);

    try {
      const data = await getWeatherByCoordinates(
        currentCoords.latitude,
        currentCoords.longitude
      );

      applyWeatherData(data);
    } catch (err) {
      console.error(
        "Refresh weather error:",
        err
      );

      setError(
        err.message ||
        "Unable to refresh weather data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load current weather
  useEffect(() => {
    fetchCurrentLocationWeather();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Loading
  if (loading && !weather) {
    return <Loading />;
  }

  // Initial error
  if (error && !weather) {
    return (
      <Error
        message={error}
        onRetry={fetchCurrentLocationWeather}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(0,90,180,0.35), rgba(0,80,170,0.45)), url(${weatherBackground})`
      }}
    >

      {/* Navbar */}
      <Navbar
        location={location}
        loading={loading}
      />

      {/* Search */}
      <SearchBar
        location={location}
        onLocationChange={setLocation}
        onSearch={searchCity}
        onRefresh={refreshWeather}
        loading={loading}
      />

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-center">
            {error}
          </div>
        </div>
      )}

      {/* Weather */}
      <WeatherOverview
        weather={weather}
        previousHours={previousHours}
        nextHours={nextHours}
      />
      {/* Footer */}
      <footer className="mt-10 border-t border-white/20 bg-black/20 backdrop-blur-lg text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">

          <h3 className="text-lg font-semibold">
              Weather App
          </h3>

          <p className="text-sm text-white/70 mt-1">
            Get accurate and updated weather information.
          </p>

          <p className="text-xs text-white/50 mt-4">
            © {new Date().getFullYear()} Weather App. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
}

export default App;