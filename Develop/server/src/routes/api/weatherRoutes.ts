import { Router } from "express";
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

const router = Router();
const historyService = new HistoryService();
const weatherService = new WeatherService(); // Now constructable

router.post("/", async (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: "City name is required." });
  }

  try {
    const weatherData = await weatherService.getWeatherForCity(cityName);
    await historyService.addCity(cityName);
    return res.status(200).json(weatherData);
  } catch (error) {
    console.error("Error retrieving weather data:", error);
    return res.status(500).json({ error: "Unable to retrieve weather data." });
  }
});

router.get("/history", async (_req, res) => {
  try {
    const history = await historyService.getCities();

    res.status(200).json(history);
  } catch (error) {
    console.error("Error retrieving search history:", error);
    res.status(500).json({ error: "Unable to retrieve search history." });
  }
});

router.delete("/history/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await historyService.removeCity(id);

    res.status(200).json({ message: "City removed from search history." });
  } catch (error) {
    console.error("Error deleting city from search history:", error);
    res
      .status(500)
      .json({ error: "Unable to delete city from search history." });
  }
});

export default router;
