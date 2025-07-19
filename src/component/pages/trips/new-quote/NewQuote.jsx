import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronRight, FiCalendar, FiClock, FiUsers, FiPlus, FiCopy, FiTrash2 } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';

const NewQuote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [hotelEntries, setHotelEntries] = useState([{ id: 1 }]);
  const [loading, setLoading] = useState(true);
  
  // Sample data structure for hotel entries
  const initialHotelEntry = {
    id: 1,
    selectedNights: [],
    selectedHotel: null,
    mealPlan: '',
    roomType: '',
    numRooms: 1,
    aweb: 0,
    cweb: 0,
    cnb: 0,
    compChild: 'Upto 5y (TC: 3)',
    prices: []
  };

  // Mock trip details - in a real app, this would come from an API
  const mockTripDetails = {
    destination: "Himachal Pradesh",
    startDate: new Date(2025, 9, 1),
    duration: 6,
    nights: 5,
    pax: "4 Adults with 1 Child (3yo)",
    hotels: []
  };

  // Mock hotels data - would come from API in real app
  const mockHotels = [
    { id: 1, name: "Classic Hill", location: "Shimla" },
    { id: 2, name: "Zen Hotel", location: "Manali" },
    { id: 3, name: "Chutambula Resort", location: "Dharamshala" },
    { id: 4, name: "Snow View Retreat", location: "Kufri" },
    { id: 5, name: "Mountain Haven", location: "Dalhousie" }
  ];

  // Mock room types
  const roomTypes = [
    "Deluxe Room",
    "Superior Room",
    "Executive Suite",
    "Family Room",
    "Luxury Villa"
  ];

  // Mock meal plans
  const mealPlans = ["CP", "MAP", "AP", "EP", "BB"];

  // Calculate nights array based on trip start date and duration
  const calculateNights = () => {
    if (!tripDetails) return [];
    
    const nights = [];
    const date = new Date(tripDetails.startDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < tripDetails.nights; i++) {
      const nightDate = new Date(date);
      nightDate.setDate(date.getDate() + i);
      
      nights.push({
        id: i + 1,
        display: `${days[nightDate.getDay()]} ${nightDate.getDate()} ${months[nightDate.getMonth()]}`,
        date: nightDate.toISOString().split('T')[0]
      });
    }
    
    return nights;
  };

  // Fetch hotel prices - in a real app, this would call an API
  const fetchHotelPrices = (hotelId, nights) => {
    // Simulate API call with mock data
    return new Promise(resolve => {
      setTimeout(() => {
        const prices = nights.map(night => ({
          date: night.date,
          display: night.display,
          rate: Math.floor(Math.random() * 5000) + 3000,
          given: 0
        }));
        resolve(prices);
      }, 300);
    });
  };

  // Handle night selection
  const handleNightSelect = (entryId, nightId) => {
    setHotelEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const updatedNights = entry.selectedNights.includes(nightId)
          ? entry.selectedNights.filter(id => id !== nightId)
          : [...entry.selectedNights, nightId];
        
        return { ...entry, selectedNights: updatedNights };
      }
      return entry;
    }));
  };

  // Handle hotel selection
  const handleHotelSelect = async (entryId, hotel) => {
    setHotelEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const nights = calculateNights().filter(n => entry.selectedNights.includes(n.id));
        const newEntry = { ...entry, selectedHotel: hotel };
        
        // Fetch prices when hotel is selected
        if (hotel && nights.length > 0) {
          fetchHotelPrices(hotel.id, nights).then(prices => {
            setHotelEntries(prevEntries => prevEntries.map(e => 
              e.id === entryId ? { ...e, prices } : e
            ));
          });
        }
        
        return newEntry;
      }
      return entry;
    }));
  };

  // Handle price change
  const handlePriceChange = (entryId, date, value) => {
    setHotelEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const updatedPrices = entry.prices.map(price => 
          price.date === date ? { ...price, given: Number(value) } : price
        );
        return { ...entry, prices: updatedPrices };
      }
      return entry;
    }));
  };

  // Add a new hotel entry
  const addHotelEntry = () => {
    setHotelEntries(prev => [
      ...prev,
      { 
        id: Math.max(...prev.map(e => e.id), 0) + 1,
        selectedNights: [],
        selectedHotel: null,
        mealPlan: '',
        roomType: '',
        numRooms: 1,
        aweb: 0,
        cweb: 0,
        cnb: 0,
        compChild: 'Upto 5y (TC: 3)',
        prices: []
      }
    ]);
  };

  // Duplicate hotel entry
  const duplicateHotelEntry = (entryId) => {
    const entryToDuplicate = hotelEntries.find(e => e.id === entryId);
    if (entryToDuplicate) {
      setHotelEntries(prev => [
        ...prev,
        { 
          ...entryToDuplicate,
          id: Math.max(...prev.map(e => e.id), 0) + 1
        }
      ]);
    }
  };

  // Remove hotel entry
  const removeHotelEntry = (entryId) => {
    if (hotelEntries.length > 1) {
      setHotelEntries(prev => prev.filter(e => e.id !== entryId));
    }
  };

  // Initialize component
  useEffect(() => {
    // In a real app, you would fetch trip details by ID
    setLoading(true);
    setTimeout(() => {
      setTripDetails(mockTripDetails);
      setHotels(mockHotels);
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tripDetails) {
    return <div className="p-4 text-center">Trip details not found</div>;
  }

  const nights = calculateNights();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Breadcrumb */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <span 
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => navigate('/queries')}
            >
              Queries
            </span>
            <FiChevronRight className="mx-2" />
            <span 
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => navigate(`/query/${id}`)}
            >
              Query #{id}
            </span>
            <FiChevronRight className="mx-2" />
            <span className="font-semibold">New Quote</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Basic Details</h1>
          <p className="text-sm text-gray-500">
            Please review basic details for this quote. You can edit these details to provide a quote with different configuration, without changing the trip details.
          </p>
        </div>

        {/* Trip Details */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">DESTINATION</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <FiCalendar className="text-gray-500 mr-2" />
                <span className="font-medium">START DATE</span>
              </div>
              <div className="flex items-center mb-2">
                <FiClock className="text-gray-500 mr-2" />
                <span className="font-medium">DURATION</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="text-gray-500 mr-2" />
                <span className="font-medium">PAX</span>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Edit Basic Details
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-lg font-semibold text-gray-800">{tripDetails.destination}</div>
              <div className="mt-2">
                <div>{tripDetails.startDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div className="mt-1">{tripDetails.nights} Nights, {tripDetails.duration} Days</div>
                <div className="mt-1">{tripDetails.pax}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Package Types */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Package Types/Categories: 1 Option
          </h2>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Hotels Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Hotels</h2>
          <p className="text-sm text-gray-500 mb-4">
            Please add hotels details (if included in package) with services provided for each hotels and the selling cost price.
          </p>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="mr-2">☑</span> 
            To speed up the process of adding multiple hotels, use Next Night or Duplicate actions.
          </p>
        </div>

        {/* Hotel Entries */}
        {hotelEntries.map((entry) => (
          <div key={entry.id} className="p-6 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-700 mb-4">Stay Nights</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Hotel Selection */}
              <div className="lg:col-span-2">
                {/* Night Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select night(s)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {nights.map(night => (
                      <button
                        key={night.id}
                        type="button"
                        onClick={() => handleNightSelect(entry.id, night.id)}
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          entry.selectedNights.includes(night.id)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {`${night.id}${night.id === 1 ? 'st' : night.id === 2 ? 'nd' : night.id === 3 ? 'rd' : 'th'} N (${night.display})`}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Hotel Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={entry.selectedHotel?.id || ''}
                      onChange={(e) => {
                        const hotelId = e.target.value;
                        const hotel = hotels.find(h => h.id === Number(hotelId));
                        handleHotelSelect(entry.id, hotel);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a hotel</option>
                      {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} • {hotel.location}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={entry.mealPlan}
                      onChange={(e) => setHotelEntries(prev => 
                        prev.map(e => 
                          e.id === entry.id ? { ...e, mealPlan: e.target.value } : e
                        )
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Meal Plan</option>
                      {mealPlans.map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Room Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={entry.roomType}
                    onChange={(e) => setHotelEntries(prev => 
                      prev.map(e => 
                        e.id === entry.id ? { ...e, roomType: e.target.value } : e
                      )
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Pax/Room */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Pax/room</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-5 gap-4 mb-3">
                      <div className="text-sm font-medium text-gray-500">(WoEB)</div>
                      <div className="text-sm font-medium text-gray-500">No. of rooms</div>
                      <div className="text-sm font-medium text-gray-500">AWEB</div>
                      <div className="text-sm font-medium text-gray-500">CWEB</div>
                      <div className="text-sm font-medium text-gray-500">CNB</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-sm text-gray-700">Without Extra Bed</div>
                      <input
                        type="number"
                        min="1"
                        value={entry.numRooms}
                        onChange={(e) => setHotelEntries(prev => 
                          prev.map(e => 
                            e.id === entry.id ? { ...e, numRooms: Number(e.target.value) } : e
                          )
                        )}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        min="0"
                        value={entry.aweb}
                        onChange={(e) => setHotelEntries(prev => 
                          prev.map(e => 
                            e.id === entry.id ? { ...e, aweb: Number(e.target.value) } : e
                          )
                        )}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        min="0"
                        value={entry.cweb}
                        onChange={(e) => setHotelEntries(prev => 
                          prev.map(e => 
                            e.id === entry.id ? { ...e, cweb: Number(e.target.value) } : e
                          )
                        )}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        min="0"
                        value={entry.cnb}
                        onChange={(e) => setHotelEntries(prev => 
                          prev.map(e => 
                            e.id === entry.id ? { ...e, cnb: Number(e.target.value) } : e
                          )
                        )}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Comp Child</div>
                      <div className="text-sm text-gray-700">{entry.compChild}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Prices */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-4">Prices</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-3 gap-2 mb-2 text-sm font-medium text-gray-700">
                    <div>Date</div>
                    <div>Rate</div>
                    <div>Given</div>
                  </div>
                  
                  <div className="space-y-3">
                    {entry.prices.length > 0 ? (
                      entry.prices.map((price) => (
                        <div key={price.date} className="grid grid-cols-3 gap-2">
                          <div className="text-sm text-gray-600">{price.display}</div>
                          <div className="text-sm text-gray-800 font-medium">₹{price.rate}</div>
                          <input
                            type="number"
                            value={price.given}
                            onChange={(e) => handlePriceChange(entry.id, price.date, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Enter price"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-4">
                        {entry.selectedHotel
                          ? "Select nights to see prices"
                          : "Select a hotel to see prices"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => addHotelEntry()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiPlus className="mr-1" />
                Next Night
              </button>
              <button
                type="button"
                onClick={() => duplicateHotelEntry(entry.id)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <FiCopy className="mr-1" />
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => removeHotelEntry(entry.id)}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <FiTrash2 className="mr-1" />
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add Hotel Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={addHotelEntry}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FiPlus className="mr-1" />
            Add Hotel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewQuote;