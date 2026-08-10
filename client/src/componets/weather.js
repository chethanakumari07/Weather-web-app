import React, { useEffect, useRef } from "react";

// Weather icon
function getWeatherIcon(condition) {
  const text = String(condition || "").toLowerCase();

  if (text.includes("thunder")) return "⛈️";
  if (text.includes("rain") || text.includes("drizzle")) return "🌧️";
  if (text.includes("snow")) return "❄️";
  if (text.includes("fog") || text.includes("mist")) return "🌫️";
  if (text.includes("cloud")) return "☁️";
  if (text.includes("clear") || text.includes("sunny")) return "☀️";

  return "🌤️";
}

// Get date
function getDate(hour) {
  if (!hour) return null;

  const value =
    hour.datetimeEpoch ??
    hour.datetime ??
    hour.time ??
    hour.timestamp;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);

  if (String(value).trim() !== "" && !isNaN(numeric)) {
    const date = new Date(
      numeric < 10000000000 ? numeric * 1000 : numeric
    );

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}T/.test(stringValue)) {
    const date = new Date(stringValue);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}\s/.test(stringValue)) {
    const date = new Date(stringValue.replace(" ", "T"));

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  const fallback = new Date(stringValue);

  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

// Format API time
function formatApiTime(hour) {
  const date = getDate(hour);

  if (!date) return null;

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
}

// Format card time
function formatDisplayTime(hour, index, currentIndex) {
  const apiTime = formatApiTime(hour);

  if (apiTime) {
    return apiTime;
  }

  if (index === currentIndex) {
    return "NOW";
  }

  const date = new Date();

  const hourDifference = currentIndex - index;

  date.setHours(
    date.getHours() + hourDifference
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
}

// Day label
function getDayLabel(hour, index, currentIndex) {
  if (index === currentIndex) {
    return "TODAY";
  }

  const date = getDate(hour);

  if (!date) {
    const fallbackDate = new Date();
    const hourDifference = currentIndex - index;

    fallbackDate.setHours(
      fallbackDate.getHours() + hourDifference
    );

    const today = new Date();

    if (
      fallbackDate.toDateString() ===
      today.toDateString()
    ) {
      return "TODAY";
    }

    return fallbackDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  }

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference = Math.round(
    (
      dateStart.getTime() -
      todayStart.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );

  if (difference === -1) return "YESTERDAY";
  if (difference === 0) return "TODAY";
  if (difference === 1) return "TOMORROW";

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

// Temperature
function getTemperature(hour) {
  if (!hour) return "--";

  if (hour.temp !== undefined) {
    return Math.round(hour.temp);
  }

  if (hour.temperature !== undefined) {
    return Math.round(hour.temperature);
  }

  return "--";
}

// Wind
function getWind(hour) {
  if (!hour) return "--";

  if (hour.windspeed !== undefined) {
    return Math.round(hour.windspeed);
  }

  if (hour.windSpeed !== undefined) {
    return Math.round(hour.windSpeed);
  }

  return "--";
}

// Humidity
function getHumidity(hour) {
  if (hour?.humidity !== undefined) {
    return Math.round(hour.humidity);
  }

  return "--";
}

// Rain
function getRain(hour) {
  if (hour?.precipprob !== undefined) {
    return Math.round(hour.precipprob);
  }

  if (hour?.precipProbability !== undefined) {
    return Math.round(hour.precipProbability);
  }

  return 0;
}

// Condition
function getCondition(hour) {
  return (
    hour?.conditions ||
    hour?.condition ||
    hour?.description ||
    "Unknown"
  );
}

// Unique hour key
function getHourKey(hour) {
  if (!hour) return null;

  if (hour.datetimeEpoch !== undefined) {
    return String(hour.datetimeEpoch);
  }

  if (hour.datetime !== undefined) {
    return String(hour.datetime);
  }

  if (hour.time !== undefined) {
    return String(hour.time);
  }

  return null;
}

function WeatherOverview({
  weather,
  previousHours = [],
  nextHours = []
}) {
  const scrollRef = useRef(null);
  const currentCardRef = useRef(null);

  // Combine API hours
  const previous24 = 
    Array.isArray(previousHours) ? previousHours.slice(-24) : [];
    
    const next24 = Array.isArray(nextHours) ? nextHours.slice(0.24) : [];
    const allHours = [
      ...previous24,
      weather,
      ...next24
  ];

  

  // Find current index
  const currentIndex = previous24.length;
  useEffect(() =>{
    const container = scrollRef.current;
    const currentCard = currentCardRef.current;
    if(!container || !currentCard){
      return;
    }
    container.scrollLeft = 
    currentCard.offsetLeft-
    container.offsetLeft-8;
  },
  [weather,previous24.length,next24.length]
);


  if (!weather) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 pb-10 text-white">

      {/* Current weather */}
      <section className="mt-6 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl p-6">

        <p className="text-lg text-white/80">
          Current Weather
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-3">

          <div>
            <div className="flex items-start">

              <span className="text-7xl md:text-8xl font-bold">
                {getTemperature(weather)}
              </span>

              <span className="text-3xl mt-2">
                °C
              </span>

            </div>

            <p className="text-2xl font-semibold mt-2">
              {getCondition(weather)}
            </p>

            <p className="text-white/80">
              Feels like{" "}
              {weather.feelslike !== undefined
                ? Math.round(weather.feelslike)
                : "--"}
              °C
            </p>
          </div>

          <div className="text-8xl">
            {getWeatherIcon(
              getCondition(weather)
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">

            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <p className="text-2xl">
                💨
              </p>

              <p className="text-sm">
                Wind
              </p>

              <p className="font-bold">
                {getWind(weather)} km/h
              </p>
            </div>

            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <p className="text-2xl">
                💧
              </p>

              <p className="text-sm">
                Humidity
              </p>

              <p className="font-bold">
                {getHumidity(weather)}%
              </p>
            </div>

            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <p className="text-2xl">
                🌧️
              </p>

              <p className="text-sm">
                Rain
              </p>

              <p className="font-bold">
                {getRain(weather)}%
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Hourly weather */}
      <section className="mt-8">

        <div className="flex items-center justify-between gap-2 mb-2 px-2">

          <h2 className="text-2xl font-bold">
            Hourly Weather
          </h2>

          <p className="text-xs text-white/50">
            ← Next&nbsp; | &nbsp;Previous →
          </p>

        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto overflow-y-visible scroll-smooth py-6 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >

          {allHours.map((hour, index) => {

            const isCurrent =
              index === currentIndex;

            return (
              <div
                key={`${getHourKey(hour)}-${index}`}
                ref={
                  isCurrent
                    ? currentCardRef
                    : null
                }
                className={`relative flex-shrink-0 w-24 min-h-[180px] flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border ${
                  isCurrent
                    ? "bg-blue-600/80 border-yellow-300 ring-4 ring-yellow-300/40 scale-105"
                    : "bg-white/15 border-white/20"
                }`}
              >

                {/* Current label */}
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 text-blue-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                    CURRENT
                  </div>
                )}

                {/* Time */}
                <div className="text-center leading-tight mt-1">

                  <p
                    className={`text-[10px] font-semibold ${
                      isCurrent
                        ? "text-yellow-200"
                        : "text-white/60"
                    }`}
                  >
                    {getDayLabel(
                      hour,
                      index,
                      currentIndex
                    )}
                  </p>

                  <p
                    className={`text-sm font-bold ${
                      isCurrent
                        ? "text-yellow-300"
                        : "text-white"
                    }`}
                  >
                    {isCurrent
                      ? "NOW"
                      : formatDisplayTime(
                          hour,
                          index,
                          currentIndex
                        )}
                  </p>

                </div>

                {/* Temperature */}
                <p className="text-xl font-bold mt-1">
                  {getTemperature(hour)}°
                </p>

                {/* Weather icon */}
                <div className="text-3xl">
                  {getWeatherIcon(
                    getCondition(hour)
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </section>

    </main>
  );
}

export default WeatherOverview;