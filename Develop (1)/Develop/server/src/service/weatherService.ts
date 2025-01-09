import dotenv from 'dotenv';
import { query, response } from 'express';
dotenv.config();
// import WEATHER_API_KEY from '/server/env'

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}
interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: { description: string }[];
  wind: { speed: number };
}
// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public temperature: number,
    public description: string,
    public humidity: number,
    public windspeed: number
  ) { }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL = 'https://api.openweathermap.org';
  private apiKey = process.env.WEATHER_API_KEY || '';
  private cityName = '';

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<Coordinates> {
    if (!this.apiKey) {
      throw new Error('API key is not defined');
    } {
      const url = `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
      const response = await fetch(url);
    }
    if (!response.ok) {
      throw new Error(`Location fetch failed for query "${query}". Status: ${response.status}`);
    } {

      const data = await response.json();
      if (data.length === 0) {
        throw new Error(`No location found for query "${query}"`);
      }
      return data;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any[]): Coordinates {
    return {
      latitude: locationData[0].lat,
      longitude: locationData[0].lon
    }
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(this.cityName)}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    if (!this.cityName) {
      throw new Error('City name is not defined');
    }

    try {
      const locationData = await this.fetchLocationData(this.cityName);
      return this.destructureLocationData(locationData);
    } catch (error) {
      throw new Error(`Failed to fetch and destructure location data: ${error.message}`);
    }
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data from ${url}. Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: WeatherResponse): Weather {
    return new Weather(
      response.main.temp,
      response.weather[0].description,
      response.main.humidity,
      response.wind.speed
    );
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    return weatherData.map((data) => {
      new Weather(
        data.main.temp,
        data.weather[0].description,
        data.main.humidity,
        data.wind.speed
    })
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather> {
    if (!city) {
      throw new Error('City name cannot be empty');
    } {

      try {
        const coordinates = await this.fetchAndDestructureLocationData();
        const weatherData = await this.fetchWeatherData(coordinates);
        return this.parseCurrentWeather(weatherData);
      } catch (error) {
        throw new Error(`Failed to get weather data for city "${city}": ${error.message}`);
      }
    }
  }

export default new WeatherService();


