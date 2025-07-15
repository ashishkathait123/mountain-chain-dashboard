import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PulseLoader } from 'react-spinners';

const AddQuery = () => {
  const [formData, setFormData] = useState({
    querySource: '',
    salesTeam: [''],
    referenceId: '',
    destination: '',
    startDate: '',
    numberOfNights: 1,
    noOfAdults: 1,
    childrenAges: [],
    guestName: '',
    phoneNumbers: [''],
    email: '',
    address: '',
    comments: ''
  });

  const [options, setOptions] = useState({
    querySources: [],
    destinations: [],
    salesTeamMembers: []
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  // Fetch options when component mounts
  useEffect(() => {
const fetchOptions = async () => {
  try {
    const headers = { Authorization: `Bearer ${token}` };
    
    const [sourcesRes, destinationsRes, teamRes] = await Promise.all([
      axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/sourcelist', { headers }),
      axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist', { headers }),
      axios.get('https://mountain-chain.onrender.com/mountainchain/api/getusers', { headers })
    ]);

    // Filter only Sales Person role users
    const salesPersons = teamRes.data.data ? 
      teamRes.data.data.filter(user => user.role === 'Sales Person') : [];

    // Properly handle destinations response
    const destinations = destinationsRes.data?.data || [];

    setOptions({
      querySources: sourcesRes.data.data || [],
      destinations: destinations,
      salesTeamMembers: salesPersons
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    toast.error('Failed to load form options');
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};
    if (token) {
      fetchOptions();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeField = (index, field) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const duration = `${formData.numberOfNights} Night${formData.numberOfNights !== 1 ? 's' : ''}, ${formData.numberOfNights + 1} Day${formData.numberOfNights + 1 !== 1 ? 's' : ''}`;
      
      const payload = {
        ...formData,
        duration,
        salesTeam: formData.salesTeam.filter(id => id),
        childrenAges: formData.childrenAges.map(Number).filter(age => !isNaN(age)),
        phoneNumbers: formData.phoneNumbers.filter(num => num),
        status: 'New',
        createdBy: sessionStorage.getItem('userId')
      };

      const response = await axios.post(
        'https://mountain-chain.onrender.com/mountainchain/api/destination',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Query added successfully!');
      setTimeout(() => navigate('/organization/trips/new-query'), 2000);
    } catch (error) {
      console.error('Error adding query:', error);
      toast.error('Failed to add query: ' + (error.response?.data?.message || 'Please check your inputs'));
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="mb-4">
            <PulseLoader color="#3B82F6" size={15} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Form Data</h2>
          <p className="text-gray-600">Please wait while we prepare the form for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Add New Query</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Query Source */}
          <div className="space-y-1">
           {/* Query Source */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Query Source *</label>
  <select
    name="querySource"
    value={formData.querySource}
    onChange={handleChange}
    className="w-full p-3 text-sm border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    required
  >
    <option value="">Select Query Source</option>
    <option value="direct">Direct</option>
    <option value="reference">Reference</option>
    <option value="test">Test</option>
    {options.querySources.map(source => (
      <option key={source._id} value={source._id}>
        {source.name}
      </option>
    ))}
  </select>
</div>
          </div>
          
          {/* Reference ID */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Reference ID</label>
            <input
              type="text"
              name="referenceId"
              value={formData.referenceId}
              onChange={handleChange}
              className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="REF001"
            />
          </div>
          
          {/* Sales Team */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Sales Team *</label>
            {formData.salesTeam.map((id, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <select
                  value={id}
                  onChange={(e) => handleArrayChange(e, index, 'salesTeam')}
                  className="flex-1 p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">Select Team Member</option>
                  {options.salesTeamMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                {index === formData.salesTeam.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => addField('salesTeam')}
                    className="px-3 py-2 text-sm bg-blue-100  text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeField(index, 'salesTeam')}
                    className="px-3 py-2 text-sm bg-red-100  text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Destination */}
       {/* Destination Dropdown */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Destinations *</label>
  <select
    name="destination"
    value={formData.destination}
    onChange={handleChange}
    className="w-full p-3 text-sm border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    required
  >
    <option value="">Select Destination</option>
    {options.destinations.length > 0 ? (
      options.destinations.map(dest => (
        <option key={dest._id} value={dest._id}>
          {dest.name}
        </option>
      ))
    ) : (
      <option disabled>Loading destinations...</option>
    )}
  </select>
</div>
          
          {/* Start Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
          
          {/* Number of Nights */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">No. of Nights *</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="numberOfNights"
                value={formData.numberOfNights}
                onChange={handleChange}
                min="1"
                className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <span className="text-sm font-medium text-blue-700 whitespace-nowrap bg-blue-50 px-3 py-2 rounded-lg">
                {formData.numberOfNights} Night{formData.numberOfNights !== 1 ? 's' : ''}, {formData.numberOfNights + 1} Day{formData.numberOfNights + 1 !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Number of Adults */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">No. of Adults *</label>
            <input
              type="number"
              name="noOfAdults"
              value={formData.noOfAdults}
              onChange={handleChange}
              min="1"
              className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
          
          {/* Children Ages */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Children Ages</label>
            {formData.childrenAges.map((age, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => handleArrayChange(e, index, 'childrenAges')}
                  className="flex-1 p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Age"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => removeField(index, 'childrenAges')}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('childrenAges')}
              className="mt-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Child
            </button>
          </div>
          
          {/* Guest Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Guest Name *</label>
            <input
              type="text"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ankit Jain"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="guest@example.com"
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Delhi, India"
          />
        </div>

        {/* Phone Numbers */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Phone Number(s) *</label>
          {formData.phoneNumbers.map((num, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div className="flex-1 flex gap-2">
                <select className="w-24 p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                  <option>+91 (IN)</option>
                  <option>+1 (US)</option>
                  <option>+44 (UK)</option>
                  <option>+61 (AU)</option>
                </select>
                <input
                  type="text"
                  value={num}
                  onChange={(e) => handleArrayChange(e, index, 'phoneNumbers')}
                  className="flex-1 p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="9876543210"
                  required
                />
              </div>
              {index === formData.phoneNumbers.length - 1 ? (
                <button
                  type="button"
                  onClick={() => addField('phoneNumbers')}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeField(index, 'phoneNumbers')}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className="w-full p-3 text-sm border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows="3"
            placeholder="Please plan something exciting for kids"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/organization/trips/new-query')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <PulseLoader color="#ffffff" size={8} />
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save Details
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-xs text-gray-500">
        © 2019-2025 Sembank. All rights reserved • v.126.0
      </div>

    </div>
  );
};

export default AddQuery;