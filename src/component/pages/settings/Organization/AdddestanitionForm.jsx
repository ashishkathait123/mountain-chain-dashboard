import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const DestinationForm = ({ onSuccess }) => {
  const [destinations, setDestinations] = useState([
    { id: Date.now(), destinationName: '', shortName: '', currency: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDestination = () => {
    setDestinations([
      ...destinations,
      { id: Date.now(), destinationName: '', shortName: '', currency: '' },
    ]);
    toast.info('Added new destination field');
  };

  const removeDestination = (id) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((dest) => dest.id !== id));
      toast.info('Removed destination field');
    } else {
      toast.warning('You must have at least one destination');
    }
  };

  const handleChange = (id, field, value) => {
    setDestinations(
      destinations.map((dest) =>
        dest.id === id ? { ...dest, [field]: value } : dest
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emptyFields = destinations.some(
      (dest) => !dest.destinationName.trim() || !dest.shortName.trim() || !dest.currency.toString().trim()
    );

    if (emptyFields) {
      toast.error('Please fill all fields for all destinations');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token available. Please log in.');
        setIsSubmitting(false);
        return;
      }

      // Prepare data in the correct format for API
      const apiData = {
        destinations: destinations.map(dest => ({
          destinationName: dest.destinationName,
          shortName: dest.shortName,
          currency: dest.currency
        }))
      };

      const response = await axios.post(
        'https://mountain-chain.onrender.com/mountainchain/api/destination/add-destinations',
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('All destinations saved successfully!');
        if (onSuccess) onSuccess();
      } else {
        const created = response.data.createdData?.map((d) => d.destinationName) || [];
        const existing = response.data.message
          ?.match(/The following destinations already exist: (.*)/i)?.[1]
          ?.split(', ')
          ?.filter(Boolean) || [];

        if (created.length > 0) {
          toast.success(`Successfully created: ${created.join(', ')}`);
        }
        if (existing.length > 0) {
          toast.error(`Failed to create: ${existing.join(', ')} (already exist)`);
        }
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error saving destinations:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      toast.error(`Failed to save destinations: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-800 mb-6"
      >
        New Destination
      </motion.h1>

      <form onSubmit={handleSubmit}>
        <AnimatePresence>
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-6 p-4 bg-gray-50 rounded-lg relative"
            >
              {destinations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDestination(destination.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove destination"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              <div className="mb-4">
                <label
                  htmlFor={`destinationName-${destination.id}`}
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Destination Name
                </label>
                <input
                  id={`destinationName-${destination.id}`}
                  type="text"
                  value={destination.destinationName}
                  onChange={(e) => handleChange(destination.id, 'destinationName', e.target.value)}
                  placeholder="Enter destination name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`shortName-${destination.id}`}
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Short Name
                </label>
                <input
                  id={`shortName-${destination.id}`}
                  type="text"
                  value={destination.shortName}
                  onChange={(e) => handleChange(destination.id, 'shortName', e.target.value)}
                  placeholder="Enter short code (e.g. MP)"
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for deploying this destination's ports app
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`currency-${destination.id}`}
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Currency Amount
                </label>
                <input
                  id={`currency-${destination.id}`}
                  type="number"
                  value={destination.currency}
                  onChange={(e) => handleChange(destination.id, 'currency', e.target.value)}
                  placeholder="Enter currency amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                  min="0"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default currency amount for this destination
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <motion.button
            type="button"
            onClick={addDestination}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add More
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default DestinationForm;