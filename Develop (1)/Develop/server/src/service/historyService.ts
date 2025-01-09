// TODO: Define a City class with name and id properties
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';



class City {
  id: string;
  name: string;
  constructor (id: string, name: string) {
    this.id = id,
    this.name = name
  }
}

const searchHistoryPath = path.join(__dirname, 'searchHistory.json');


// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(searchHistoryPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
        console.log("Error reading file", error);
        return [];
      }
    }
  
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
   private async write(cities: City[]) {
    await fs.writeFile(searchHistoryPath, JSON.stringify(cities, null, 2), 'utf8');
   }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
   async getCities() {
    return await this.read();
   }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
   async addCity(cityName: string) {
    const cities = await this.read();
    const newCity = new City(uuidv4(), cityName);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
   }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<boolean> {
    const cities = await this.read();
    const updatedCities = cities.filter((city) => city.id !== id);
    
    if (cities.length === updatedCities.length) {
      console.log(`City with id ${id} was not found.`);
      return false; // No city was removed
    }
  
    await this.write(updatedCities);
    console.log(`City with id ${id} has been removed.`);
    return true; // City was removed
  }}
export default new HistoryService();
