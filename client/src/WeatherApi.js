const API_URL = "/api/weather";
//   Get weather using city name
export async function getWeatherByCity(city) {
  try {
    const response = await fetch(
      `${API_URL}?location=${encodeURIComponent(city)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch weather"
      );
    }
console.log("City weather API:",data);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Weather service is unavailable"
    );
  }
}

// Get weather using user's live location

export async function getWeatherByCoordinates(
  latitude,
  longitude
) {
  try {
    const response = await fetch(
      `${API_URL}?latitude=${latitude}&longitude=${longitude}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch weather"
      );
    }
console.log("Location weather API:",data);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Weather service is unavailable"
    );
  }
}

