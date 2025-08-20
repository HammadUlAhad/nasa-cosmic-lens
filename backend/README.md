# NASA Space Explorer Backend

A Node.js Express backend that serves as an intermediary for NASA's Open APIs, providing a structured and cached interface for accessing space-related data.

## Features

- **Comprehensive NASA API Integration**: Access to multiple NASA APIs including APOD, Mars Rovers, Near Earth Objects, EPIC, and NASA Image Library
- **Caching**: Built-in caching mechanism to reduce API calls and improve performance
- **Rate Limiting**: Protection against abuse with configurable rate limiting
- **Security**: Helmet.js for security headers, CORS configuration, and input validation
- **Logging**: Structured logging with Winston
- **Error Handling**: Centralized error handling with detailed error responses
- **Validation**: Input validation and sanitization for all endpoints
- **Production Ready**: Compression, security middleware, and graceful shutdown

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- NASA API Key (optional - uses DEMO_KEY by default)

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

4. Update the `.env` file with your NASA API key:
```env
NASA_API_KEY=your_nasa_api_key_here
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `5000` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `NASA_API_KEY` | `DEMO_KEY` | NASA API key |
| `NASA_API_BASE_URL` | `https://api.nasa.gov` | NASA API base URL |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CACHE_TTL` | `300000` | Cache TTL in milliseconds (5 minutes) |

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Astronomy Picture of the Day (APOD)
- `GET /api/nasa/apod` - Get today's APOD
- `GET /api/nasa/apod?date=YYYY-MM-DD` - Get APOD for specific date
- `GET /api/nasa/apod?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Get APOD range

**Query Parameters:**
- `date`: Specific date (YYYY-MM-DD)
- `start_date`: Start date for range
- `end_date`: End date for range
- `count`: Random selection count (1-100)
- `thumbs`: Include thumbnail URLs (true/false)

### Mars Rover Photos
- `GET /api/nasa/mars-photos/:rover` - Get photos from Mars rover
- Supported rovers: `curiosity`, `opportunity`, `spirit`, `perseverance`

**Query Parameters:**
- `sol`: Martian solar day
- `earth_date`: Earth date (YYYY-MM-DD)
- `camera`: Camera name (FHAZ, RHAZ, MAST, etc.)
- `page`: Page number for pagination

### Near Earth Objects (NEO)
- `GET /api/nasa/neo` - Get near earth objects for today
- `GET /api/nasa/neo?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Get NEO for date range

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- *Note: Date range limited to 7 days*

### EPIC (Earth Images)
- `GET /api/nasa/epic/natural` - Get natural Earth images
- `GET /api/nasa/epic/enhanced` - Get enhanced Earth images

**Query Parameters:**
- `date`: Specific date (YYYY-MM-DD)

### NASA Image Library Search
- `GET /api/nasa/search?q=searchterm` - Search NASA image library

**Query Parameters:**
- `q`: Search query (required)
- `media_type`: Filter by media type (image, video, audio)
- `year_start`: Start year filter
- `year_end`: End year filter
- `page`: Page number for pagination

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "status": "success",
  "message": "Data retrieved successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": { /* API response data */ },
  "meta": { /* Optional metadata like pagination */ }
}
```

### Error Response Format

```json
{
  "success": false,
  "status": "error",
  "message": "Error description",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "path": "/api/nasa/apod",
  "method": "GET"
}
```

## Scripts

```bash
npm start         # Start production server
npm run dev       # Start development server with nodemon
npm test          # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint      # Run ESLint
npm run lint:fix  # Run ESLint with auto-fix
```

## Architecture

```
backend/
├── controllers/          # Route handlers
├── middleware/          # Custom middleware
├── routes/             # API routes
├── services/           # Business logic and external API calls
├── utils/              # Utility functions and helpers
├── logs/               # Log files (generated)
├── .env                # Environment variables
├── .gitignore         # Git ignore rules
├── server.js          # Application entry point
└── package.json       # Dependencies and scripts
```

## Caching Strategy

The application implements a multi-level caching strategy:

1. **Memory Cache**: Uses node-cache for in-memory caching of API responses
2. **TTL-based**: Configurable cache expiration (default: 5 minutes)
3. **Cache Headers**: Proper HTTP cache headers for client-side caching

## Error Handling

- Centralized error handling middleware
- Structured error logging
- Graceful error responses
- NASA API error mapping and translation

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: IP-based request limiting
- **Input Validation**: Request validation and sanitization
- **Security Headers**: XSS protection, content type sniffing prevention

## Logging

Winston-based logging with:
- Console output for development
- File logging for production
- Error-specific log files
- Structured JSON logging
- Log rotation and cleanup

## Performance Optimizations

- Response compression with gzip
- Request/response caching
- Connection pooling for external APIs
- Efficient error handling
- Memory usage optimization

## Development

### Adding New NASA API Endpoints

1. Add the new endpoint to `services/nasaService.js`
2. Create controller methods in `controllers/nasaController.js`
3. Add routes in `routes/nasa.js`
4. Add validation rules in `middleware/validationMiddleware.js`
5. Update documentation

### Environment Setup for Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Check code style
npm run lint
```

## Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Use a proper NASA API key
3. Configure appropriate cache settings
4. Set up log rotation
5. Use a process manager like PM2
6. Configure reverse proxy (nginx)
7. Set up monitoring and health checks

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## Monitoring and Health

- Health check endpoint at `/health`
- Structured logging for monitoring integration
- Error tracking and reporting
- Performance metrics available

## API Rate Limits

- Default: 100 requests per 15 minutes per IP
- Configurable through environment variables
- Graceful handling of rate limit exceeded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards (ESLint)
4. Write tests for new features
5. Update documentation
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## NASA API Resources

- [NASA Open Data Portal](https://api.nasa.gov/)
- [APOD API Documentation](https://github.com/nasa/apod-api)
- [Mars Rover Photos API](https://github.com/chrisccerami/mars-photo-api)
- [Near Earth Object Web Service](https://cneos.jpl.nasa.gov/tools/api.html)
