'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Loader2, Zap, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getNearEarthObjects } from '../lib/api';

interface NearEarthObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
    };
    orbiting_body: string;
  }>;
}

interface NEOFeed {
  element_count: number;
  near_earth_objects: Record<string, NearEarthObject[]>;
}

export default function NEOSection() {
  // Initialize with default valid dates
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days later for 7-day range
  
  const [neoData, setNeoData] = useState<NEOFeed | null>(null);
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(weekFromNow.toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNEO, setSelectedNEO] = useState<NearEarthObject | null>(null);

  const fetchNEOs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use current state dates or fallback to defaults
      const start = startDate || new Date().toISOString().split('T')[0];
      const end = endDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Validate date range - NASA NEO API has a 7-day limit
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const daysDifference = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24));
      
      if (daysDifference > 7) {
        setError('Date range cannot exceed 7 days. NASA NEO API has a maximum 7-day limit.');
        return;
      }
      
      if (daysDifference < 0) {
        setError('End date must be after start date.');
        return;
      }
      
      const data = await getNearEarthObjects({ 
        start_date: start, 
        end_date: end 
      });
      setNeoData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch NEO data: ${errorMessage}`);
      console.error('Failed to fetch NEO data:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setError(null); // Clear any previous error when date changes
    
    // Always ensure end date is within 7 days of start date
    if (date) {
      const startObj = new Date(date);
      
      if (endDate) {
        // If end date exists, check if it needs adjustment
        const endObj = new Date(endDate);
        const daysDiff = Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff > 7 || daysDiff < 0) {
          // Auto-adjust end date to be 7 days from start date
          const maxEndDate = new Date(startObj.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days later for 7-day range
          setEndDate(maxEndDate.toISOString().split('T')[0]);
        }
      } else {
        // If no end date is set, automatically set it to 7 days from start date
        const defaultEndDate = new Date(startObj.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days later for 7-day range
        setEndDate(defaultEndDate.toISOString().split('T')[0]);
      }
    }
  };

  const handleEndDateChange = (date: string) => {
    setError(null); // Clear any previous error when date changes
    
    // Validate that the range doesn't exceed 7 days
    if (startDate && date) {
      const startObj = new Date(startDate);
      const endObj = new Date(date);
      const daysDiff = Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff > 7) {
        setError('Date range cannot exceed 7 days due to NASA API limits.');
        return;
      }
      
      if (daysDiff < 0) {
        setError('End date must be after start date.');
        return;
      }
    }
    
    setEndDate(date);
  };

  useEffect(() => {
    fetchNEOs();
  }, [fetchNEOs]);

  const getAllNEOs = (): NearEarthObject[] => {
    if (!neoData) return [];
    return Object.values(neoData.near_earth_objects).flat();
  };

  const getHazardousNEOs = () => {
    return getAllNEOs().filter(neo => neo.is_potentially_hazardous_asteroid);
  };

  const getDailyCount = () => {
    if (!neoData) return [];
    // Sort dates chronologically before mapping
    return Object.entries(neoData.near_earth_objects)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, neos]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date, // Keep original date for sorting reference
        count: neos.length,
        hazardous: neos.filter(neo => neo.is_potentially_hazardous_asteroid).length,
        safe: neos.filter(neo => !neo.is_potentially_hazardous_asteroid).length
      }));
  };

  const getSizeDistribution = () => {
    const allNEOs = getAllNEOs();
    const sizeRanges = [
      { name: 'Small (<0.1 km)', min: 0, max: 0.1, count: 0, color: '#3B82F6' },
      { name: 'Medium (0.1-1 km)', min: 0.1, max: 1, count: 0, color: '#10B981' },
      { name: 'Large (1-10 km)', min: 1, max: 10, count: 0, color: '#F59E0B' },
      { name: 'Huge (>10 km)', min: 10, max: Infinity, count: 0, color: '#EF4444' }
    ];

    allNEOs.forEach(neo => {
      const avgDiameter = (neo.estimated_diameter.kilometers.estimated_diameter_min + 
                          neo.estimated_diameter.kilometers.estimated_diameter_max) / 2;
      
      const range = sizeRanges.find(r => avgDiameter >= r.min && avgDiameter < r.max);
      if (range) range.count++;
    });

    return sizeRanges.filter(range => range.count > 0);
  };

  const formatDistance = (kilometers: string) => {
    const km = parseFloat(kilometers);
    if (km > 1000000) {
      return `${(km / 1000000).toFixed(2)}M km`;
    }
    return `${km.toLocaleString()} km`;
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchNEOs();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Scanning space for asteroids...</p>
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
            onClick={handleRetry} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const allNEOs = getAllNEOs();
  const hazardousNEOs = getHazardousNEOs();
  const dailyData = getDailyCount();
  const sizeData = getSizeDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Near Earth Objects
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Track asteroids and comets that pass close to Earth. Explore historical data or future predictions from NASA&apos;s JPL.
          <br />
          <span className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Note: Date range is limited to 7 days maximum due to NASA API restrictions.
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                (Max 7-day range)
              </span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Start date for NEO data (maximum 7-day range allowed)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                (Max 7-day range)
              </span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="End date for NEO data (maximum 7-day range allowed)"
            />
          </div>
        </div>

        {/* Date Range Helper */}
        {startDate && endDate && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {(() => {
                  const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1;
                  return `Selected range: ${daysDiff} day${daysDiff === 1 ? '' : 's'} ${daysDiff <= 7 ? '✓' : '⚠️ Exceeds 7-day limit'}`;
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total NEOs</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {allNEOs.length}
                </p>
              </div>
              <Zap className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Potentially Hazardous</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {hazardousNEOs.length}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Safety Percentage</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {allNEOs.length > 0 ? Math.round(((allNEOs.length - hazardousNEOs.length) / allNEOs.length) * 100) : 0}%
                </p>
              </div>
              <Calendar className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Count Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Daily NEO Count
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="safe" stackId="a" fill="#10B981" name="Safe NEOs" />
              <Bar dataKey="hazardous" stackId="a" fill="#EF4444" name="Hazardous NEOs" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Size Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Size Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sizeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {sizeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* NEO List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Near Earth Objects Details
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {allNEOs.slice(0, 10).map((neo, index) => (
            <motion.div
              key={neo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                neo.is_potentially_hazardous_asteroid
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 hover:border-red-300'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/20 hover:border-gray-300'
              } hover:shadow-md`}
              onClick={() => setSelectedNEO(selectedNEO?.id === neo.id ? null : neo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {neo.name}
                    {neo.is_potentially_hazardous_asteroid && (
                      <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Diameter: {neo.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - {neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Next Approach: {neo.close_approach_data[0]?.close_approach_date}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Distance: {formatDistance(neo.close_approach_data[0]?.miss_distance.kilometers)}
                  </p>
                </div>
              </div>

              {selectedNEO?.id === neo.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-2"><strong>Absolute Magnitude:</strong> {neo.absolute_magnitude_h}</p>
                      <p className="mb-2"><strong>Velocity:</strong> {parseFloat(neo.close_approach_data[0]?.relative_velocity.kilometers_per_second).toFixed(2)} km/s</p>
                      <p><strong>Orbiting:</strong> {neo.close_approach_data[0]?.orbiting_body}</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <a 
                        href={neo.nasa_jpl_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View NASA JPL Details</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          {allNEOs.length > 10 && (
            <div className="text-center text-gray-500 dark:text-gray-400 pt-4">
              Showing 10 of {allNEOs.length} NEOs. Adjust date range to see different results.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
