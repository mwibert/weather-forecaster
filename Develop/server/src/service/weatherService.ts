import dotenv from "dotenv";
dotenv.config();

// DONE: Define an interface for the Coordinates object
interface Coordinates {
  cityName: string;
  latitude: number;
  longitude: number;
}

// DONE: Define a class for the Weather object
class Weather {
  cityName: string;
  date: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  weatherDescription: string;

  constructor(
    cityName: string,
    date: string,
    temperature: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    weathDescription: string
  ) {
    (this.cityName = cityName),
      (this.date = date),
      (this.temperature = temperature),
      (this.windSpeed = windSpeed),
      (this.humidity = humidity),
      (this.icon = icon),
      (this.weatherDescription = weathDescription);
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // DONE: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private APIkey: string;
  private cityName = "";

  constructor() {
    this.baseURL = process.env.API_BASE_URL;
    this.APIkey = process.env.API_KEY;
  }

  // DONE: Create fetchLocationData method

  private async fetchLocationData(query: string) {
    const response = await fetch(query).then((res) => res.json());
    return response[0];
  }
  // DONE: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { cityName, latitude, longitude } = locationData;
    return { cityName, latitude, longitude };
  }
  // DONE: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geoQuery = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appID=${this.APIkey}`;
    return geoQuery;
  }
  // DONE: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon${coordinates.longitude}&appID=${this.APIkey}`;
    return weatherQuery;
  }
  // DONE: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) =>
      this.destructureLocationData(data[0])
    );
  }
  // DONE: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (res) => res.json()
      );
      if (!response) {
        throw new Error("Weather data not found.");
      }
      const currentWeather = this.parseCurrentWeather(response.list[0]);
      const forecast: Weather[] = this.buildForecastArray(
        currentWeather,
        response.list
      );
      return forecast;
    } catch (error) {
      console.log(error);
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const currentWeather = new Weather(
      this.cityName,
      response.dt,
      response.main.temp,
      response.wind.speed,
      response.main.humidity,
      response.weather[0].icon,
      response.weather[0].description
    );
    return currentWeather;
  }
  // DONE: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherForecast: Weather[] = [currentWeather];
    const filteredData = weatherData.filter((data) => {
      return data.dt_text.includes("12:00:00");
    });
    for (const day of filteredData) {
      weatherForecast.push(
        new Weather(
          this.cityName,
          day.dt,
          day.main.temp,
          day.wind.speed,
          day.main.humidity,
          day.weather[0].icon,
          day.weather[0].description
        )
      );
    }
    return weatherForecast;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      const weather = await this.fetchWeatherData(coordinates);
      return weather;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new WeatherService();
