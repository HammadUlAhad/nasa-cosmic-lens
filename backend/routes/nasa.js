const express = require('express');
const router = express.Router();
const {
  getApod,
  getMarsRoverPhotos,
  getNearEarthObjects,
  getEpicImages,
  getInsightWeather,
  searchImages
} = require('../controllers/nasaController');
const { validateQuery } = require('../middleware/validationMiddleware');
const cache = require('../middleware/cacheMiddleware');

// Astronomy Picture of the Day
router.get('/apod', cache(300), validateQuery(['date', 'start_date', 'end_date']), getApod);

// Mars Rover Photos
router.get('/mars-photos/:rover', cache(300), validateQuery(['sol', 'earth_date', 'camera']), getMarsRoverPhotos);

// Near Earth Objects
router.get('/neo', cache(300), validateQuery(['start_date', 'end_date']), getNearEarthObjects);

// EPIC (Earth Polychromatic Imaging Camera)
router.get('/epic/:type', cache(300), validateQuery(['date']), getEpicImages);

// InSight Mars Weather
router.get('/insight', cache(300), getInsightWeather);

// NASA Image and Video Library Search
router.get('/search', cache(300), validateQuery(['q', 'media_type', 'year_start', 'year_end']), searchImages);

module.exports = router;
