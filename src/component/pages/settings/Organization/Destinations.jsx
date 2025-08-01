import React, { useState, useEffect, useCallback } from 'react';
import { FiMoreVertical, FiEyeOff, FiFilter, FiX, FiEdit, FiPlus, FiEye, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Toaster } from 'react-hot-toast';

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

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist');
      const mappedData = response.data.data.map((dest) => ({
        id: dest._id,
        name: dest.name,
        short: dest.shortName,
        currency: dest.currency,
        createdBy: dest.createdBy?.name || 'System',
        status: 'active',
        description: '',
        maxChildAge: '',
        defaultCheckInTime: '',
        defaultCheckOutTime: '',
        aliases: dest.aliases || [],
      }));
      setDestinations(mappedData);
      toast.success('Destinations loaded successfully');
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error(`Failed to load destinations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    try {
      const response = await axios.post(
        `https://mountain-chain.onrender.com/mountainchain/api/destination/update-destination/${selectedDestination}`,
        editFormData
      );
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
      await axios.post(
        `https://mountain-chain.onrender.com/mountainchain/api/destination/update-destination/${id}`,
        { status: newStatus }
      );
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
      createdBy: '',
      status: '',
    });
    toast.success('Filters reset');
  };

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Destinations</h1>
            <p className="text-gray-500 mt-1">Manage your organization's destinations</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <FiFilter className="mr-2" />
              Filters
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/organization/add-destination')}
              className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg shadow hover:shadow-md transition"
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
              className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filter Destinations</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Filter by name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
                  <input
                    type="text"
                    value={filters.short}
                    onChange={(e) => handleFilterChange('short', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Filter by short code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={filters.currency}
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Filter by currency"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <input
                    type="text"
                    value={filters.createdBy}
                    onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Filter by creator"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Reset Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                Showing {filteredDestinations.length} of {destinations.length} destinations
              </span>
              <button 
                onClick={fetchDestinations}
                className="ml-3 text-gray-500 hover:text-blue-600 transition"
                title="Refresh"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>

          {loading && destinations.length === 0 ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 mb-2 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiEye className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No destinations found</h3>
              <p className="text-gray-500 mb-4">
                {Object.values(filters).some(Boolean) 
                  ? "Try adjusting your filters" 
                  : "No destinations available yet"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (Object.values(filters).some(Boolean)) {
                    resetFilters();
                  } else {
                    navigate('/organization/add-destination');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition"
              >
                {Object.values(filters).some(Boolean) ? "Reset Filters" : "Add First Destination"}
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDestinations.map((destination) => (
                    <motion.tr
                      key={destination.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`hover:bg-gray-50 transition ${destination.status === 'inactive' ? 'bg-gray-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {destination.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {destination.name}
                              {destination.status === 'inactive' && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {destination.aliases.slice(0, 2).join(', ')}
                              {destination.aliases.length > 2 && '...'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {destination.short}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {destination.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {destination.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button
                          onClick={(e) => toggleMenu(destination.id, e)}
                          className="text-gray-400 hover:text-gray-600 transition"
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </button>
                        <AnimatePresence>
                          {showMenu === destination.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                              <div className="py-1">
                                <motion.button
                                  whileHover={{ x: 2 }}
                                  onClick={() => {
                                    handleDisable(destination.id, destination.status);
                                    setShowMenu(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition"
                                >
                                  {destination.status === 'active' ? (
                                    <>
                                      <FiEyeOff className="mr-2 text-gray-500" />
                                      Disable
                                    </>
                                  ) : (
                                    <>
                                      <FiEye className="mr-2 text-green-500" />
                                      Enable
                                    </>
                                  )}
                                </motion.button>
                                <motion.button
                                  whileHover={{ x: 2 }}
                                  onClick={() => {
                                    handleEditDestination(destination.id);
                                    setShowMenu(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition"
                                >
                                  <FiEdit className="mr-2 text-blue-500" />
                                  Edit
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {showEditForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}c
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-xl font-semibold text-gray-800">Edit Destination</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FiX size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Code</label>
                    <input
                      type="text"
                      name="short"
                      value={editFormData.short}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <input
                      type="text"
                      name="currency"
                      value={editFormData.currency}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aliases (Regions)</label>
                    <textarea
                      name="aliases"
                      value={editFormData.aliases.join(', ')}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          aliases: e.target.value.split(',').map((item) => item.trim()),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="e.g., Jaipur, Jodhpur, Udaipur"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    Save Changes
                  </motion.button>
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