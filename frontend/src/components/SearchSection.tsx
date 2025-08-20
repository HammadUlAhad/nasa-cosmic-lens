'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';
import { Search, Image as ImageIcon, Video as VideoIcon, Calendar, User, ExternalLink, Download, Loader2, AlertTriangle } from 'lucide-react';
import { searchNASAImages } from '../lib/api';

interface NASAMediaItem {
  href: string;
  data: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    date_created: string;
    media_type: 'image' | 'video' | 'audio';
    photographer?: string;
    location?: string;
    keywords?: string[];
    center?: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    render?: string;
  }>;
}

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('Mars');
  const [searchResults, setSearchResults] = useState<NASAMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NASAMediaItem | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'all'>('all');
  const [totalHits, setTotalHits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');

  const searchImages = useCallback(async (query: string = searchQuery, page: number = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params: {
        q: string;
        page?: number;
        page_size?: number;
        media_type?: string;
        year_start?: string;
        year_end?: string;
      } = {
        q: query.trim(),
        page,
        page_size: 20
      };
      
      if (mediaType !== 'all') {
        params.media_type = mediaType;
      }
      
      if (yearStart) {
        params.year_start = yearStart.toString();
      }
      
      if (yearEnd) {
        params.year_end = yearEnd.toString();
      }

      const data = await searchNASAImages(params);
      
      if (page === 1) {
        setSearchResults(data.collection.items || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.collection.items || [])]);
      }
      
      setTotalHits(data.collection.metadata?.total_hits || 0);
      setCurrentPage(page);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Search failed: ${errorMessage}`);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, mediaType, yearStart, yearEnd]);

  const handleSearch = () => {
    setCurrentPage(1);
    searchImages(searchQuery, 1);
  };

  const loadMore = () => {
    searchImages(searchQuery, currentPage + 1);
  };

  useEffect(() => {
    searchImages();
  }, [searchImages]);

  const getImageUrl = (item: NASAMediaItem) => {
    return item.links?.find(link => link.rel === 'preview')?.href || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <VideoIcon className="w-5 h-5" />;
      default: return <ImageIcon className="w-5 h-5" />;
    }
  };

  const popularSearches = [
    'Mars', 'Earth', 'Moon', 'Saturn', 'Jupiter', 'Nebula', 
    'Galaxy', 'Astronaut', 'ISS', 'Solar Eclipse', 'Hubble', 'James Webb'
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          NASA Image & Video Library
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore NASA&apos;s vast collection of images, videos, and audio from space missions and research.
        </p>

        {/* Search Form */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search NASA archives..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>Search</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Media Type
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'audio' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year Start
              </label>
              <input
                type="number"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                placeholder="e.g., 2020"
                min="1958"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year End
              </label>
              <input
                type="number"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                placeholder="e.g., 2024"
                min="1958"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setYearStart('');
                  setYearEnd('');
                  setMediaType('all');
                }}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Popular Searches */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    setCurrentPage(1);
                    searchImages(term, 1);
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {totalHits > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              Found {totalHits.toLocaleString()} results for &quot;{searchQuery}&quot;
              {searchResults.length < totalHits && ` (showing ${searchResults.length})`}
            </p>
          </div>
        )}
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
        >
          <div className="text-center text-red-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p className="mb-4">{error}</p>
            <button
              onClick={() => searchImages()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && searchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
        >
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Searching NASA archives...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((item, index) => {
              const data = item.data[0];
              const imageUrl = getImageUrl(item);
              
              return (
                <motion.div
                  key={`${data.nasa_id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                >
                  {imageUrl && (
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-600">
                      <NextImage
                        src={imageUrl}
                        alt={data.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1 text-blue-500">
                        {getMediaIcon(data.media_type)}
                        <span className="text-xs uppercase font-medium">
                          {data.media_type}
                        </span>
                      </div>
                      {data.date_created && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(data.date_created).getFullYear()}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {data.title}
                    </h3>
                    
                    {data.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                        {data.description}
                      </p>
                    )}
                    
                    {data.center && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        {data.center}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More Button */}
          {searchResults.length < totalHits && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span>Load More Results</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-8">
                    {selectedItem.data[0].title}
                  </h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {getImageUrl(selectedItem) && (
                  <div className="mb-6">
                    <NextImage
                      src={getImageUrl(selectedItem)}
                      alt={selectedItem.data[0].title}
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg shadow-lg"
                      priority
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        {getMediaIcon(selectedItem.data[0].media_type)}
                        <span className="text-gray-600 dark:text-gray-400">
                          Media Type: {selectedItem.data[0].media_type}
                        </span>
                      </div>
                      
                      {selectedItem.data[0].date_created && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Created: {formatDate(selectedItem.data[0].date_created)}
                          </span>
                        </div>
                      )}
                      
                      {selectedItem.data[0].center && (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Center: {selectedItem.data[0].center}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          NASA ID: {selectedItem.data[0].nasa_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {selectedItem.data[0].description || 'No description available.'}
                    </p>
                    
                    {selectedItem.data[0].keywords && selectedItem.data[0].keywords.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.data[0].keywords.slice(0, 10).map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
