import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  FiPlus,
  FiTrash2,
  FiStar,
  FiMapPin,
  FiClock,
  FiUsers,
  FiCreditCard,
  FiImage,
  FiUpload,
  FiX
} from "react-icons/fi";
import Select from "react-select";
import MealPlansSection from "./Meal";
import { ToastContainer } from "react-toastify";

const AddHotel = () => {
  const [formData, setFormData] = useState({
    name: "",
    groupName: "",
    stars: 4,
    location: "",
    state: "",
    city: "",
    county: "",
    zipcode: "",
    streetAddress: "",
    locality: "",
    landmark: "",
    phoneNumbers: [],
    emails: [],
    meals: [],
    rooms: [
      {
        roomTypes: [],
        allowedExtraBeds: 1,
        AWEB: 2000,
        CWEB: 1500,
        CWoEB: 1000,
        BasePrice: 2800,
        numberOfRooms: 10,
        personPerRoom: 2,
      },
    ],
    checkinTime: "12:00 PM",
    checkoutTime: "10:00 AM",
    childrenAgeRangeMin: 5,
    childrenAgeRangeMax: 12,
    tripDestinations: [],
    paymentPreference: "",
    hotelImagesLink: "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const ROOM_TYPES_ENUM = [
    "AC Deluxe Tent",
    "camp",
    "Club Class",
    "Club Deluxe",
    "Club Executive",
    "Club House (4 Person)",
    "Club Room",
    "Cottage",
    "Cottage Room",
    "Courtyard Executive Room",
    "Courtyard Family Suite",
    "Courtyard Premium Suite",
    "Deluxe",
    "Deluxe (Non Balcony)",
    "Deluxe (NON VIEW)",
    "Deluxe double room",
    "Deluxe Non View",
    "Deluxe Room",
    "Deluxe Room (Balcony room)",
    "Deluxe Room (Non Valley Facing)",
    "Deluxe Room (Non View)",
    "Deluxe Room AC",
    "Deluxe Room Non AC",
    "Deluxe Room(Mountain View)",
    "Deluxe Rooms",
    "Deluxe Tent",
    "Deluxe With Balcony",
    "Deluxr Room",
    "Double Deluxe Room",
  ];

  const PAYMENT_ENUM = [
    "100% 1 day before Checkout",
    "100% 15 days after Month End of Checkout",
    "100% 7 days after Checkout",
    "100% 7 days after Month End of Checkout",
    "100% 7 days before Checkin",
    "100% on Booking",
    "25% on Booking, 75% 2 days before Checkin",
    "40% on Booking, 60% 7 days before Checkin",
    "50% on Booking, 50% 15 days before Checkin",
    "50% on Booking, 50% 30 days before Checkin",
  ];

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
              "Content-Type": "application/json",
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
          toast.error("Failed to load destinations");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDestinationChange = (selectedOptions) => {
    setSelectedDestinations(selectedOptions);
    const destinationIds = selectedOptions.map((option) => option.value);
    setFormData((prev) => ({ ...prev, tripDestinations: destinationIds }));
  };

  const handleMealChange = (selectedOptions) => {
    const meals = selectedOptions.map((option) => option.value);
    setSelectedMeals(selectedOptions);
    setFormData((prev) => ({ ...prev, meals }));
  };

  const handleRoomTypeChange = (index, field, value) => {
    const updatedRooms = [...formData.rooms];

    if (field === "roomTypes") {
      updatedRooms[index][field] = Array.isArray(value) ? value : [value];
    } else {
      updatedRooms[index][field] = value;
    }

    setFormData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const addRoom = () => {
    setFormData((prev) => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        {
          roomTypes: [],
          allowedExtraBeds: 1,
          AWEB: 2000,
          CWEB: 1500,
          CWoEb: 1000,
          BasePrice: 2800,
          numberOfRooms: 10,
          personPerRoom: 2,
        },
      ],
    }));
  };

  const removeRoom = (index) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms.splice(index, 1);
    setFormData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      setLoading(true);
      const response = await axios.post(
        "https://mountain-chain.onrender.com/mountainchain/api/hotel/upload-hotels-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Hotels uploaded successfully from CSV!</span>
          </div>,
          {
            className: "bg-green-50 text-green-800",
            progressClassName: "bg-green-300",
          }
        );
        setCsvFile(null);
        setFileName("");
        navigate('/hotels');
      } else {
        toast.error(response.data.message || "CSV upload failed.");
      }
    } catch (error) {
      console.error("CSV Upload Error:", error);
      toast.error(
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Error uploading CSV file.</span>
        </div>,
        {
          className: "bg-red-50 text-red-800",
          progressClassName: "bg-red-300",
        }
      );
    } finally {
      setLoading(false);
    }
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
    setFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanedData = {
      ...formData,
      emails: formData.emails.length
        ? formData.emails
        : ["no-email@example.com"],
      phoneNumbers: formData.phoneNumbers.length
        ? formData.phoneNumbers
        : ["0000000000"],
      meals: formData.meals.length ? formData.meals : ["EP"],
      paymentPreference: formData.paymentPreference || "100% on Booking",
      hotelImagesLink:
        formData.hotelImagesLink || "https://via.placeholder.com/400x300",
    };

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      };

      const response = await axios.post(
        "https://mountain-chain.onrender.com/mountainchain/api/hotel/addhotel",
        cleanedData,
        config
      );

      if (response.data.success) {
        toast.success(
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <p className="font-medium">Hotel added successfully!</p>
              <p className="text-sm">Redirecting to hotels list...</p>
            </div>
          </div>,
          {
            className: "bg-green-50 text-green-800",
            progressClassName: "bg-green-300",
            autoClose: 2000,
            onClose: () => navigate('/hotels')
          }
        );
        
        setFormData({
          ...formData,
          name: "",
          groupName: "",
          stars: 4,
          location: "",
          state: "",
          city: "",
          county: "",
          zipcode: "",
          streetAddress: "",
          locality: "",
          landmark: "",
          phoneNumbers: [],
          emails: [],
          meals: [],
          rooms: [
            {
              roomTypes: [],
              allowedExtraBeds: 1,
              personPerRoom: 2,
              AWEB: 2000,
              CWEB: 1500,
              CWoEb: 1000,
              BasePrice: 2800,
              numberOfRooms: 10,
            },
          ],
          checkinTime: "12:00 PM",
          checkoutTime: "10:00 AM",
          childrenAgeRangeMin: 5,
          childrenAgeRangeMax: 12,
          tripDestinations: [],
          paymentPreference: "",
          hotelImagesLink: "",
        });
      } else {
        toast.error(
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Failed to add hotel.</span>
          </div>,
          {
            className: "bg-red-50 text-red-800",
            progressClassName: "bg-red-300",
          }
        );
      }
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast.error(
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Server error while adding hotel.</span>
        </div>,
        {
          className: "bg-red-50 text-red-800",
          progressClassName: "bg-red-300",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Add New Hotel
            </h1>
            <p className="mt-2 text-gray-500">
              Complete the form to register your property
            </p>
          </div>

          {/* Bulk CSV Upload */}
          <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 transition-all duration-300 hover:border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiUpload className="mr-2 text-blue-600" /> Bulk Upload via CSV
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full">
                <label className="block">
                  <span className="sr-only">Choose CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-blue-100 file:to-indigo-100 file:text-blue-700
                      hover:file:bg-gradient-to-r hover:file:from-blue-200 hover:file:to-indigo-200
                      transition-all duration-300"
                  />
                </label>
                {fileName && (
                  <div className="mt-2 flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200">
                    <span className="truncate">{fileName}</span>
                    <button
                      onClick={removeFile}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleCSVUpload}
                disabled={!csvFile || loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                  csvFile
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
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
            <p className="mt-2 text-xs text-gray-500">
              Upload a CSV file with hotel data for bulk processing
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiStar className="mr-2 text-blue-500" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter hotel name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter group name (if applicable)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Star Rating*
                  </label>
                  <div className="relative">
                    <select
                      name="stars"
                      value={formData.stars}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <option key={star} value={star}>
                          {star} Star{star > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Destinations
                  </label>
                  {destinationsLoading ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
                      Loading destinations...
                    </div>
                  ) : (
                    <>
                      <Select
                        isMulti
                        options={destinations}
                        value={selectedDestinations}
                        onChange={handleDestinationChange}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select destinations..."
                        isDisabled={destinationsLoading}
                        noOptionsMessage={() => "No destinations available"}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "42px",
                            borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                            boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                            "&:hover": {
                              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                            },
                            borderRadius: "0.5rem",
                            transition: "all 0.3s ease",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#3b82f6"
                              : state.isFocused
                              ? "#e0e7ff"
                              : "white",
                            color: state.isSelected ? "white" : "#1e293b",
                            "&:active": {
                              backgroundColor: "#3b82f6",
                              color: "white",
                            },
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#e0e7ff",
                            borderRadius: "0.375rem",
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "#3b82f6",
                            fontWeight: "500",
                          }),
                        }}
                      />
                      {selectedDestinations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedDestinations.map((d) => (
                            <span
                              key={d.value}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                            >
                              {d.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiMapPin className="mr-2 text-blue-500" /> Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g. City Center, Beachfront, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State*
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter county (if applicable)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locality
                  </label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter locality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>

            {/* Meal Plans */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Meal Plans
              </h2>
              <MealPlansSection
                selectedMeals={selectedMeals}
                onMealChange={handleMealChange}
              />
            </div>

            {/* Room Types */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Room Types & Pricing
              </h2>
              {formData.rooms.map((room, index) => (
                <div
                  key={index}
                  className="space-y-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Types*
                      </label>
                      <div className="relative">
                        <select
                          multiple
                          value={room.roomTypes}
                          onChange={(e) => {
                            const options = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            handleRoomTypeChange(index, "roomTypes", options);
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 h-32"
                        >
                          {ROOM_TYPES_ENUM.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Hold Ctrl/Cmd to select multiple
                      </p>
                      {room.roomTypes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {room.roomTypes.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-green-100 to-teal-100 text-green-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Allowed Extra Beds
                        </label>
                        <input
                          type="number"
                          value={room.allowedExtraBeds}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "allowedExtraBeds",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Person Per Room
                        </label>
                        <input
                          type="number"
                          value={room.personPerRoom}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "personPerRoom",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Rooms
                        </label>
                        <input
                          type="number"
                          value={room.numberOfRooms}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "numberOfRooms",
                              parseInt(e.target.value)
                            )
                          }
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adult With Extra Bed (AWEB)
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.AWEB}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "AWEB",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">.00</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Price
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.BasePrice}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "BasePrice",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">.00</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child With Extra Bed (CWEB)
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.CWEB}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "CWEB",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">.00</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child No Bed (CWoEb)
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.CWoEb}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "CWoEb",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeRoom(index)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
                      >
                        <FiTrash2 className="mr-1" /> Remove Room Type
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRoom}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                <FiPlus className="mr-1" /> Add Another Room Type
              </button>
            </div>

            {/* Hotel Operations */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiClock className="mr-2 text-blue-500" /> Hotel Operations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checkin Time*
                  </label>
                  <input
                    type="text"
                    name="checkinTime"
                    value={formData.checkinTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g. 12:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checkout Time*
                  </label>
                  <input
                    type="text"
                    name="checkoutTime"
                    value={formData.checkoutTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiUsers className="mr-2 text-blue-500" /> Policies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Child Age*
                  </label>
                  <input
                    type="number"
                    name="childrenAgeRangeMin"
                    value={formData.childrenAgeRangeMin}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Child Age*
                  </label>
                  <input
                    type="number"
                    name="childrenAgeRangeMax"
                    value={formData.childrenAgeRangeMax}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Payment & Media */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiCreditCard className="mr-2 text-blue-500" /> Payment & Media
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Preference
                  </label>
                  <div className="relative">
                    <select
                      name="paymentPreference"
                      value={formData.paymentPreference}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none bg-white"
                    >
                      <option value="">Select Payment Preference</option>
                      {PAYMENT_ENUM.map((payment) => (
                        <option key={payment} value={payment}>
                          {payment}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiImage className="mr-2" /> Hotel Images Link
                  </label>
                  <input
                    type="text"
                    name="hotelImagesLink"
                    value={formData.hotelImagesLink}
                    onChange={handleChange}
                    placeholder="https://example.com/hotel-gallery"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                  {formData.hotelImagesLink && (
                    <div className="mt-2">
                      <a
                        href={formData.hotelImagesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm transition-colors duration-300"
                      >
                        Preview Image Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
              <button
                type="button"
                onClick={() => navigate('/hotels')}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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
                    Processing...
                  </span>
                ) : (
                  "Save Hotel Details"
                )}
              </button>
            </div>
          </form>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastClassName="border border-gray-200 shadow-lg"
          progressStyle={{ height: "3px" }}
        />
      </div>
    </div>
  );
};

export default AddHotel;