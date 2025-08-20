/**
 * Create standardized API response
 * @param {string} status - Response status ('success', 'error', 'fail')
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 * @returns {Object} Formatted response object
 */
const createResponse = (status, message, data = null, meta = null) => {
  const response = {
    success: status === 'success',
    status,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return response;
};

/**
 * Create paginated response
 * @param {Array} data - Data array
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Response message
 * @returns {Object} Formatted paginated response
 */
const createPaginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return createResponse('success', message, data, {
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  });
};

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} details - Additional error details
 * @returns {Object} Formatted error response
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    status: 'error',
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (details !== null) {
    response.details = details;
  }

  return response;
};

/**
 * Transform NASA API response data
 * @param {Object} nasaData - Raw NASA API response
 * @param {string} endpoint - NASA endpoint name
 * @returns {Object} Transformed data
 */
const transformNasaData = (nasaData, endpoint) => {
  switch (endpoint) {
    case 'apod':
      return {
        ...nasaData,
        // Add any transformations specific to APOD
        imageUrl: nasaData.url,
        thumbnailUrl: nasaData.thumbnail_url || null,
        mediaType: nasaData.media_type,
        hdUrl: nasaData.hdurl || null
      };

    case 'mars-photos':
      if (nasaData.photos) {
        return {
          ...nasaData,
          photos: nasaData.photos.map(photo => ({
            id: photo.id,
            sol: photo.sol,
            camera: {
              id: photo.camera.id,
              name: photo.camera.name,
              fullName: photo.camera.full_name
            },
            imageUrl: photo.img_src,
            earthDate: photo.earth_date,
            rover: {
              id: photo.rover.id,
              name: photo.rover.name,
              landingDate: photo.rover.landing_date,
              launchDate: photo.rover.launch_date,
              status: photo.rover.status
            }
          }))
        };
      }
      return nasaData;

    case 'neo':
      return {
        ...nasaData,
        // Add summary statistics
        summary: {
          totalObjects: Object.values(nasaData.near_earth_objects || {})
            .flat().length,
          dateRange: {
            start: nasaData.start_date,
            end: nasaData.end_date
          }
        }
      };

    case 'epic':
      if (Array.isArray(nasaData)) {
        return nasaData.map(image => ({
          ...image,
          imageUrl: `https://api.nasa.gov/EPIC/archive/natural/${image.date.split(' ')[0].replace(/-/g, '/')}/png/${image.image}.png`,
          thumbnailUrl: `https://api.nasa.gov/EPIC/archive/natural/${image.date.split(' ')[0].replace(/-/g, '/')}/thumbs/${image.image}.jpg`
        }));
      }
      return nasaData;

    default:
      return nasaData;
  }
};

module.exports = {
  createResponse,
  createPaginatedResponse,
  createErrorResponse,
  transformNasaData
};
