const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = 5000;

// Put your Visual Crossing API key here
const API_KEY = "SWXTZCQ4QFTNGK6A8MF53SZZL";

// FETCH WEATHER FROM VISUAL CROSSING

function getWeather(location) {

  return new Promise((resolve, reject) => {

    const url =
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
      `${encodeURIComponent(location)}` +
      `?unitGroup=metric` +
      `&include=hours,current` +
      `&key=${API_KEY}` +
      `&contentType=json`;

    https.get(url, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {

        if (response.statusCode !== 200) {
          reject(
            new Error("Visual Crossing API error")
          );
          return;
        }

        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }

      });

    }).on("error", (error) => {
      reject(error);
    });

  });
}


// FORMAT WEATHER DATA

function formatWeatherData(data) {

  const current = data.currentConditions || {};

  const currentWeather = {
    location: data.resolvedAddress || data.address,

    date: new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }),

    temperature: current.temp,

    condition: current.conditions,

    icon: current.icon,

    windSpeed: current.windspeed,

    rainChance: current.precipprob ,

    humidity: current.humidity,

    feelsLike: current.feelslike
  };


  // Store all hourly data
  const allHours = [];

  data.days.forEach((day) => {

    if (!day.hours) {
      return;
    }

    day.hours.forEach((hour) => {

      const timestamp = new Date(
        `${day.datetime}T${hour.datetime}`
      ).getTime();

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


  // Previous 24 hours
  const previousHours = allHours
    .filter((hour) => hour.timestamp < now)
    .slice(-24);


  // Next 24 hours
  const nextHours = allHours
    .filter((hour) => hour.timestamp >= now)
    .slice(0, 24);


  return {
    current: currentWeather,
    previousHours,
    nextHours
  };
}

// CREATE NODE.JS SERVER

const server = http.createServer(
  async (request, response) => {

    // Allow React frontend to access backend
    response.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    response.setHeader(
      "Content-Type",
      "application/json"
    );


    const url = new URL(
      request.url,
      `http://localhost:${PORT}`
    );

    // TEST SERVER

    if (
      url.pathname === "/" &&
      request.method === "GET"
    ) {

      response.writeHead(200);

      response.end(
        JSON.stringify({
          message:
            "Weather App Node.js server is running"
        })
      );

      return;
    }

    // WEATHER REQUEST

    if (
      url.pathname === "/api/weather" &&
      request.method === "GET"
    ) {

      try {

        const location =
          url.searchParams.get("location");

        const latitude =
          url.searchParams.get("latitude");

        const longitude =
          url.searchParams.get("longitude");


        let searchLocation;


        // User's live location
        if (latitude && longitude) {

          searchLocation =
            `${latitude},${longitude}`;

        }


        // Searched city
        else if (location) {

          searchLocation = location;

        }


        // No location
        else {

          response.writeHead(400);

          response.end(
            JSON.stringify({
              message:
                "Location is required"
            })
          );

          return;
        }


        console.log(
          "Weather requested for:",
          searchLocation
        );


        // Get data from Visual Crossing
        const data =
          await getWeather(searchLocation);


        // Format data
        const weather =
          formatWeatherData(data);


        // Send data to React
        response.writeHead(200);

        response.end(
          JSON.stringify(weather)
        );


      } catch (error) {

        console.error(
          "Weather Error:",
          error.message
        );

        response.writeHead(500);

        response.end(
          JSON.stringify({
            message:
              "Unable to fetch weather data"
          })
        );
      }

      return;
    }
    // PAGE NOT FOUND

    response.writeHead(404);

    response.end(
      JSON.stringify({
        message: "Route not found"
      })
    );

  }
);

// START SERVER

server.listen(PORT, () => {

  console.log(
    `Weather server running at http://localhost:${PORT}`
  );

});