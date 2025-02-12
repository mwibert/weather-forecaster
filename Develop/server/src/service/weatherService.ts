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
    weatherDescription: string
  ) {
    this.cityName = cityName;
    this.date = date;
    this.temperature = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.weatherDescription = weatherDescription;
  }
}

class WeatherService {
  private baseURL: string;
  private APIkey: string;
  private cityName = "";

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.APIkey = process.env.API_KEY || "";

    if (!process.env.API_BASE_URL) {
      console.warn("Warning: API_BASE_URL environment variable is not set.");
    }
    if (!process.env.API_KEY) {
      console.warn("Warning: API_KEY environment variable is not set.");
    }
  }

  private async fetchLocationData(query: string) {
    const response = await fetch(query).then((res) => res.json());
    return response[0];
  }

  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { cityName, latitude, longitude } = locationData;
    return { cityName, latitude, longitude };
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.APIkey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.APIkey}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(
    coordinates: Coordinates
  ): Promise<Weather[] | undefined> {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (res) => res.json()
      );
      if (!response || !response.list) {
        throw new Error("Weather data not found.");
      }
      const currentWeather = this.parseCurrentWeather(response.list[0]);
      return this.buildForecastArray(currentWeather, response.list);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      this.cityName,
      new Date(response.dt * 1000).toISOString(), // Convert Unix timestamp to ISO date
      response.main.temp,
      response.wind.speed,
      response.main.humidity,
      response.weather[0].icon,
      response.weather[0].description
    );
  }

  private buildForecastArray(
    currentWeather: Weather,
    weatherData: any[]
  ): Weather[] {
    const weatherForecast: Weather[] = [currentWeather];
    const filteredData = weatherData.filter((data) =>
      data.dt_txt.includes("12:00:00")
    );

    for (const day of filteredData) {
      weatherForecast.push(
        new Weather(
          this.cityName,
          new Date(day.dt * 1000).toISOString(), // Convert Unix timestamp to ISO date
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

  async getWeatherForCity(city: string): Promise<Weather[] | undefined> {
    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      return await this.fetchWeatherData(coordinates);
    } catch (error) {
      console.error("Error in getWeatherForCity:", error);
      return undefined;
    }
  }
}

export default WeatherService;
