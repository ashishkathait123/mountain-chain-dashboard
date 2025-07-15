import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const TripSourceForm = ({  handleCloseAddUserModal }) => {
	const token = sessionStorage.getItem('token')
  const [editForm, setEditForm] = useState({
    type: 'Direct',
    companyName: '',
    shortName: '',
    tripTags: '',
    contactName: '',
    contactEmail: '',
    phoneNumbers: [],
    street: '',
    area: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    billingName: '',
    billingDetails: ''
  });

const handleEditSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!editForm.companyName || !editForm.shortName) {
    toast.error('Company Name and Short Name are required');
    return;
  }

  try {
    const url = 'https://mountain-chain.onrender.com/mountainchain/api/destination/create-trip-sourse';
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    const requestBody = {
      type: editForm.type,
      companyName: editForm.companyName,
      shortName: editForm.shortName,
      tripTags: editForm.tripTags || '',
      contactName: editForm.contactName || '',
      contactEmail: editForm.contactEmail || '',
      phoneNumbers: editForm.phoneNumbers.length > 0 ? editForm.phoneNumbers : [],
      street: editForm.street || '',
      area: editForm.area || '',
      city: editForm.city || '',
      state: editForm.state || '',
      country: editForm.country || '',
      pinCode: editForm.pinCode || '',
      billingName: editForm.billingName || '',
      billingDetails: editForm.billingDetails || '',
    };

    console.log('Request URL:', url);
    console.log('Request Headers:', headers);
    console.log('Request Body:', requestBody);

    const response = await axios.post(url, requestBody, { headers });
    console.log('Response:', response.data); // Log only response.data for clarity

    if (response.status === 201 || (response.data && response.data.success)) { // Match API's success field
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Trip source created successfully",
        icon: "success",
      });
      setEditForm({
        type: 'Direct',
        companyName: '',
        shortName: '',
        tripTags: '',
        contactName: '',
        contactEmail: '',
        phoneNumbers: [],
        street: '',
        area: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
        billingName: '',
        billingDetails: ''
      });
      if (handleCloseAddUserModal) handleCloseAddUserModal();
    } else {
      throw new Error('Unexpected response from server');
    }
  } catch (error) {
    console.error("Error creating trip source:", error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create trip source';
    toast.error(errorMessage);
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-900 font-sans mb-8">Trip Source Form</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 font-sans">Create Trip Source</h3>
          <button
            onClick={() => {
              setEditForm({
                type: 'Direct',
                companyName: '',
                shortName: '',
                tripTags: '',
                contactName: '',
                contactEmail: '',
                phoneNumbers: [],
                street: '',
                area: '',
                city: '',
                state: '',
                country: '',
                pinCode: '',
                billingName: '',
                billingDetails: ''
              });
              if (handleCloseAddUserModal) handleCloseAddUserModal();
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="space-y-8">
          {/* Source Type Toggle */}
          <div className="flex space-x-4 mb-8">
            <motion.button
              type="button"
              onClick={() => setEditForm({ ...editForm, type: 'Direct' })}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-4 px-6 rounded-lg transition-all font-medium text-base ${editForm.type === 'Direct' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex flex-col items-center">
                <span>Direct</span>
                <span className="text-sm opacity-80 mt-1">Website/Referrals/Ads</span>
              </div>
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => setEditForm({ ...editForm, type: 'B2B' })}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-4 px-6 rounded-lg transition-all font-medium text-base ${editForm.type === 'B2B' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex flex-col items-center">
                <span>B2B</span>
                <span className="text-sm opacity-80 mt-1">Agent/Marketplace</span>
              </div>
            </motion.button>
          </div>

          {/* Dynamic Description */}
          <motion.div
            key={editForm.type}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8 p-5 bg-blue-50 rounded-lg border border-blue-100"
          >
            <p className="text-base text-blue-800 font-sans">
              {editForm.type === 'Direct' ? (
                <>
                  <span className="font-semibold">Basic Details:</span> Provide basic details such as name and a short name. Leads from these sources are received directly or via portal but they don't act as agent/intermediator after lead generation. All the accounting should be managed for Guest only. Ex: Direct Call / WhatsApp / Email, Website / Landing Pages, Referrals, TripCrafters etc.
                </>
              ) : (
                <>
                  <span className="font-semibold">Basic Details:</span> Provide basic details such as name and a short name. The source provides leads directly or via an Online Marketplace. Accounting should be managed for both guest and the source. The source acts as an agent/intermediator till the end of trip. Ex: ABC Holidays, Travel Triangle, Thrillophilia etc.
                </>
              )}
            </p>
          </motion.div>

          {/* Form Fields in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Agency/Company Full Name *</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Short Name *</label>
                <input
                  type="text"
                  value={editForm.shortName}
                  onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                  className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  required
                />
              </div>

              {editForm.type === 'B2B' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Trip Source Tag</label>
                    <input
                      type="text"
                      value={editForm.tripTags}
                      onChange={(e) => setEditForm({ ...editForm, tripTags: e.target.value })}
                      className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={editForm.contactName}
                      onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                      className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Only for B2B */}
            {editForm.type === 'B2B' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Phone Numbers</label>
                  <input
                    type="text"
                    value={editForm.phoneNumbers.join(', ')}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      phoneNumbers: e.target.value.split(',').map(num => num.trim()) 
                    })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                    placeholder="Comma separated numbers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Billing Name</label>
                  <input
                    type="text"
                    value={editForm.billingName}
                    onChange={(e) => setEditForm({ ...editForm, billingName: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
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
              className="mt-6 space-y-6"
            >
              <h4 className="text-lg font-medium text-gray-700 font-sans border-b pb-2">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Street</label>
                  <input
                    type="text"
                    value={editForm.street}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Area</label>
                  <input
                    type="text"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">Pin Code</label>
                  <input
                    type="text"
                    value={editForm.pinCode}
                    onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-base"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Form Actions */}
          <div className="mt-10 flex justify-end space-x-4">
            <motion.button
              type="button"
              onClick={() => {
                setEditForm({
                  type: 'Direct',
                  companyName: '',
                  shortName: '',
                  tripTags: '',
                  contactName: '',
                  contactEmail: '',
                  phoneNumbers: [],
                  street: '',
                  area: '',
                  city: '',
                  state: '',
                  country: '',
                  pinCode: '',
                  billingName: '',
                  billingDetails: ''
                });
                if (handleCloseAddUserModal) handleCloseAddUserModal();
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-sans text-base hover:bg-gray-50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2 bg-blue-600 text-white font-sans text-base rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!editForm.companyName || !editForm.shortName}
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripSourceForm;