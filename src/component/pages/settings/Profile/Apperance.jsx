import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Appearance = () => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [density, setDensity] = useState('normal');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 bg-white rounded-lg border border-gray-200 p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 mb-6">Appearance</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((option) => (
              <button
                key={option}
                onClick={() => setTheme(option)}
                className={`p-3 border rounded-md text-center capitalize ${
                  theme === option
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Font Size</h3>
          <div className="grid grid-cols-3 gap-4">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`p-3 border rounded-md text-center capitalize ${
                  fontSize === size
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Density</h3>
          <div className="grid grid-cols-3 gap-4">
            {['compact', 'normal', 'comfortable'].map((dense) => (
              <button
                key={dense}
                onClick={() => setDensity(dense)}
                className={`p-3 border rounded-md text-center capitalize ${
                  density === dense
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {dense}
              </button>
            ))}
          </div>
        </div>

        <button className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200">
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
};

export default Appearance;