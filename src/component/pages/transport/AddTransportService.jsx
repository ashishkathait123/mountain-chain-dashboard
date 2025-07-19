import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CityDropdowns from './CityDropdowns';
import toast from 'react-hot-toast';

const AddTransportService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fromCity: '',
    toCity: '',
    shortCode: '',
    tripDestinations: [],
    serviceName: '',
    serviceCode: '',
    distanceKm: '',
    startTime: '',
    durationMinutes: '',
    itinerary: {
      title: '',
      description: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItineraryChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary,
        [name]: value
      }
    }));
  };

  const handleAddDestination = (destination) => {
    if (destination && !formData.tripDestinations.includes(destination)) {
      setFormData(prev => ({
        ...prev,
        tripDestinations: [...prev.tripDestinations, destination]
      }));
    }
  };

  const handleRemoveDestination = (index) => {
    setFormData(prev => ({
      ...prev,
      tripDestinations: prev.tripDestinations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
  const toastId = toast.loading("Creating service...");

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
       if (!formData.fromCity || !formData.toCity) {
    toast.error("Both start and end cities are required.");
    return;
  }

      const response = await axios.post(
        'https://mountain-chain.onrender.com/mountainchain/api/transport/create',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
        toast.dismiss(toastId);


      if (response.data.success) {
              toast.success("Transport service created successfully!");

        navigate('/transport-Service');
        
      } else {
        throw new Error(response.data.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating transport service:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/transport-Service')}>
            Transport Services
          </span>
          <span className="mx-2">»</span>
          <span className="font-semibold">New</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">New Services</h1>

        <form onSubmit={handleSubmit}>
          {/* Locations Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Locations</h2>
            <p className="text-sm text-gray-500 mb-4">
              Add picture-@to location along with a short code for quick identification.
            </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  {/* Previous/Start City */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Previous/Start City
    </label>
    <CityDropdowns
      value={formData.fromCity}
      onSelect={(value) =>
        setFormData((prev) => ({ ...prev, fromCity: value }))
      }
    />
  </div>

  {/* Tolling/End City */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Tolling/End City
    </label>
    <CityDropdowns
      value={formData.toCity}
      onSelect={(value) =>
        setFormData((prev) => ({ ...prev, toCity: value }))
      }
    />
  </div>
</div>



            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cross-producing heavy work without service
              </label>
              <input
                type="text"
                name="shortCode"
                value={formData.shortCode}
                onChange={handleChange}
                placeholder="Short Code (optional)"
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Destinations
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Trip to search..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDestination(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tripDestinations.map((dest, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {dest}
                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(index)}
                      className="ml-1.5 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">• Cherry Highlighting</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Code Name (optional)
                </label>
                <input
                  type="text"
                  name="serviceCode"
                  value={formData.serviceCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <hr className="my-6 border-gray-200" />

          {/* Signal Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">SIGNAL</h2>
            <p className="text-sm text-gray-500 mb-4">
              We use HTML5 or CSS1 to the service for any unique and non-customer services information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distanceKm"
                  value={formData.distanceKm}
                  onChange={handleChange}
                  placeholder="optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">[Normal]</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Default Data Rate for the service</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (in mins)
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                placeholder="optional"
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </section>

          <hr className="my-6 border-gray-200" />

          {/* Directory Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Directory</h2>
            <p className="text-sm text-gray-500 mb-4">
              We can (optional) provide details for this service. This will allow auditing day-wide schedule in an library when this service is provided to a public.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.itinerary.description}
                onChange={handleItineraryChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <div className="flex space-x-2">
                  <span>Write</span>
                  <span>Preview</span>
                </div>
                <div className="flex space-x-2">
                  <span>H</span>
                  <span>B</span>
                  <span>Z</span>
                  <span>O</span>
                  <span>IE</span>
                  <span>IE</span>
                </div>
              </div>
            </div>
          </section>

          <hr className="my-6 border-gray-200" />

          {/* Summary Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">SUMMARY</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <input
                type="text"
                name="title"
                value={formData.itinerary.title}
                onChange={handleItineraryChange}
                placeholder="[Title]"
                className="w-full px-3 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-medium"
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/transport-Service')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransportService;