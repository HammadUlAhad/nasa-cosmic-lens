'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Star, Asterisk, Search, Globe, Camera } from 'lucide-react';
import APODSection from '../components/APODSection';
import NEOSection from '../components/NEOSection';
import SearchSection from '../components/SearchSection';
import EPICSection from '../components/EPICSection';
import MarsRoverSection from '../components/MarsRoverSection';

type ActiveSection = 'home' | 'apod' | 'neo' | 'search' | 'epic' | 'mars';

const sections = [
  { 
    id: 'apod' as ActiveSection, 
    title: 'Astronomy Picture', 
    icon: Star, 
    description: 'Daily space photography from NASA',
    gradient: 'from-blue-500 to-purple-600'
  },
  { 
    id: 'neo' as ActiveSection, 
    title: 'Near Earth Objects', 
    icon: Asterisk, 
    description: 'Real-time asteroid tracking & data visualization',
    gradient: 'from-red-500 to-orange-500'
  },
  { 
    id: 'search' as ActiveSection, 
    title: 'NASA Archive', 
    icon: Search, 
    description: 'Search millions of space images & videos',
    gradient: 'from-green-500 to-teal-500'
  },
  { 
    id: 'epic' as ActiveSection, 
    title: 'EPIC Earth Images', 
    icon: Globe, 
    description: 'Full-disc Earth images from space',
    gradient: 'from-cyan-500 to-blue-600'
  },
  { 
    id: 'mars' as ActiveSection, 
    title: 'Mars Rover Photos', 
    icon: Camera, 
    description: 'Stunning images from Mars surface',
    gradient: 'from-red-600 to-pink-500'
  },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'apod':
        return <APODSection />;
      case 'neo':
        return <NEOSection />;
      case 'search':
        return <SearchSection />;
      case 'epic':
        return <EPICSection />;
      case 'mars':
        return <MarsRoverSection />;
      default:
        return (
          <div className="text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="relative">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
                  Cosmic Lens
                </h1>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-4 -right-4 text-4xl"
                >
                  ✨
                </motion.div>
              </div>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Explore the universe through NASA&apos;s eyes. Discover breathtaking daily astronomy pictures, 
                track near-Earth asteroids with interactive data visualization, and search through NASA&apos;s 
                vast archive of space imagery.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className="group cursor-pointer"
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative overflow-hidden rounded-2xl p-8 h-80 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${section.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-full h-full text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {section.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {section.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                          <span>Explore</span>
                          <motion.div
                            className="ml-2"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16"
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">🌟</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Daily Discoveries</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fresh space imagery updated daily</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🎯</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Real-time Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live asteroid tracking & visualization</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🔍</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Vast Archive</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Millions of space images & videos</p>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSection('home')}
              className="flex items-center space-x-3 group"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
              >
                <Rocket className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cosmic Lens
              </span>
            </button>

            <nav className="hidden md:flex items-center space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    activeSection === section.id
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>

            {activeSection !== 'home' && (
              <button
                onClick={() => setActiveSection('home')}
                className="md:hidden px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium"
              >
                Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>

      {/* Floating particles effect */}
      {isClient && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
              animate={{
                y: [-20, -100],
                x: [0, Math.random() * 100 - 50],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
