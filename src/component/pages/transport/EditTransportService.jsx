import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CityDropdowns from './CityDropdowns';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const EditTransportService = () => {
  const { id } = useParams();
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
    price: '',
    durationMinutes: '',
    itinerary: {
      title: '',
      description: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch service data on component mount
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(
          `https://mountain-chain.onrender.com/mountainchain/api/transport/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setFormData(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch service data');
        }
      } catch (error) {
        console.error('Error fetching service data:', error);
        toast.error(`Error: ${error.message}`);
        navigate('/transport-Service');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id, navigate]);

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
      setIsSubmitting(true);
      const toastId = toast.loading("Updating service...");

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      if (!formData.fromCity || !formData.toCity) {
        toast.error("Both start and end cities are required.");
        return;
      }

      const response = await axios.put(
        `https://mountain-chain.onrender.com/mountainchain/api/transport/update/${id}`,
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
        toast.success("Transport service updated successfully!");
        navigate('/transport-Service');
      } else {
        throw new Error(response.data.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating transport service:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/transport-Service')}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
              >
                <FiArrowLeft className="mr-1" /> Back to Services
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Edit Transport Service</h1>
            </div>
            <div className="text-sm text-gray-500">
              Service ID: {id}
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Locations Section */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-700">Locations</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update pickup and drop locations for this service.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous/Start City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous/Start City*
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
                    Tolling/End City*
                  </label>
                  <CityDropdowns
                    value={formData.toCity}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, toCity: value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Code (optional)
                </label>
                <input
                  type="text"
                  name="shortCode"
                  value={formData.shortCode}
                  onChange={handleChange}
                  placeholder="e.g., DEL-BLR"
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Destinations
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add destination and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDestination(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add destination and press Enter"]');
                      if (input.value) {
                        handleAddDestination(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    <FiPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tripDestinations.map((dest, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {dest}
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(index)}
                        className="ml-1.5 inline-flex text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name*
                  </label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., Express Shuttle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Code (optional)
                  </label>
                  <input
                    type="text"
                    name="serviceCode"
                    value={formData.serviceCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., EXP-001"
                  />
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Schedule Section */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-700">Schedule</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update the timing and duration of the transport service.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="distanceKm"
                      value={formData.distanceKm}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">km</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Price (₹)"
                      className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Price (₹)</span>
                    </div>
                  </div>
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
                    <option value="">Select start time</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <div className="relative rounded-md shadow-sm w-full md:w-1/2">
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">mins</span>
                  </div>
                </div>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <div className="relative rounded-md shadow-sm w-full md:w-1/2">
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                </div>
              </div> */}
            </section>

            <hr className="border-gray-200" />

            {/* Description Section */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-700">Description</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update details about this transport service.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Itinerary Description
                </label>
                <textarea
                  name="description"
                  value={formData.itinerary.description}
                  onChange={handleItineraryChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the service, including any stops, amenities, or special features..."
                />
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Summary Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <input
                  type="text"
                  name="title"
                  value={formData.itinerary.title}
                  onChange={handleItineraryChange}
                  placeholder="Service summary title"
                  className="w-full px-3 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-medium"
                />
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/transport-Service')}
                className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                    Updating...
                  </>
                ) : (
                  'Update Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTransportService;