import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import WeatherService from '../../service/weatherService.js';

const router = Router();
const searchHistoryPath = path.join(process.cwd(), 'searchHistory.json');


async function readSearchHistory() {
  try {
    const data = await fs.readFile(searchHistoryPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file does not exist, return an empty array
    if (error === 'ENOENT') {
      return [];
    }
    throw error; // Rethrow if it's a different error
  }
}

// Helper function to write search history
async function writeSearchHistory(history) {
  await fs.writeFile(searchHistoryPath, JSON.stringify(history, null, 2), 'utf-8');
}

// Save a city to the search history
async function saveCityToHistory(city) {
  const history = await readSearchHistory();
  const historyEntry = {
    id: uuidv4(),
    city: city,
    timestamp: new Date().toISOString(),
  };
  history.push(historyEntry);
  await writeSearchHistory(history);
  return historyEntry; // Return the saved entry
}

// POST: Retrieve weather data for a city and save to history
router.post('/', async (req, res) => {
  const { city } = req.body;

  if (!city || city.trim() === '') {
    return res.status(400).json({ error: 'Please enter a valid city' });
  }

  try {
    const weatherData = await WeatherService.getWeatherForCity(city);
    const savedEntry = await saveCityToHistory(city);
    return res.status(200).json({ weatherData, savedEntry });
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