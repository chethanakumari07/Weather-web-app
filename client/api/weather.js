const https = require("https");
const { URL } = require("url");

const API_KEY = "HERHGD5D8GHQQL9GXVA7CNMR4";

// FETCH WEATHER FROM VISUAL CROSSING
function getWeather(location) {
  return new Promise((resolve, reject) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
      `${encodeURIComponent(location)}` +
      `?unitGroup=metric` +
      `&include=hours,current` +
      `&key=${API_KEY}` +
      `&contentType=json`;

    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error("Visual Crossing API error"));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", (error) => { reject(error); });
  });
}

// FORMAT WEATHER DATA
function formatWeatherData(data) {
  const current = data.currentConditions || {};
  const currentWeather = {
    location: data.resolvedAddress || data.address,
    date: new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
    temperature: current.temp,
    condition: current.conditions,
    icon: current.icon,
    windSpeed: current.windspeed,
    rainChance: current.precipprob,
    humidity: current.humidity,
    feelsLike: current.feelslike
  };

  const allHours = [];
  data.days.forEach((day) => {
    if (!day.hours) return;
    day.hours.forEach((hour) => {
      const timestamp = new Date(`${day.datetime}T${hour.datetime}`).getTime();
      allHours.push({
        timestamp,
        time: hour.datetime,
        temperature: hour.temp,
        condition: hour.conditions,
        icon: hour.icon,
        windSpeed: hour.windspeed,
        rainChance: hour.precipprob || 0,
        humidity: hour.humidity,
        feelsLike: hour.feelslike
      });
    });
  });

  const now = Date.now();
  const previousHours = allHours.filter((hour) => hour.timestamp < now).slice(-24);
  const nextHours = allHours.filter((hour) => hour.timestamp >= now).slice(0, 24);

  return { current: currentWeather, previousHours, nextHours };
}

// VERCEL SERVERLESS FUNCTION HANDLER
module.exports = async (request, response) => {
  // Allow your frontend to talk to this endpoint
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Content-Type", "application/json");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    response.writeHead(200);
    response.end();
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405);
    response.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }

  try {
    // Vercel parses the incoming request URL automatically
    const url = new URL(request.url, `http://${request.headers.host}`);
    const location = url.searchParams.get("location");
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");

    let searchLocation;

    if (latitude && longitude) {
      searchLocation = `${latitude},${longitude}`;
    } else if (location) {
      searchLocation = location;
    } else {
      response.writeHead(400);
      response.end(JSON.stringify({ message: "Location is required" }));
      return;
    }

    console.log("Weather requested for:", searchLocation);

    const data = await getWeather(searchLocation);
    const weather = formatWeatherData(data);

    response.writeHead(200);
    response.end(JSON.stringify(weather));
  } catch (error) {
    console.error("Weather Error:", error.message);
    response.writeHead(500);
    response.end(JSON.stringify({ message: "Unable to fetch weather data" }));
  }
};
