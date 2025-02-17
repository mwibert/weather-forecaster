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
  city: string;
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;

  constructor(
    city: string,
    date: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
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

  private destructureLocationData(locationData: any): Coordinates {
    const { name, lat, lon } = locationData;
    return { cityName: name, latitude: lat, longitude: lon };
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.APIkey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?units=imperial&lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.APIkey}`;
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
      response.dt_txt.split(" ")[0],
      // new Date(response.dt * 1000).toISOString(), // Convert Unix timestamp to ISO date
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
          day.dt_txt.split(" ")[0],
          // new Date(day.dt * 1000).toISOString(), // Convert Unix timestamp to ISO date
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
      return [];
    }
  }
}

export default WeatherService;
