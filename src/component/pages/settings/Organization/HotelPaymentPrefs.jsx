import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiX,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// 1. CONFIGURE AXIOS FOR AUTHENTICATION
const api = axios.create({
  baseURL: "http://localhost:5500/mountainchain/api",
});

// Use an interceptor to automatically add the auth token to every request
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token'); // Or wherever you store the token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


const OrganizationHotelPaymentPrefs = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPreference, setCurrentPreference] = useState(null);
  const [formData, setFormData] = useState({
    referenceEvent: "Checkin",
    dayOffset: 0,
    amountShare: 0
  });

  // 2. UPDATED API FUNCTIONS USING THE CONFIGURED INSTANCE
  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/payment-preferences'); // Use relative path
      setPreferences(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch preferences";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        // Optional: Handle unauthorized access, e.g., redirect to login
        console.error("Unauthorized access. Redirecting to login...");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "dayOffset" || name === "amountShare" ? parseInt(value) || 0 : value
    });
  };

  const resetForm = () => {
    setFormData({ referenceEvent: "Checkin", dayOffset: 0, amountShare: 0 });
    setCurrentPreference(null);
  };
  
  // This helper function correctly generates the summary for the modal preview
  const generateSummary = () => {
    const { amountShare, dayOffset, referenceEvent } = formData;
    if (!amountShare || amountShare <= 0) return null;
    const daysAbs = Math.abs(dayOffset);
    const dayText = daysAbs === 1 ? "day" : "days";
    const beforeOrAfter = dayOffset < 0 ? "before" : "after";
    let eventText;
    switch (referenceEvent) {
      case 'MonthEndOfCheckout': eventText = 'Month End of Checkout'; break;
      case 'Checkin': eventText = 'Checkin'; break;
      case 'Checkout': eventText = 'Checkout'; break;
      case 'BookingDate': eventText = 'Booking'; break;
      default: eventText = referenceEvent;
    }
    if (dayOffset === 0) return `${amountShare}% on ${eventText} Date`;
    return `${amountShare}% ${daysAbs} ${dayText} ${beforeOrAfter} ${eventText}`;
  };

  const openModal = (preference = null) => {
    if (preference) {
      setCurrentPreference(preference);
      setFormData({
        referenceEvent: preference.referenceEvent,
        dayOffset: preference.dayOffset,
        amountShare: preference.amountShare
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const apiCall = currentPreference
      ? api.put(`/payment-preferences/${currentPreference._id}`, formData)
      : api.post('/payment-preferences', formData);

    try {
      await apiCall;
      toast.success(`Preference ${currentPreference ? 'updated' : 'created'} successfully!`);
      fetchPreferences();
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Operation failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePreference = async (id) => {
    if (!window.confirm("Are you sure you want to delete this preference?")) return;
    setLoading(true);
    try {
      await api.delete(`/payment-preferences/${id}`);
      toast.success("Preference deleted successfully!");
      fetchPreferences(); // Refetch the list
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete preference";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto"> {/* Increased max-width for new layout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hotel Payment Preferences</h1>
            <p className="text-gray-500">Manage payment rules for hotel bookings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition"
          >
            <FiPlus className="mr-2" />
            Add Preference
          </motion.button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 3. UPDATED LIST HEADERS */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Hotels</div>
            <div className="col-span-3">Created By</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {loading && preferences.length === 0 ? (
             <div className="p-4 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>)}</div>
          ) : preferences.length === 0 ? (
            <div className="p-8 text-center">{/* No preferences found UI */}</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {/* 4. UPDATED LIST ITEM RENDERING */}
              {preferences.map((preference) => (
                <motion.li
                  key={preference._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition"
                >
                  <div className="col-span-6 font-medium text-gray-800">
                    {preference.description}
                  </div>
                  <div className="col-span-2 text-center text-gray-600">
                    1 {/* Placeholder for Hotels count as in the image */}
                  </div>
                  <div className="col-span-3 text-sm text-gray-500">
                    {/* Safely access populated user name */}
                    <span className="font-semibold text-gray-700">{preference.createdBy?.name || 'Unknown User'}</span>
                    <span className="block text-xs">
                      on {new Date(preference.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => openModal(preference)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                      title="Edit"
                    ><FiEdit size={16} /></motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => deletePreference(preference._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                      title="Delete"
                    ><FiTrash2 size={16} /></motion.button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Create/Edit Modal (no major changes needed here) */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 text-black">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {currentPreference ? "Edit Preference" : "Add New Preference"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-black">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Event
                    </label>
                    <div className="relative">
                      <select
                        name="referenceEvent"
                        value={formData.referenceEvent}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        required
                      >
                        <option value="Checkin">Check-in Date</option>
                        <option value="Checkout">Check-out Date</option>
                        <option value="BookingDate">Booking Date</option>
                         <option value="MonthEndOfCheckout">Month End of Checkout</option> 
                      </select>
                      <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day Offset
                    </label>
                    <input
                      type="number"
                      name="dayOffset"
                      value={formData.dayOffset}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="-365"
                      max="365"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Negative numbers mean before the event, positive numbers mean after
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Share (%)
                    </label>
                    <input
                      type="number"
                      name="amountShare"
                      value={formData.amountShare}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of total amount to be paid at this time
                    </p>
                  </div>
 {formData.amountShare > 0 && (
      <div className="bg-gray-100 p-4 rounded-lg mt-4">
          <p className="text-sm font-semibold text-gray-500 uppercase">Summary</p>
          <p className="text-lg font-bold text-gray-800">{generateSummary()}</p>
      </div>
  )}
                  <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2" />
                          {currentPreference ? "Update" : "Create"}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrganizationHotelPaymentPrefs;