import { Router } from 'express';
import express from 'express'
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();
const searchHistoryPath = path.join(__dirname, 'searchHistory.json');



// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => { 
  const city = req.body;

  if (!city) {
    return res.status(400).json({ error: 'Please enter a city'});
  }
  try {
    const weatherData = await WeatherService.getWeatherForCity(city);
    await saveCityToHistory(city);
    return res.status(200).json(weatherData);
  }})
  // TODO: GET weather data from city name
  // TODO: save city to search history
  async function saveCityToHistory(city) {
    const historyEntry = {
        id: uuidv4(),
        city: city,
    };
// TODO: GET search history
router.get('/history', async (req, res) => {});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {});

export default router;
