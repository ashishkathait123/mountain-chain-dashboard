import React, { useState, useEffect} from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import CityDropdowns from './CityDropdowns';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

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
    price: '',
    startTime: '',
    durationMinutes: '',
    itinerary: {
      title: '',
      description: ''
    }

  });

  const [destinations, setDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleDestinationChange = (selectedOptions) => {
    setSelectedDestinations(selectedOptions || []);
    const destinationIds = (selectedOptions || []).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      tripDestinations: destinationIds
    }));
  };

  const handleRemoveDestination = (index) => {
    setFormData(prev => ({
      ...prev,
      tripDestinations: prev.tripDestinations.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setCsvFile(null);
    setFileName('');
  };

// --- NEW: useEffect to fetch destinations ---
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        setDestinationsLoading(true);

        const response = await axios.get(
          "https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          const formattedDestinations = response.data.data.map((dest) => ({
            value: dest._id,
            label: dest.name,
          }));
          setDestinations(formattedDestinations);
        } else {
          toast.error("Failed to load destinations in the expected format.");
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
        toast.error(`Failed to load destinations: ${error.message}`);
      } finally {
        setDestinationsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      setIsUploading(true);
      const toastId = toast.loading("Uploading CSV file...");
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        'https://mountain-chain.onrender.com/mountainchain/api/transport/upload-csv',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.dismiss(toastId);
      
      if (response.data.success) {
        toast.success("Transport services uploaded successfully from CSV!");
        setCsvFile(null);
        setFileName('');
        navigate('/transport-Service');
      } else {
        throw new Error(response.data.message || 'Failed to upload CSV');
      }
    } catch (error) {
      console.error('CSV Upload Error:', error);
      toast.error(`Error uploading CSV: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
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
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                <span 
                  className="hover:text-blue-600 cursor-pointer" 
                  onClick={() => navigate('/transport-Service')}
                >
                  Transport Services
                </span>
                <span className="mx-2">/</span>
                <span className="font-semibold">New Service</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Add Transport Service</h1>
            </div>
            
            {/* CSV Upload Section */}
            <div className="mt-4 sm:mt-0 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <label className="block">
                    <span className="sr-only">Choose CSV file</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </label>
                  {fileName && (
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <span className="truncate">{fileName}</span>
                      <button
                        onClick={removeFile}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCSVUpload}
                  disabled={!csvFile || isUploading}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                    csvFile 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Upload CSV
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Bulk upload transport services via CSV file make sure the trip destinations are correctly formatted which are available in the system.
              </p>
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
                  Add pickup and drop locations along with a short code for quick identification.
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
                <Select
                  isMulti
                  options={destinations}
                  value={selectedDestinations}
                  onChange={handleDestinationChange}
                  isLoading={destinationsLoading}
                  isDisabled={destinationsLoading}
                  placeholder="Select destinations..."
                  noOptionsMessage={() => "No destinations found"}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
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
                  Configure the timing and duration of the transport service.
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
                      placeholder="Optional"
                      className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
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
            </section>

            <hr className="border-gray-200" />

            {/* Description Section */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-700">Description</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Provide details about this transport service.
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
                className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransportService;