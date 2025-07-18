import React, { useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPlus, FiTrash2, FiStar, FiMapPin, FiClock, FiUsers, FiCreditCard, FiImage } from 'react-icons/fi';
import Select from 'react-select';
import MealPlansSection from "./Meal";

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
    phoneNumbers: [],
    emails: [],
    meals: [],
    rooms: [{
      roomTypes: [],
      allowedExtraBeds: 1,
      AWEB: 2000,
      CWEB: 1500,
      CNB: 1000,
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
  const [selectedMeals, setSelectedMeals] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealChange = (selectedOptions) => {
    const meals = selectedOptions.map(option => option.value);
    setFormData(prev => ({ ...prev, meals }));
    setSelectedMeals(selectedOptions);
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
          CNB: 1000,
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

      const response = await axios.post(
        'https://mountain-chain.onrender.com/mountainchain/api/hotel/addhotel',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  console.log("Success Response:", response);

      toast.success('Hotel added successfully!');
      setFormData({
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
          CNB: 1000,
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
      setSelectedMeals([]);
console.log("Submitting hotel data:",formData);

    }
     catch (error) {
      console.error('Error adding hotel:', error);
      toast.error(error.response?.data?.message || 'Failed to add hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900">
            Add New Hotel
          </h1>
          <p className="mt-2 text-gray-500">
            Complete the form to register your property
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2 flex items-center">
              <FiStar className="mr-2 text-gray-500" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating*</label>
                <select
                  name="stars"
                  value={formData.stars}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2 flex items-center">
              <FiMapPin className="mr-2 text-gray-500" /> Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location*</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Meal Plans */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2">
              Meal Plans
            </h2>
            <MealPlansSection 
              selectedMeals={selectedMeals}
              onMealChange={handleMealChange}
            />
          </div>

          {/* Room Types */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2">
              Room Types & Pricing
            </h2>
            {formData.rooms.map((room, index) => (
              <div key={index} className="space-y-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Types*</label>
                    <select
                      multiple
                      value={room.roomTypes}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        handleRoomTypeChange(index, 'roomTypes', options);
                      }}
                      required
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm h-32"
                    >
                      {ROOM_TYPES_ENUM.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Extra Beds</label>
                      <input
                        type="number"
                        value={room.allowedExtraBeds}
                        onChange={(e) => handleRoomTypeChange(index, 'allowedExtraBeds', parseInt(e.target.value))}
                        min="0"
                        className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                      <input
                        type="number"
                        value={room.numberOfRooms}
                        onChange={(e) => handleRoomTypeChange(index, 'numberOfRooms', parseInt(e.target.value))}
                        min="1"
                        className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adult With Extra Bed (AWEB)</label>
                    <div className="relative">
                      <span className="absolute left-0 bottom-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={room.AWEB}
                        onChange={(e) => handleRoomTypeChange(index, 'AWEB', parseInt(e.target.value))}
                        min="0"
                        className="w-full pl-4 px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Child With Extra Bed (CWEB)</label>
                    <div className="relative">
                      <span className="absolute left-0 bottom-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={room.CWEB}
                        onChange={(e) => handleRoomTypeChange(index, 'CWEB', parseInt(e.target.value))}
                        min="0"
                        className="w-full pl-4 px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Child No Bed (CNB)</label>
                    <div className="relative">
                      <span className="absolute left-0 bottom-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={room.CNB}
                        onChange={(e) => handleRoomTypeChange(index, 'CNB', parseInt(e.target.value))}
                        min="0"
                        className="w-full pl-4 px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                {index > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
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
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FiPlus className="mr-1" /> Add Another Room Type
            </button>
          </div>

          {/* Hotel Operations */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2 flex items-center">
              <FiClock className="mr-2 text-gray-500" /> Hotel Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checkin Time*</label>
                <input
                  type="text"
                  name="checkinTime"
                  value={formData.checkinTime}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checkout Time*</label>
                <input
                  type="text"
                  name="checkoutTime"
                  value={formData.checkoutTime}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2 flex items-center">
              <FiUsers className="mr-2 text-gray-500" /> Policies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Child Age*</label>
                <input
                  type="number"
                  name="childrenAgeRangeMin"
                  value={formData.childrenAgeRangeMin}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Child Age*</label>
                <input
                  type="number"
                  name="childrenAgeRangeMax"
                  value={formData.childrenAgeRangeMax}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Payment & Media */}
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-800 border-b pb-2 flex items-center">
              <FiCreditCard className="mr-2 text-gray-500" /> Payment & Media
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Preference</label>
                <select
                  name="paymentPreference"
                  value={formData.paymentPreference}
                  onChange={handleChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                >
                  <option value="">Select Payment Preference</option>
                  {PAYMENT_ENUM.map(payment => (
                    <option key={payment} value={payment}>{payment}</option>
                  ))}
                </select>
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
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:ring-0 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Save Hotel Details'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHotel;