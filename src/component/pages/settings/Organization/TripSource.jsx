import React, { useState, useEffect } from 'react';
import { FiMoreVertical, FiTrash2, FiPlus, FiEyeOff, FiFilter, FiX, FiDownload, FiTag, FiCopy, FiEdit } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const OrganizationTripSources = () => {
  const token = sessionStorage.getItem('token');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    createdBy: '',
    tag: '',
    createdFrom: '',
    createdTo: ''
  });
  const [editForm, setEditForm] = useState({
    type: 'Direct',
    companyName: '',
    shortName: '',
    contactName: '',
    contactEmail: '',
    phoneNumbers: [],
    city: '',
    state: '',
    country: '',
    pinCode: '',
    street: '',
    area: '',
    landmark: '',
    billingName: '',
    billingDetails: '',
    tripTags: ''
  });
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/sourcelist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSources(response.data.data.map(item => ({
          id: item._id,
          name: item.companyName,
          shortName: item.shortName,
          createdBy: item.contactName || 'Unknown',
          createdAt: new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          tag: item.tripTags || '',
          status: 'active',
          ...item
        })));
      } catch (error) {
        console.error('Error fetching trip sources:', error);
        toast.error('Failed to fetch trip sources');
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, [token]);

  const filteredSources = sources.filter(source => {
    return (
      source.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      source.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase()) &&
      (filters.tag === '' || source.tag.toLowerCase().includes(filters.tag.toLowerCase())) &&
      (filters.createdFrom === '' || new Date(source.createdAt) >= new Date(filters.createdFrom)) &&
      (filters.createdTo === '' || new Date(source.createdAt) <= new Date(filters.createdTo))
    );
  });

  const handleEdit = (source) => {
    setEditForm({
      type: source.type || 'Direct',
      companyName: source.companyName || '',
      shortName: source.shortName || '',
      tripTags: source.tripTags || '',
      contactName: source.contactName || '',
      contactEmail: source.contactEmail || '',
      phoneNumbers: Array.isArray(source.phoneNumbers) ? source.phoneNumbers : [],
      street: source.street || '',
      area: source.area || '',
      city: source.city || '',
      state: source.state || '',
      country: source.country || '',
      pinCode: source.pinCode || '',
      billingName: source.billingName || '',
      billingDetails: source.billingDetails || '',
    });
    setShowEditModal(source.id);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const sourceId = showEditModal;
    if (!sourceId) {
      toast.error('No source selected for update');
      return;
    }

    try {
      const url = `https://mountain-chain.onrender.com/mountainchain/api/destination/update-source/${sourceId}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };
      const requestBody = {
        type: editForm.type,
        companyName: editForm.companyName,
        shortName: editForm.shortName,
        tripTags: editForm.tripTags,
        contactName: editForm.contactName,
        contactEmail: editForm.contactEmail,
        phoneNumbers: editForm.phoneNumbers,
        city: editForm.city,
        state: editForm.state,
        country: editForm.country,
        pinCode: editForm.pinCode,
        street: editForm.street,
        area: editForm.area,
        landmark: editForm.landmark,
        billingName: editForm.billingName,
        billingDetails: editForm.billingDetails,
      };

      const response = await axios.put(url, requestBody, { headers }); // Changed to PUT
      console.log('Response:', response);

      if (response.status === 200 || (response.data && !response.data.error)) {
        Swal.fire({
          title: "Success!",
          text: "Trip source updated successfully",
          icon: "success",
        });
        setSources(sources.map(source => 
          source.id === sourceId ? { ...source, ...editForm } : source
        ));
        setShowEditModal(null);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error("Error updating trip source:", error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || "Failed to update trip source");
    }
  };

  const handleQuery = (id) => {
    toast.info(`Querying trip source with ID: ${id}`);
  };

  const handleView = (id) => {
    toast.info(`Viewing trip source with ID: ${id}`);
  };

  const handleTripSourceTags = () => {
    toast.info('Trip Source Tags functionality not implemented');
  };

  const handleMergeDuplicates = () => {
    toast.info('Merge Duplicate Sources functionality not implemented');
  };

  const toggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
    setShowHeaderMenu(false);
  };

  const toggleHeaderMenu = () => {
    setShowHeaderMenu(!showHeaderMenu);
    setShowMenu(null);
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      createdBy: '',
      tag: '',
      createdFrom: '',
      createdTo: ''
    });
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Name', 'Created By', 'Tag', 'Created At'],
      ...filteredSources.map(source => [source.name, source.createdBy, source.tag, source.createdAt])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trip_sources.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trip Sources</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md border border-gray-300"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/organization/tripsource-form')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all shadow-md"
          >
            <FiPlus className="mr-2" />
            Add Destination
          </motion.button>
          <div className="relative">
            <button
              onClick={toggleHeaderMenu}
              className="text-gray-700 hover:text-gray-600 mt-3 focus:outline-none"
            >
              <FiMoreVertical className="h-5 w-5" />
            </button>
            {showHeaderMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="py-1">
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      handleTripSourceTags();
                      setShowHeaderMenu(false);
                    }}
                  >
                    <FiTag className="mr-2" />
                    Trip Source Tags
                  </button>
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      handleMergeDuplicates();
                      setShowHeaderMenu(false);
                    }}
                  >
                    <FiCopy className="mr-2" />
                    Merge Duplicate Sources
                  </button>
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      downloadCSV();
                      setShowHeaderMenu(false);
                    }}
                  >
                    <FiDownload className="mr-2" />
                    Download as CSV/Excel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
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
              <h3 className="text-lg font-medium">Filter Trip Sources</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by name"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">Edit Trip Source</h3>
                  <button
                    onClick={() => setShowEditModal(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6">
                {/* Source Type Toggle */}
                <div className="flex space-x-2 mb-6">
                  <motion.button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'Direct' })}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all ${editForm.type === 'Direct' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">Direct</span>
                      <span className="text-xs opacity-80 mt-1">Website/Referrals/Ads</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'B2B' })}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all ${editForm.type === 'B2B' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">B2B</span>
                      <span className="text-xs opacity-80 mt-1">Agent/Marketplace</span>
                    </div>
                  </motion.button>
                </div>

                {/* Dynamic Description */}
                <motion.div
                  key={editForm.type}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <p className="text-sm text-blue-800">
                    {editForm.type === 'Direct' ? (
                      <>
                        <span className="font-medium">Basic Details:</span> Provide basic details such as name and a short name. Leads from these sources are received directly or via portal but they don't act as agent/intermediator after lead generation. All the accounting should be managed for Guest only. Ex: Direct Call / WhatsApp / Email, Website / Landing Pages, Referrals, TripCrafters etc.
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Basic Details:</span> Provide basic details such as name and a short name. The source provides leads directly or via an Online Marketplace. Accounting should be managed for both guest and the source. The source acts as an agent/intermediator till the end of trip. Ex: ABC Holidays, Travel Triangle, Thrillophilia etc.
                      </>
                    )}
                  </p>
                </motion.div>

                {/* Form Fields in 2-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Agency/Company Full Name *</label>
                      <input
                        type="text"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Name *</label>
                      <input
                        type="text"
                        value={editForm.shortName}
                        onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {editForm.type === 'B2B' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trip Source Tag</label>
                          <input
                            type="text"
                            value={editForm.tripTags}
                            onChange={(e) => setEditForm({ ...editForm, tripTags: e.target.value })}
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Optional"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                          <input
                            type="text"
                            value={editForm.contactName}
                            onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column - Only for B2B */}
                  {editForm.type === 'B2B' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={editForm.contactEmail}
                          onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
                        <input
                          type="text"
                          value={editForm.phoneNumbers.join(', ')}
                          onChange={(e) => setEditForm({ 
                            ...editForm, 
                            phoneNumbers: e.target.value.split(',').map(num => num.trim()) 
                          })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Comma separated numbers"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Name</label>
                        <input
                          type="text"
                          value={editForm.billingName}
                          onChange={(e) => setEditForm({ ...editForm, billingName: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Section - Only for B2B */}
                {editForm.type === 'B2B' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4"
                  >
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                        <input
                          type="text"
                          value={editForm.street}
                          onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                        <input
                          type="text"
                          value={editForm.area}
                          onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                        <input
                          type="text"
                          value={editForm.pinCode}
                          onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={!editForm.companyName || !editForm.shortName}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredSources.length} of {sources.length} items
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSources.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No trip sources found matching your filters
                  </td>
                </tr>
              ) : (
                filteredSources.map((source) => (
                  <React.Fragment key={source.id}>
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={source.status === 'inactive' ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {source.name}
                          {source.status === 'inactive' && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Disabled
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{source.createdAt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.tag && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {source.tag}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button
                          onClick={() => toggleMenu(source.id)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </button>
                        {showMenu === source.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          >
                            <div className="py-1">
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => {
                                  handleView(source.id);
                                  setShowMenu(null);
                                }}
                              >
                                <FiEyeOff className="mr-2" />
                                View
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => {
                                  handleEdit(source);
                                  setShowMenu(null);
                                }}
                              >
                                <FiEdit className="mr-2" />
                                Edit Details
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
    </div>
  );
};

export default OrganizationTripSources;