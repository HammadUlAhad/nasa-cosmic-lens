const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Create cache instance with TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300,
  checkperiod: 120,
  useClones: false
});

/**
 * Cache middleware factory
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Cache middleware function
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);

    if (cachedData) {
      logger.info(`Cache hit for: ${key}`);
      return res.json(cachedData);
    }

    logger.info(`Cache miss for: ${key}`);

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cache.set(key, data, duration);
        logger.info(`Cached response for: ${key}`);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Clear cache for specific key or all keys
 * @param {string} key - Optional key to clear, if not provided clears all
 */
const clearCache = (key = null) => {
  if (key) {
    cache.del(key);
    logger.info(`Cleared cache for key: ${key}`);
  } else {
    cache.flushAll();
    logger.info('Cleared all cache');
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = cacheMiddleware;
module.exports.clearCache = clearCache;
module.exports.getCacheStats = getCacheStats;
