'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Globe, Loader2, AlertTriangle, Eye, Download, Satellite } from 'lucide-react';
import { getEPICImages } from '../lib/api';

interface EPICImage {
  identifier: string;
  caption: string;
  image: string;
  version: string;
  centroid_coordinates: {
    lat: number;
    lon: number;
  };
  dscovr_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
  lunar_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
  sun_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
  attitude_quaternions: {
    q0: number;
    q1: number;
    q2: number;
    q3: number;
  };
  date: string;
  coords: {
    centroid_coordinates: {
      lat: number;
      lon: number;
    };
  };
}

export default function EPICSection() {
  const [images, setImages] = useState<EPICImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<EPICImage | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageType, setImageType] = useState<'natural' | 'enhanced'>('natural');

  const fetchEPICImages = async (type: 'natural' | 'enhanced' = 'natural', date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEPICImages(type, date);
      setImages(Array.isArray(data) ? data : []);
      setCurrentIndex(0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch EPIC images: ${errorMessage}`);
      console.error('Failed to fetch EPIC images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEPICImages(imageType);
  }, [imageType]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (date) {
      // Format date for API (YYYY-MM-DD)
      const formattedDate = date;
      fetchEPICImages(imageType, formattedDate);
    } else {
      fetchEPICImages(imageType);
    }
  };

  const getImageUrl = (image: EPICImage, size: 'thumbs' | 'png' = 'png') => {
    // Extract date from the image date string (format: 2015-10-31 00:31:45)
    const dateStr = image.date.split(' ')[0];
    const [year, month, day] = dateStr.split('-');
    
    // Use EPIC GSFC direct URLs (no API key required for images)
    if (size === 'thumbs') {
      return `https://epic.gsfc.nasa.gov/archive/${imageType}/${year}/${month}/${day}/thumbs/${image.image}.jpg`;
    }
    return `https://epic.gsfc.nasa.gov/archive/${imageType}/${year}/${month}/${day}/png/${image.image}.png`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const formatCoordinates = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading Earth images from space...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="text-center text-red-500 p-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => fetchEPICImages(imageType)} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          EPIC Earth Images
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
          Stunning full-disc images of Earth captured by NASA&apos;s EPIC camera aboard the DSCOVR satellite.
        </p>

        {/* Date and Type Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="2015-06-13" // EPIC first light
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setImageType('natural')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    imageType === 'natural' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Natural
                </button>
                <button
                  onClick={() => setImageType('enhanced')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    imageType === 'enhanced' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Enhanced
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => handleDateChange('')}
              className="w-full sm:w-auto px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Latest Images
            </button>

            {images.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentIndex + 1} of {images.length} images
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={prevImage}
                    disabled={images.length <= 1}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={images.length <= 1}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Images Available</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {images.length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Earth Center</p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                    {currentImage ? formatCoordinates(
                      currentImage.centroid_coordinates.lat, 
                      currentImage.centroid_coordinates.lon
                    ) : 'N/A'}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Capture Time</p>
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-100">
                    {currentImage ? formatDate(currentImage.date) : 'N/A'}
                  </p>
                </div>
                <Satellite className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Image Display */}
      {currentImage && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
        >
          <div className="text-center">
            <div className="relative inline-block w-full max-w-2xl">
              <Image
                src={getImageUrl(currentImage)}
                alt={currentImage.caption || `EPIC Earth image from ${currentImage.date}`}
                width={600}
                height={600}
                className="w-full h-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedImage(currentImage)}
                priority
              />
              <button
                onClick={() => setSelectedImage(currentImage)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="mt-4 sm:mt-6 text-left max-w-2xl mx-auto px-2 sm:px-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                {currentImage.caption || 'Earth from EPIC'}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Image ID:</strong> <span className="break-all">{currentImage.identifier}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Date & Time:</strong> {formatDate(currentImage.date)} UTC
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Earth Center:</strong> {formatCoordinates(
                      currentImage.centroid_coordinates.lat, 
                      currentImage.centroid_coordinates.lon
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Version:</strong> {currentImage.version}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Distance from Earth:</strong> ~{Math.sqrt(
                      Math.pow(currentImage.dscovr_j2000_position.x, 2) +
                      Math.pow(currentImage.dscovr_j2000_position.y, 2) +
                      Math.pow(currentImage.dscovr_j2000_position.z, 2)
                    ).toFixed(0)} km
                  </p>
                  <a 
                    href={getImageUrl(currentImage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Size</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
            All Images from {selectedDate || 'Latest Available Date'}
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.identifier}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  index === currentIndex ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={getImageUrl(image, 'thumbs')}
                  alt={`EPIC Earth thumbnail ${index + 1}`}
                  width={120}
                  height={120}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] sm:text-xs p-1 text-center">
                  {new Date(image.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'UTC'
                  })} UTC
                </div>
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Size Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[95vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity text-xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
              
              <Image
                src={getImageUrl(selectedImage)}
                alt={selectedImage.caption || `EPIC Earth image from ${selectedImage.date}`}
                width={800}
                height={800}
                className="w-full h-auto rounded-lg shadow-2xl"
                priority
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-3 sm:p-4 rounded-b-lg">
                <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">
                  {selectedImage.caption || 'Earth from EPIC'}
                </h3>
                <p className="text-xs sm:text-sm">
                  {formatDate(selectedImage.date)} UTC - {formatCoordinates(
                    selectedImage.centroid_coordinates.lat, 
                    selectedImage.centroid_coordinates.lon
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
