# NASA Cosmic Lens

A modern web application that brings the wonders of space exploration to your fingertips. Explore Mars through rover cameras, view stunning Earth images from space, track near-Earth objects, and discover NASA's astronomy picture of the day.

## Live Projects

- **Frontend**: [https://nasa-cosmic-lens-1.onrender.com](https://nasa-cosmic-lens-1.onrender.com)
- **Backend API**: [https://nasa-cosmic-lens.onrender.com](https://nasa-cosmic-lens.onrender.com)

## Features

- **Mars Rover Photos**: Browse high-quality images from Curiosity, Perseverance, and Spirit rovers
- **EPIC Earth Images**: View real-time Earth images from NASA's EPIC camera with natural and enhanced color options
- **Near Earth Objects (NEO)**: Track asteroids and comets approaching Earth
- **Astronomy Picture of the Day**: Discover daily stunning space imagery with detailed explanations
- **NASA Image Search**: Search through NASA's vast media library
- **InSight Weather**: Mars weather data from the InSight lander

## Technology Stack

### Frontend
- **Framework**: Next.js 15.4.6 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Lucide React (icons)
- **HTTP Client**: Axios
- **Image Optimization**: Next.js Image component

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Security**: Helmet.js, CORS
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **Compression**: compression middleware
- **Environment Management**: dotenv

### DevOps & Deployment
- **Frontend Hosting**: Render
- **Backend Hosting**: Render
- **Version Control**: Git/GitHub
- **Package Manager**: npm

## Project Structure

```
nasa-cosmic-lens/
├── frontend/                 # Next.js React frontend
│   ├── src/
│   │   ├── app/             # Next.js 13+ app directory
│   │   │   ├── layout.tsx   # Root layout component
│   │   │   ├── page.tsx     # Home page
│   │   │   └── globals.css  # Global styles
│   │   ├── components/      # React components
│   │   │   ├── APODSection.tsx      # Astronomy Picture of the Day
│   │   │   ├── EPICSection.tsx      # EPIC Earth Images
│   │   │   ├── MarsRoverSection.tsx # Mars Rover Photos
│   │   │   ├── NEOSection.tsx       # Near Earth Objects
│   │   │   └── SearchSection.tsx    # NASA Image Search
│   │   └── lib/
│   │       └── api.ts       # API client functions
│   ├── public/              # Static assets
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── backend/                 # Node.js Express backend
    ├── controllers/         # Route controllers
    │   └── nasaController.js
    ├── middleware/          # Custom middleware
    │   ├── cacheMiddleware.js
    │   ├── errorMiddleware.js
    │   └── validationMiddleware.js
    ├── routes/              # API routes
    │   └── nasa.js
    ├── services/            # Business logic
    │   └── nasaService.js
    ├── utils/               # Utility functions
    │   ├── logger.js
    │   └── responseFormatter.js
    ├── tests/               # Test files
    ├── logs/                # Application logs
    ├── package.json
    ├── server.js            # Main server file
    └── .env                 # Environment variables
```

## API Endpoints

Base URL: `https://nasa-cosmic-lens.onrender.com/api/nasa`

### Mars Rover Photos
- **GET** `/mars-rover-photos?rover={rover}&sol={sol}&camera={camera}&page={page}`
- **Parameters**:
  - `rover`: curiosity, perseverance, spirit, opportunity
  - `sol`: Martian sol (day)
  - `earth_date`: Earth date (YYYY-MM-DD)
  - `camera`: Camera type (FHAZ, RHAZ, MAST, etc.)
  - `page`: Pagination

### EPIC Earth Images
- **GET** `/epic?type={type}`
- **Parameters**:
  - `type`: natural, enhanced

### Near Earth Objects
- **GET** `/neo?start_date={start}&end_date={end}`
- **Parameters**:
  - `start_date`: Start date (YYYY-MM-DD)
  - `end_date`: End date (YYYY-MM-DD)

### Astronomy Picture of the Day
- **GET** `/apod?date={date}`
- **Parameters**:
  - `date`: Specific date (YYYY-MM-DD) - optional

### NASA Image Search
- **GET** `/search?q={query}&media_type={type}`
- **Parameters**:
  - `q`: Search query
  - `media_type`: image, video, audio

### InSight Weather (Mars)
- **GET** `/insight-weather`

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- NASA API Key (get one at [https://api.nasa.gov](https://api.nasa.gov))

### 1. Clone the Repository
```bash
git clone https://github.com/HammadUlAhad/nasa-cosmic-lens.git
cd nasa-cosmic-lens
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your NASA API key
# Add your NASA API key to .env:
# NASA_API_KEY=your_api_key_here
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local if needed (backend URL is already configured)
```

### 4. Start Development Servers

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

#### Start Frontend Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

### 5. Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
NASA_API_KEY=your_nasa_api_key_here
NASA_API_BASE_URL=https://api.nasa.gov
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CACHE_TTL=300000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_PRODUCTION_URL=https://nasa-cosmic-lens.onrender.com
```

## Build for Production

### Frontend Build
```bash
cd frontend
npm run build
npm start
```

### Backend Production
```bash
cd backend
npm start
```

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Comprehensive Tests
```bash
cd backend
npm run test:comprehensive
```

## Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm run test:comprehensive` - Run comprehensive API tests

## Key Features Implementation

### Real-time Data
- All NASA APIs provide real-time or near real-time data
- EPIC images are updated multiple times daily
- NEO data includes upcoming asteroid approaches

### Performance Optimizations
- Response caching on backend
- Image optimization with Next.js
- Rate limiting to prevent API abuse
- Compression middleware for faster responses

### User Experience
- Responsive design for all devices
- Smooth animations with Framer Motion
- Loading states and error handling
- Intuitive navigation and filtering

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- NASA for providing free access to their incredible APIs
- The Mars rover teams for capturing stunning images of the Red Planet
- NASA's EPIC team for Earth monitoring capabilities
- The astronomy community for inspiring space exploration

---

**Made with love and curiosity about the cosmos**