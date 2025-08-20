const { body, query, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validation rules for different endpoints
 */
const validationRules = {
  apod: [
    query('date').optional().isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
    query('start_date').optional().isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
    query('end_date').optional().isISO8601().withMessage('End date must be in YYYY-MM-DD format'),
    query('count').optional().isInt({ min: 1, max: 100 }).withMessage('Count must be between 1 and 100'),
    query('thumbs').optional().isBoolean().withMessage('Thumbs must be a boolean value')
  ],
  
  marsPhotos: [
    param('rover').isIn(['curiosity', 'opportunity', 'spirit', 'perseverance']).withMessage('Invalid rover name'),
    query('sol').optional().isInt({ min: 0 }).withMessage('Sol must be a positive integer'),
    query('earth_date').optional().isISO8601().withMessage('Earth date must be in YYYY-MM-DD format'),
    query('camera').optional().isIn([
      'FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM',
      'PANCAM', 'MINITES', 'ENTRY', 'EDL_RUCAM', 'EDL_RDCAM', 'EDL_DDCAM',
      'EDL_PUCAM1', 'EDL_PUCAM2', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_LEFT',
      'MCZ_RIGHT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A',
      'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT', 'SUPERCAM_RMI'
    ]).withMessage('Invalid camera name'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
  ],

  neo: [
    query('start_date').optional().isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
    query('end_date').optional().isISO8601().withMessage('End date must be in YYYY-MM-DD format')
  ],

  epic: [
    param('type').isIn(['natural', 'enhanced']).withMessage('Type must be either "natural" or "enhanced"'),
    query('date').optional().isISO8601().withMessage('Date must be in YYYY-MM-DD format')
  ],

  search: [
    query('q').notEmpty().withMessage('Search query (q) is required'),
    query('media_type').optional().isIn(['image', 'video', 'audio']).withMessage('Media type must be image, video, or audio'),
    query('year_start').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid start year'),
    query('year_end').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid end year'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
  ]
};

/**
 * Generic validation middleware
 * @param {Array} fields - Fields to validate from query params
 * @returns {Function} Validation middleware
 */
const validateQuery = (fields = []) => {
  return (req, res, next) => {
    // Basic field validation
    for (const field of fields) {
      if (req.query[field] !== undefined) {
        // Date validation
        if (field.includes('date') && req.query[field]) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(req.query[field])) {
            return res.status(400).json({
              success: false,
              error: `Invalid ${field} format. Use YYYY-MM-DD`,
              timestamp: new Date().toISOString()
            });
          }
        }

        // Integer validation for numeric fields
        if (['sol', 'count', 'page', 'year_start', 'year_end'].includes(field) && req.query[field]) {
          const num = parseInt(req.query[field]);
          if (isNaN(num) || num < 0) {
            return res.status(400).json({
              success: false,
              error: `${field} must be a valid positive integer`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }

    // Date range validation
    if (req.query.start_date && req.query.end_date) {
      const startDate = new Date(req.query.start_date);
      const endDate = new Date(req.query.end_date);
      
      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          timestamp: new Date().toISOString()
        });
      }

      // Limit date range to 7 days for some endpoints
      const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7 && req.path.includes('neo')) {
        return res.status(400).json({
          success: false,
          error: 'Date range cannot exceed 7 days for Near Earth Objects',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Year range validation
    if (req.query.year_start && req.query.year_end) {
      const startYear = parseInt(req.query.year_start);
      const endYear = parseInt(req.query.year_end);
      
      if (startYear > endYear) {
        return res.status(400).json({
          success: false,
          error: 'Start year must be before end year',
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  };
};

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  validationRules,
  validateQuery,
  handleValidationErrors
};
