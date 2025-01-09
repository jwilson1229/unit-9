import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import WeatherService from '../service/weatherService.js';

const router = Router();
const searchHistoryPath = path.join(process.cwd(), 'searchHistory.json');

// Define an interface for the history entry
interface HistoryEntry {
  id: string;
  city: string;
  timestamp: string;
}

// Helper function to read search history
async function readSearchHistory(): Promise<HistoryEntry[]> {
  try {
    const data = await fs.readFile(searchHistoryPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file does not exist, return an empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error; // Rethrow if it's a different error
  }
}

// Update the writeSearchHistory function to accept the correct type
async function writeSearchHistory(history: HistoryEntry[]) {
  await fs.writeFile(searchHistoryPath, JSON.stringify(history, null, 2), 'utf-8');
}

// Save a city to the search history
async function saveCityToHistory(city: string) {
  const history = await readSearchHistory();
  const historyEntry: HistoryEntry = {
    id: uuidv4(),
    city: city,
    timestamp: new Date().toISOString(),
  };
  history.push(historyEntry);
  await writeSearchHistory(history);
}

// POST: Retrieve weather data for a city and save to history
router.post('/', async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'Please enter a city' });
  }

  try {
    const weatherData = await WeatherService.getWeatherForCity(city);
    await saveCityToHistory(city);
    return res.status(200).json(weatherData);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET: Retrieve search history
router.get('/history', async (req, res) => {
  try {
    const history = await readSearchHistory();
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// DELETE: Remove a city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const history = await readSearchHistory();
    const updatedHistory = history.filter(entry => entry.id !== id);

    if (history.length === updatedHistory.length) {
      return res.status(404).json({ error: 'City not found in history' });
    }

    await writeSearchHistory(updatedHistory);
    return res.status(200).json({ message: 'City removed from history' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

export default router;
