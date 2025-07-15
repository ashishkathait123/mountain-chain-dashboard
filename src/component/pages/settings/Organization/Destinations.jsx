import React, { useState, useEffect, useCallback } from 'react';
import { FiMoreVertical, FiEyeOff, FiFilter, FiX, FiEdit, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash/debounce';

const OrganizationDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    short: '',
    currency: '',
    createdBy: '',
    status: '',
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    short: '',
    currency: '',
    createdBy: '',
    description: '',
    maxChildAge: '',
    defaultCheckInTime: '',
    defaultCheckOutTime: '',
    aliases: [],
  });

  const navigate = useNavigate();

  const debouncedSetFilters = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
    }, 300),
    []
  );

  const handleFilterChange = (field, value) => {
    debouncedSetFilters({ ...filters, [field]: value });
  };

  useEffect(() => {
    const fetchDestinations = async (retries = 3, delay = 1000) => {
      try {
        const response = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist');
        if (response.data.error && (!response.data.data || response.data.data.length === 0)) {
          throw new Error(response.data.message || 'API returned an error or empty data');
        }
         console.log('fdgfdg', response)
        const mappedData = response.data.data.map((dest) => ({
          id: dest._id,
          name: dest.name,
          short: dest.shortName,
          currency: dest.currency,
          createdBy: dest.createdBy.name,
          status: 'active',
          image: '',
          description: '',
          maxChildAge: '',
          defaultCheckInTime: '',
          defaultCheckOutTime: '',
          aliases: dest.aliases || [],
        }));
        setDestinations(mappedData);
        toast.success('Destinations loaded successfully');
      } catch (error) {
        if (retries > 0 && error.code === 'ERR_NETWORK') {
          console.warn(`Retrying... (${retries} attempts left)`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchDestinations(retries - 1, delay * 2);
        }
        console.error('Error fetching destinations:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
        });
        toast.error(`Failed to load destinations: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const handleEditDestination = (id) => {
    const destination = destinations.find((dest) => dest.id === id);
    if (destination) {
      setSelectedDestination(id);
      setEditFormData({
        name: destination.name,
        short: destination.short,
        currency: destination.currency,
        aliases: destination.aliases || [],
      });
      setShowEditForm(true);
      setShowMenu(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDestination) return;

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token available. Please log in.');
      return;
    }

    try {
      const response = await axios.post(
        `https://mountain-chain.onrender.com/mountainchain/api/destination/update-destination/${selectedDestination}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to update destination');
      }
      setDestinations(
        destinations.map((dest) =>
          dest.id === selectedDestination ? { ...dest, ...editFormData } : dest
        )
      );
      toast.success('Destination updated successfully');
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating destination:', error);
      toast.error(`Failed to update destination: ${error.message}`);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'aliases') {
      setEditFormData((prev) => ({
        ...prev,
        aliases: value.split(',').map((item) => item.trim()),
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const filteredDestinations = destinations.filter((destination) =>
    destination.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    destination.short.toLowerCase().includes(filters.short.toLowerCase()) &&
    destination.currency.toLowerCase().includes(filters.currency.toLowerCase()) &&
    destination.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase()) &&
    (filters.status === '' || destination.status === filters.status)
  );

  const handleDisable = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'enabled' : 'disabled';
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token available. Please log in.');
        return;
      }
      const response = await axios.post(
        `https://mountain-chain.onrender.com/mountainchain/api/destination/update-destination/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('fdgfdg', response)
      if (response.data.error) {
        throw new Error(response.data.message || `Failed to ${action} destination`);
      }
      setDestinations(
        destinations.map((dest) => (dest.id === id ? { ...dest, status: newStatus } : dest))
      );
      toast.success(`Destination ${action} successfully`);
    } catch (error) {
      console.error('Error updating destination status:', error);
      toast.error(`Failed to ${action} destination: ${error.message}`);
    }
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setShowMenu(showMenu === id ? null : id);
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      short: '',
      currency: '',
    });
    toast.info('Filters reset');
  };

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Destinations</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/organization/add-destination')} // Updated route
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black rounded-md transition-all shadow-md"
          >
            <FiPlus className="mr-2" />
            Add Destination
          </motion.button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter Destinations</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Filter by name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
                <input
                  type="text"
                  value={filters.short}
                  onChange={(e) => handleFilterChange('short', e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Filter by short code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={filters.currency}
                  onChange={(e) => handleFilterChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Filter by currency"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  value={filters.createdBy}
                  onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Filter by creator"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border  border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredDestinations.length} of {destinations.length} destinations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredDestinations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No destinations found matching your filters
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((destination) => (
                  <motion.tr
                    key={destination.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={destination.status === 'inactive' ? 'bg-gray-50' : ''}
                  >
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      {destination.image ? (
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {destination.name}
                        {destination.status === 'inactive' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{destination.short}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{destination.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{destination.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={(e) => toggleMenu(destination.id, e)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      >
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                      <AnimatePresence>
                        {showMenu === destination.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          >
                            <div className="py-1">
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                                onClick={() => {
                                  handleDisable(destination.id, destination.status);
                                  setShowMenu(null);
                                }}
                              >
                                <FiEyeOff className="mr-2" />
                                {destination.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                                onClick={() => {
                                  handleEditDestination(destination.id);
                                  setShowMenu(null);
                                }}
                              >
                                <FiEdit className="mr-2" />
                                Edit
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Popup */}
      <AnimatePresence>
        {showEditForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEditForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Edit Destination</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
                      <input
                        type="text"
                        name="short"
                        value={editFormData.short}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <input
                        type="text"
                        name="currency"
                        value={editFormData.currency}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aliases (Regions)</label>
                  <textarea
                    name="aliases"
                    value={editFormData.aliases.join(', ')}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        aliases: e.target.value.split(',').map((item) => item.trim()),
                      }))
                    }
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="e.g., Jaipur, Jodhpur, Udaipur"
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationDestinations;