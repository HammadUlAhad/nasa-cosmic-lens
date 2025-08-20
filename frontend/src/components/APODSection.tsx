'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getAPOD } from '../lib/api';

interface APODData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

export default function APODSection() {
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAPOD = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAPOD(date ? { date } : {});
      setApodData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch APOD: ${errorMessage}`);
      console.error('APOD Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPOD();
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (date) {
      fetchAPOD(date);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading today&apos;s cosmic wonder...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="text-center text-red-500 p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => fetchAPOD()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Astronomy Picture of the Day
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover the cosmos! Each day we feature a different image or photograph of our fascinating universe.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              max={getTodayDate()}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {apodData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {apodData.media_type === 'image' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative group"
                >
                  <Image
                    src={apodData.url}
                    alt={apodData.title}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
                    priority
                  />
                  {apodData.hdurl && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <a
                        href={apodData.hdurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                      >
                        View HD Version
                      </a>
                    </div>
                  )}
                </motion.div>
              ) : apodData.media_type === 'video' ? (
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={apodData.url}
                    title={apodData.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : null}
              
              {apodData.hdurl && (
                <a
                  href={apodData.hdurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View HD Version</span>
                </a>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {apodData.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                    {apodData.date}
                  </span>
                  {apodData.copyright && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                      © {apodData.copyright}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Explanation</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {apodData.explanation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Media Type</div>
                  <div className="text-blue-600 dark:text-blue-400 capitalize">{apodData.media_type}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Service Version</div>
                  <div className="text-purple-600 dark:text-purple-400">{apodData.service_version}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
