const axios = require('axios');
const logger = require('../utils/logger');

class NasaService {
  constructor() {
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.baseUrl = process.env.NASA_API_BASE_URL || 'https://api.nasa.gov';
    this.imageLibraryUrl = 'https://images-api.nasa.gov';
    
    // Create axios instance with default config
    this.api = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'NASA-Space-Explorer-App/1.0.0'
      }
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        logger.info(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          logger.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
          throw new Error(`NASA API Error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } else if (error.request) {
          logger.error('Network error:', error.message);
          throw new Error('Network error: Unable to reach NASA API');
        } else {
          logger.error('Request setup error:', error.message);
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Fetch Astronomy Picture of the Day
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} APOD data
   */
  async fetchApod(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey
      });

      // Only add parameters that have values
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.set(key, params[key]);
        }
      });

      const response = await this.api.get(`${this.baseUrl}/planetary/apod?${queryParams}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching APOD:', error);
      throw error;
    }
  }

  /**
   * Fetch Mars Rover Photos
   * @param {string} rover - Rover name (curiosity, opportunity, spirit, perseverance)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Mars rover photos data
   */
  async fetchMarsRoverPhotos(rover, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey
      });

      // Only add parameters that have values
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.set(key, params[key]);
        }
      });

      const response = await this.api.get(`${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/photos?${queryParams}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching ${rover} photos:`, error);
      throw error;
    }
  }

  /**
   * Fetch Near Earth Objects
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} NEO data
   */
  async fetchNearEarthObjects(params = {}) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        start_date: params.start_date || today,
        end_date: params.end_date || today
      });

      // Remove undefined values from params
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.set(key, params[key]);
        }
      });

      const response = await this.api.get(`${this.baseUrl}/neo/rest/v1/feed?${queryParams}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching Near Earth Objects:', error);
      throw error;
    }
  }

  /**
   * Fetch EPIC Images
   * @param {string} type - Image type (natural or enhanced)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} EPIC images data
   */
  async fetchEpicImages(type, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey
      });

      let url = `${this.baseUrl}/EPIC/api/${type}`;
      if (params.date) {
        url += `/date/${params.date}`;
      }
      
      // Only add non-date parameters to query string
      Object.keys(params).forEach(key => {
        if (key !== 'date' && params[key] !== undefined && params[key] !== null) {
          queryParams.set(key, params[key]);
        }
      });

      url += `?${queryParams}`;

      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      logger.error('Error fetching EPIC images:', error);
      throw error;
    }
  }

  /**
   * Fetch InSight Mars Weather Data
   * @returns {Promise<Object>} InSight weather data
   */
  async fetchInsightWeather() {
    try {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        feedtype: 'json',
        ver: '1.0'
      });

      const response = await this.api.get(`${this.baseUrl}/insight_weather/?${queryParams}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching InSight weather data:', error);
      // InSight mission ended, so we'll return a friendly message
      throw new Error('InSight weather data is no longer available as the mission has ended.');
    }
  }

  /**
   * Search NASA Image and Video Library
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchNasaLibrary(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Only add parameters that have values
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.set(key, params[key]);
        }
      });

      const response = await this.api.get(`${this.imageLibraryUrl}/search?${queryParams}`);
      return response.data;
    } catch (error) {
      logger.error('Error searching NASA library:', error);
      throw error;
    }
  }

  /**
   * Get additional metadata for a NASA image
   * @param {string} nasaId - NASA ID of the image
   * @returns {Promise<Object>} Image metadata
   */
  async getImageMetadata(nasaId) {
    try {
      const response = await this.api.get(`${this.imageLibraryUrl}/metadata/${nasaId}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching image metadata:', error);
      throw error;
    }
  }

  /**
   * Get image asset information
   * @param {string} nasaId - NASA ID of the image
   * @returns {Promise<Object>} Image asset information
   */
  async getImageAsset(nasaId) {
    try {
      const response = await this.api.get(`${this.imageLibraryUrl}/asset/${nasaId}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching image asset:', error);
      throw error;
    }
  }
}

module.exports = new NasaService();
