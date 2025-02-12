import fs from "fs/promises";
import path from "path";

export interface City {
  id: string;
  name: string;
}

class HistoryService {
  private storageKey: string;
  private isBrowser: boolean;
  private filePath: string;

  constructor(storageKey: string = "searchHistory") {
    this.storageKey = storageKey;
    this.isBrowser = typeof window !== "undefined"; // Check if running in a browser
    this.filePath = path.join(process.cwd(), "searchHistory.json"); // For Node.js
  }

  // Ensure storage exists (localStorage or file)
  private async ensureStorageExists(): Promise<void> {
    if (this.isBrowser) {
      if (!localStorage.getItem(this.storageKey)) {
        console.warn(
          "History storage not found in localStorage. Initializing with an empty array."
        );
        localStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    } else {
      try {
        await fs.access(this.filePath);
      } catch (error) {
        console.warn("History file not found. Creating a new one.");
        await fs.writeFile(this.filePath, JSON.stringify([]), "utf-8");
      }
    }
  }

  // Read data (localStorage or file)
  private async read(): Promise<City[]> {
    await this.ensureStorageExists();
    if (this.isBrowser) {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } else {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    }
  }

  // Write data (localStorage or file)
  private async write(cities: City[]): Promise<void> {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(cities));
    } else {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(cities, null, 2),
        "utf-8"
      );
    }
  }

  // Get all cities
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Add a new city
  async addCity(cityName: string): Promise<void> {
    const cities = await this.getCities();
    const newCity: City = {
      id: Date.now().toString(),
      name: cityName,
    };

    if (
      !cities.find((city) => city.name.toLowerCase() === cityName.toLowerCase())
    ) {
      cities.push(newCity);
      await this.write(cities);
    } else {
      console.log(`City "${cityName}" already exists in history.`);
    }
  }

  // Remove a city by ID
  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    const updatedCities = cities.filter((city) => city.id !== id);

    if (cities.length === updatedCities.length) {
      console.log(`City with ID "${id}" not found.`);
    }

    await this.write(updatedCities);
  }
}

const historyService = new HistoryService();

(async () => {
  await historyService.addCity("New York");
  const cities = await historyService.getCities();
  console.log(cities);
})();

export default HistoryService;
