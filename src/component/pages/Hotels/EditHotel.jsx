import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPlus, FiTrash2, FiStar, FiMapPin, FiClock, FiUsers, FiCreditCard, FiImage } from 'react-icons/fi';
import Select from 'react-select';
import MealPlansSection from "./Meal";
import { ToastContainer } from 'react-toastify';

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    groupName: "",
    stars: 4,
    location: "",
    state: "",
    city: "",
    county: "",
    zipcode: "",
    phoneNumbers: [],
    emails: [],
    meals: [],
    rooms: [{
      roomTypes: [],
      allowedExtraBeds: 1,
      AWEB: 2000,
      CWEB: 1500,
      CWoEB: 1000,
      BasePrice: 2800,
      numberOfRooms: 10
    }],
    checkinTime: "12:00 PM",
    checkoutTime: "10:00 AM",
    childrenAgeRangeMin: 5,
    childrenAgeRangeMax: 12,
    tripDestinations: [],
    paymentPreference: "",
    hotelImagesLink: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);

  const ROOM_TYPES_ENUM = [
    "AC Deluxe Tent", "camp", "Club Class", "Club Deluxe", "Club Executive",
    "Club House (4 Person)", "Club Room", "Cottage", "Cottage Room",
    "Courtyard Executive Room", "Courtyard Family Suite", "Courtyard Premium Suite",
    "Deluxe", "Deluxe (Non Balcony)", "Deluxe (NON VIEW)", "Deluxe double room",
    "Deluxe Non View", "Deluxe Room", "Deluxe Room (Balcony room)",
    "Deluxe Room (Non Valley Facing)", "Deluxe Room (Non View)", "Deluxe Room AC",
    "Deluxe Room Non AC", "Deluxe Room(Mountain View)", "Deluxe Rooms",
    "Deluxe Tent", "Deluxe With Balcony", "Deluxr Room", "Double Deluxe Room"
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
    "50% on Booking, 50% 30 days before Checkin"
  ];

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(
          `https://mountain-chain.onrender.com/mountainchain/api/hotel/hotels/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const hotel = response.data.data;
        setFormData({
          name: hotel.name,
          groupName: hotel.groupName,
          stars: hotel.stars,
          location: hotel.location,
          state: hotel.state,
          city: hotel.city,
          county: hotel.county,
          zipcode: hotel.zipcode,
          phoneNumbers: hotel.phoneNumbers,
          emails: hotel.emails,
          meals: hotel.meals,
          rooms: hotel.rooms,
          checkinTime: hotel.checkinTime,
          checkoutTime: hotel.checkoutTime,
          childrenAgeRangeMin: hotel.childrenAgeRangeMin,
          childrenAgeRangeMax: hotel.childrenAgeRangeMax,
          tripDestinations: hotel.tripDestinations,
          paymentPreference: hotel.paymentPreference,
          hotelImagesLink: hotel.hotelImagesLink
        });

        setSelectedMeals(hotel.meals.map(meal => ({ value: meal, label: meal })));
        
        // Fetch destinations for the select dropdown
        await fetchDestinations(hotel.tripDestinations);
      } catch (error) {
        console.error('Error fetching hotel:', error);
        toast.error(
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error.response?.data?.message || 'Failed to load hotel details'}
          </div>
        );
        navigate('/hotels');
      } finally {
        setFetching(false);
      }
    };

    const fetchDestinations = async (selectedIds = []) => {
      try {
        setDestinationsLoading(true);
        const token = sessionStorage.getItem('token');
        const response = await axios.get(
          "https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist",
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const allDestinations = response.data.data.map(dest => ({
          value: dest._id,
          label: dest.name
        }));

        setDestinations(allDestinations);

        // Set selected destinations if we have IDs
        if (selectedIds.length > 0) {
          const selected = allDestinations.filter(d => selectedIds.includes(d.value));
          setSelectedDestinations(selected);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setDestinationsLoading(false);
      }
    };

    fetchHotel();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealChange = (selectedOptions) => {
    const meals = selectedOptions.map(option => option.value);
    setFormData(prev => ({ ...prev, meals }));
    setSelectedMeals(selectedOptions);
  };

  const handleDestinationChange = (selectedOptions) => {
    setSelectedDestinations(selectedOptions);
    const destinationIds = selectedOptions.map(option => option.value);
    setFormData(prev => ({ ...prev, tripDestinations: destinationIds }));
  };

  const handleRoomTypeChange = (index, field, value) => {
    const updatedRooms = [...formData.rooms];
    
    if (field === 'roomTypes') {
      updatedRooms[index][field] = Array.isArray(value) ? value : [value];
    } else {
      updatedRooms[index][field] = value;
    }
    
    setFormData(prev => ({ ...prev, rooms: updatedRooms }));
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        {
          roomTypes: [],
          allowedExtraBeds: 1,
          AWEB: 2000,
          CWEB: 1500,
          CWoEB: 1000,
          BasePrice: 2800,
          numberOfRooms: 10
        }
      ]
    }));
  };

  const removeRoom = (index) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms.splice(index, 1);
    setFormData(prev => ({ ...prev, rooms: updatedRooms }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(
        `https://mountain-chain.onrender.com/mountainchain/api/hotel/hotels/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Hotel updated successfully!
        </div>,
        {
          autoClose: 2000,
          onClose: () => navigate(`/hotels/${id}`)
        }
      );
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast.error(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error.response?.data?.message || 'Failed to update hotel'}
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 mb-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Edit Hotel Property
            </h1>
            <p className="mt-2 text-gray-500">
              Update the details for <span className="font-medium text-gray-700">{formData.name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <FiStar className="mr-2 text-blue-500" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating*</label>
                  <select
                    name="stars"
                    value={formData.stars}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Destinations</label>
                  <Select
                    isMulti
                    options={destinations}
                    value={selectedDestinations}
                    onChange={handleDestinationChange}
                    isLoading={destinationsLoading}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select destinations..."
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
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <FiMapPin className="mr-2 text-blue-500" /> Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City*</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State*</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zipcode</label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Meal Plans */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
                Meal Plans
              </h2>
              <MealPlansSection 
                selectedMeals={selectedMeals}
                onMealChange={handleMealChange}
              />
            </div>

            {/* Room Types */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
                Room Types & Pricing
              </h2>
              {formData.rooms.map((room, index) => (
                <div key={index} className="space-y-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room Types*</label>
                      <select
                        multiple
                        value={room.roomTypes}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions, option => option.value);
                          handleRoomTypeChange(index, 'roomTypes', options);
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 h-32"
                      >
                        {ROOM_TYPES_ENUM.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                      {room.roomTypes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {room.roomTypes.map(type => (
                            <span key={type} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Extra Beds</label>
                        <input
                          type="number"
                          value={room.allowedExtraBeds}
                          onChange={(e) => handleRoomTypeChange(index, 'allowedExtraBeds', parseInt(e.target.value))}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms</label>
                        <input
                          type="number"
                          value={room.numberOfRooms}
                          onChange={(e) => handleRoomTypeChange(index, 'numberOfRooms', parseInt(e.target.value))}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adult With Extra Bed (AWEB)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.AWEB}
                          onChange={(e) => handleRoomTypeChange(index, 'AWEB', parseInt(e.target.value))}
                          min="0"
                          className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.BasePrice}
                          onChange={(e) => handleRoomTypeChange(index, 'BasePrice', parseInt(e.target.value))}
                          min="0"
                          className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Child With Extra Bed (CWEB)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.CWEB}
                          onChange={(e) => handleRoomTypeChange(index, 'CWEB', parseInt(e.target.value))}
                          min="0"
                          className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Child No Bed (CWoEB)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">₹</span>
                        </div>
                        <input
                          type="number"
                          value={room.CWoEB}
                          onChange={(e) => handleRoomTypeChange(index, 'CWoEB', parseInt(e.target.value))}
                          min="0"
                          className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  {index > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeRoom(index)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
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
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 mt-4"
              >
                <FiPlus className="mr-1" /> Add Another Room Type
              </button>
            </div>

            {/* Hotel Operations */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <FiClock className="mr-2 text-blue-500" /> Hotel Operations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Checkin Time*</label>
                  <input
                    type="text"
                    name="checkinTime"
                    value={formData.checkinTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Checkout Time*</label>
                  <input
                    type="text"
                    name="checkoutTime"
                    value={formData.checkoutTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <FiUsers className="mr-2 text-blue-500" /> Policies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Child Age*</label>
                  <input
                    type="number"
                    name="childrenAgeRangeMin"
                    value={formData.childrenAgeRangeMin}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Child Age*</label>
                  <input
                    type="number"
                    name="childrenAgeRangeMax"
                    value={formData.childrenAgeRangeMax}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Payment & Media */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <FiCreditCard className="mr-2 text-blue-500" /> Payment & Media
              </h2>
              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Preference</label>
                  <select
                    name="paymentPreference"
                    value={formData.paymentPreference}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
                  >
                    <option value="">Select Payment Preference</option>
                    {PAYMENT_ENUM.map(payment => (
                      <option key={payment} value={payment}>{payment}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiImage className="mr-2" /> Hotel Images Link
                  </label>
                  <input
                    type="text"
                    name="hotelImagesLink"
                    value={formData.hotelImagesLink}
                    onChange={handleChange}
                    placeholder="https://example.com/hotel-gallery"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Hotel Details'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
  );
};

export default EditHotel;