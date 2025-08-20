'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Camera, Calendar, Loader2, AlertTriangle, Filter } from 'lucide-react';
import { getMarsRoverPhotos } from '../lib/api';

interface MarsPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

const rovers = [
  { id: 'curiosity', name: 'Curiosity', active: true, color: 'bg-blue-500' },
  { id: 'perseverance', name: 'Perseverance', active: true, color: 'bg-green-500' },
  { id: 'opportunity', name: 'Opportunity', active: false, color: 'bg-orange-500' },
  { id: 'spirit', name: 'Spirit', active: false, color: 'bg-red-500' },
];

const cameras = {
  'FHAZ': 'Front Hazard Avoidance Camera',
  'RHAZ': 'Rear Hazard Avoidance Camera',
  'MAST': 'Mast Camera',
  'CHEMCAM': 'Chemistry and Camera Complex',
  'MAHLI': 'Mars Hand Lens Imager',
  'MARDI': 'Mars Descent Imager',
  'NAVCAM': 'Navigation Camera',
  'PANCAM': 'Panoramic Camera',
  'MINITES': 'Miniature Thermal Emission Spectrometer',
};

export default function MarsRoverPhotos() {
  const [selectedRover, setSelectedRover] = useState('curiosity');
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MarsPhoto | null>(null);
  
  // Filters
  const [sol, setSol] = useState<string>('');
  const [earthDate, setEarthDate] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPhotos = useCallback(async (rover: string, filters: {
    sol?: number;
    earth_date?: string;
    camera?: string;
    page?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMarsRoverPhotos(rover, filters);
      setPhotos(data.photos || data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch rover photos: ${errorMessage}`);
      console.error('Failed to fetch rover photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos(selectedRover);
  }, [selectedRover, fetchPhotos]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: {
      sol?: number;
      earth_date?: string;
      camera?: string;
      page?: number;
    } = {};
    
    if (sol && !isNaN(parseInt(sol))) {
      filters.sol = parseInt(sol);
    }
    if (earthDate) {
      filters.earth_date = earthDate;
    }
    if (selectedCamera) {
      filters.camera = selectedCamera;
    }
    filters.page = currentPage;

    fetchPhotos(selectedRover, filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSol('');
    setEarthDate('');
    setSelectedCamera('');
    setCurrentPage(1);
    fetchPhotos(selectedRover);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Mars Rover Photos
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Explore the Red Planet through the eyes of NASA&apos;s rovers. View stunning images captured by various cameras aboard our robotic explorers.
        </p>
      </motion.div>

      {/* Rover Selection */}
      <div className="flex flex-wrap gap-4 justify-center">
        {rovers.map((rover) => (
          <motion.button
            key={rover.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRover(rover.id)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedRover === rover.id
                ? `${rover.color} text-white shadow-lg`
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${rover.active ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {rover.name}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Photos
        </h3>
        
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sol Filter */}
            <div>
              <label htmlFor="sol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sol (Mars Day)
              </label>
              <input
                id="sol"
                type="number"
                value={sol}
                onChange={(e) => setSol(e.target.value)}
                placeholder="e.g., 1000"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Earth Date Filter */}
            <div>
              <label htmlFor="earth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Earth Date
              </label>
              <input
                id="earth_date"
                type="date"
                value={earthDate}
                onChange={(e) => setEarthDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Camera Filter */}
            <div>
              <label htmlFor="camera" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Camera
              </label>
              <select
                id="camera"
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Cameras</option>
                {Object.entries(cameras).map(([key, name]) => (
                  <option key={key} value={key}>{key} - {name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {loading ? 'Loading...' : 'Search Photos'}
            </button>
            
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Searching for Mars rover photos...</p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {!loading && photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.img_src}
                  alt={`Mars photo by ${photo.rover.name} - Sol ${photo.sol}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {photo.camera.full_name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sol {photo.sol} • {formatDate(photo.earth_date)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* No Photos Message */}
      {!loading && photos.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Photos Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search filters or selecting a different rover.
          </p>
        </motion.div>
      )}

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-auto">
                <Image
                  src={selectedPhoto.img_src}
                  alt={`Mars photo by ${selectedPhoto.rover.name} - Sol ${selectedPhoto.sol}`}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {selectedPhoto.rover.name} - Sol {selectedPhoto.sol}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Camera:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPhoto.camera.full_name}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Earth Date:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedPhoto.earth_date)}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Sol:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPhoto.sol}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Rover Status:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPhoto.rover.status}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
