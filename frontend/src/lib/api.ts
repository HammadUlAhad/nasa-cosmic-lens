import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// API response interceptor to extract data from the response wrapper
api.interceptors.response.use(
  (response) => {
    // If the response has a data.data structure (from backend response formatter), extract it
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // Handle error responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
);

// API functions for NASA data

export const getAPOD = async (params?: { 
  date?: string; 
  count?: number; 
  start_date?: string; 
  end_date?: string;
  thumbs?: boolean;
}) => {
  const response = await api.get('/api/nasa/apod', { params });
  return response.data;
};

export const getNearEarthObjects = async (params?: { 
  start_date?: string; 
  end_date?: string;
}) => {
  const response = await api.get('/api/nasa/neo', { params });
  return response.data;
};

export const searchNASAImages = async (params: {
  q: string;
  media_type?: string;
  year_start?: string;
  year_end?: string;
  page?: number;
}) => {
  const response = await api.get('/api/nasa/search', { params });
  return response.data;
};

export const getEPICImages = async (type: 'natural' | 'enhanced' = 'natural', date?: string) => {
  const response = await api.get(`/api/nasa/epic/${type}`, { 
    params: date ? { date } : {} 
  });
  return response.data;
};

export const getMarsWeather = async () => {
  const response = await api.get('/api/nasa/insight');
  return response.data;
};

export const getMarsRoverPhotos = async (
  rover: string, 
  params?: {
    sol?: number;
    earth_date?: string;
    camera?: string;
    page?: number;
  }
) => {
  const response = await api.get(`/api/nasa/mars-photos/${rover}`, { params });
  return response.data;
};

// Note: Mars Rover Manifest is not implemented in backend, removing for now
// export const getMarsRoverManifest = async (rover: string) => {
//   const response = await api.get(`/api/nasa/mars-rover/${rover}/manifest`);
//   return response.data;
// };

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
