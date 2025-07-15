import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEyeOff, FiEdit, FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const TripList = ({ status, filter, token }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      // console.log('Fetching trips with token:', token); // Debug token
      try {
        const response = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/getallquerys', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log('API Response:', response.data); // Debug response
        // Adjust based on actual API response structure
        const data = response.data.data;
        setTrips(Array.isArray(data) ? data : data ? [data] : []);
      } catch (error) {
        console.error('Error fetching trips:', error.response?.data || error.message);
        toast.error('Failed to fetch trips: ' + (error.response?.data?.message || 'Check console for details'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [token]);

  const filteredTrips = trips
    .filter(trip => trip.status === status)
    .filter(trip =>
      trip.guestName?.toLowerCase().includes(filter.toLowerCase()) ||
      trip.referenceId?.toLowerCase().includes(filter.toLowerCase()) ||
      new Date(trip.startDate)?.toLocaleDateString().includes(filter)
    );

  const toggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  const handleView = (id) => {
    navigate(`/organization/trips/${status.toLowerCase().replace(/ /g, '-')}/view/${id}`);
    setShowMenu(null);
  };

  const handleEdit = (id) => {
    navigate(`/organization/trips/${status.toLowerCase().replace(/ /g, '-')}/edit/${id}`);
    setShowMenu(null);
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ToastContainer />
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">{status} Trips</h1>
        <p className="text-sm text-gray-600">Showing {filteredTrips.length} of {trips.length} items</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No trips found matching the filter or status.
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip) => (
                <React.Fragment key={trip._id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trip.guestName}</div>
                      <div className="text-xs text-gray-500">{new Date(trip.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.referenceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trip.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() => toggleMenu(trip._id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                      {showMenu === trip._id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <div className="py-1">
                            <button
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              onClick={() => handleView(trip._id)}
                            >
                              <FiEyeOff className="mr-2" />
                              View
                            </button>
                            <button
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              onClick={() => handleEdit(trip._id)}
                            >
                              <FiEdit className="mr-2" />
                              Edit
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </td>
                  </motion.tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripList;