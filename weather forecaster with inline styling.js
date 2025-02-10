import React, { useState, useEffect } from "react";

function WeatherForecast() {
  const [city, setCity] = useState("New York");
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data on initial load OR whenever user changes city
  // but only if city is set. For a simpler approach, let's fetch after user clicks "Get Forecast"
  // If you want to auto-fetch on city change, put city in the dependency array.
  useEffect(() => {
    // Optionally, fetch on mount if you want to show a default city
    fetchWeatherData(city);
    // eslint-disable-next-line
  }, []);

  const fetchWeatherData = async (cityName) => {
    try {
      const apiKey = "3f613dbc3cf452a36b2e5ace37d4676d"; // Replace with your real API key
      // Example: 5-day forecast for a city, metric units
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("City not found or API error");
      }
      const data = await response.json();

      // data.list contains 3-hour forecasts for 5 days (40 records).
      // We'll group them by day, or just show them sequentially.
      // For a simpler approach, let's show a forecast item every 8th record (8 x 3h = 24h).
      const filteredData = data.list.filter((item, index) => index % 8 === 0);

      setForecastData(filteredData);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setForecastData([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(city);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>5-Day Weather Forecast</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={city}
          placeholder="Enter city"
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Get Forecast
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.forecastContainer}>
        {forecastData.map((item) => {
          // item.dt_txt is the date/time string from the API
          const date = new Date(item.dt_txt).toLocaleDateString();
          // item.main.temp is temperature in Celsius (because we used &units=metric)
          const temperature = Math.round(item.main.temp);
          // item.weather[0].description is the summary
          const description = item.weather[0].description;

          return (
            <div key={item.dt_txt} style={styles.forecastCard}>
              <h3 style={styles.date}>{date}</h3>
              <p style={styles.temp}>{temperature}°C</p>
              <p style={styles.desc}>{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherForecast;

// Inline styles for a simple layout
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "2rem 1rem",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },
  heading: {
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
  },
  form: {
    marginBottom: "1rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginRight: "0.5rem",
    width: "200px",
  },
  button: {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "0.5rem",
  },
  forecastContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1rem",
  },
  forecastCard: {
    backgroundColor: "#fff",
    borderRadius: "6px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    padding: "1rem",
    width: "120px",
  },
  date: {
    margin: "0 0 0.25rem 0",
    fontSize: "1rem",
    color: "#333",
  },
  temp: {
    margin: "0",
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  desc: {
    margin: "0.5rem 0 0",
    fontSize: "0.9rem",
    textTransform: "capitalize",
  },
};
