const nasaService = require('../services/nasaService');
const { createResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Get Astronomy Picture of the Day
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getApod = async (req, res, next) => {
  try {
    const { date, start_date, end_date, count, thumbs } = req.query;
    
    const data = await nasaService.fetchApod({
      date,
      start_date,
      end_date,
      count: count ? parseInt(count) : undefined,
      thumbs: thumbs === 'true'
    });

    res.json(createResponse('success', 'APOD data retrieved successfully', data));
  } catch (error) {
    logger.error('Error fetching APOD:', error);
    next(error);
  }
};

/**
 * Get Mars Rover Photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMarsRoverPhotos = async (req, res, next) => {
  try {
    const { rover } = req.params;
    const { sol, earth_date, camera, page } = req.query;

    if (!['curiosity', 'opportunity', 'spirit', 'perseverance'].includes(rover.toLowerCase())) {
      return res.status(400).json(createResponse('error', 'Invalid rover name'));
    }

    const data = await nasaService.fetchMarsRoverPhotos(rover, {
      sol: sol ? parseInt(sol) : undefined,
      earth_date,
      camera,
      page: page ? parseInt(page) : 1
    });

    res.json(createResponse('success', 'Mars rover photos retrieved successfully', data));
  } catch (error) {
    logger.error('Error fetching Mars rover photos:', error);
    next(error);
  }
};

/**
 * Get Near Earth Objects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNearEarthObjects = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const data = await nasaService.fetchNearEarthObjects({
      start_date,
      end_date
    });

    res.json(createResponse('success', 'Near Earth Objects data retrieved successfully', data));
  } catch (error) {
    logger.error('Error fetching Near Earth Objects:', error);
    next(error);
  }
};

/**
 * Get EPIC Images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEpicImages = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { date } = req.query;

    if (!['natural', 'enhanced'].includes(type)) {
      return res.status(400).json(createResponse('error', 'Invalid EPIC type. Use "natural" or "enhanced"'));
    }

    const data = await nasaService.fetchEpicImages(type, { date });

    res.json(createResponse('success', 'EPIC images retrieved successfully', data));
  } catch (error) {
    logger.error('Error fetching EPIC images:', error);
    next(error);
  }
};

/**
 * Get InSight Mars Weather Data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getInsightWeather = async (req, res, next) => {
  try {
    const data = await nasaService.fetchInsightWeather();

    res.json(createResponse('success', 'InSight weather data retrieved successfully', data));
  } catch (error) {
    logger.error('Error fetching InSight weather data:', error);
    next(error);
  }
};

/**
 * Search NASA Image and Video Library
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const searchImages = async (req, res, next) => {
  try {
    const { q, media_type, year_start, year_end, page } = req.query;

    if (!q) {
      return res.status(400).json(createResponse('error', 'Search query (q) is required'));
    }

    const data = await nasaService.searchNasaLibrary({
      q,
      media_type,
      year_start: year_start ? parseInt(year_start) : undefined,
      year_end: year_end ? parseInt(year_end) : undefined,
      page: page ? parseInt(page) : 1
    });

    res.json(createResponse('success', 'NASA library search completed successfully', data));
  } catch (error) {
    logger.error('Error searching NASA library:', error);
    next(error);
  }
};

module.exports = {
  getApod,
  getMarsRoverPhotos,
  getNearEarthObjects,
  getEpicImages,
  getInsightWeather,
  searchImages
};
