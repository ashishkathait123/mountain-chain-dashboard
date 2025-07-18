import React, { useState, useEffect } from "react";
import axios from "axios";
import HotelsHeader from "./HotelsHeader";
import { useNavigate } from "react-router-dom";

const Hotel = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const navigate = useNavigate();

const handleHotelClick = (hotelId) => {
  navigate(`/hotels/${hotelId}`);
};

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get(
          "https://mountain-chain.onrender.com/mountainchain/api/hotel/gethotels"
        );
        setHotels(response.data.hotels);
        setFilteredHotels(response.data.hotels);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredHotels(hotels);
      return;
    }
    const results = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(term.toLowerCase()) ||
      hotel.location.toLowerCase().includes(term.toLowerCase()) ||
      hotel.city.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredHotels(results);
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
    let results = hotels;
    
    if (filters.mealPlans && filters.mealPlans.length > 0) {
      results = results.filter(hotel =>
        filters.mealPlans.some(plan => hotel.meals.includes(plan))
      );
    }
    
    if (filters.roomTypes && filters.roomTypes.length > 0) {
      results = results.filter(hotel =>
        hotel.rooms.some(room =>
          filters.roomTypes.some(type => room.roomTypes.includes(type))
      ));
    }
    
    if (filters.starRating && filters.starRating.length > 0) {
      results = results.filter(hotel =>
        filters.starRating.includes(hotel.stars.toString())
      );
    }
    
    if (filters.location) {
      results = results.filter(hotel =>
        hotel.location.includes(filters.location) ||
        hotel.city.includes(filters.location)
      );
    }
    
    setFilteredHotels(results);
  };

  const handleAddNew = () => {
    // Logic to handle adding a new hotel
    console.log("Add new hotel clicked");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading hotels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Error loading hotels: {error}</p>
      </div>
    );
  }

  const displayHotels = filteredHotels.length > 0 ? filteredHotels : hotels;

  return (
    <div className="container mx-auto px-4 py-8">
      <HotelsHeader 
        onSearch={handleSearch} 
        onFilter={handleFilter} 
        onAddNew={handleAddNew}
      />
      
      <p className="text-gray-600 mb-6">
        Showing 1 - {displayHotels.length} of {displayHotels.length} Items
      </p>
      
     {/* Desktop Table View */}
<div className="hidden lg:block overflow-x-auto">
  <table className="min-w-full bg-white border rounded-lg overflow-hidden">
    <thead className="bg-gray-100">
      <tr>
        <th className="py-3 px-4 text-left">Hotel Name</th>
        <th className="py-3 px-4 text-left">Meal Plans</th>
        <th className="py-3 px-4 text-left">Room Types</th>
        <th className="py-3 px-4 text-left">Check In/Out</th>
        <th className="py-3 px-4 text-left">Children Age Range</th>
        <th className="py-3 px-4 text-left">Payment Preference</th>
        <th className="py-3 px-4 text-left">Location</th>
      </tr>
    </thead>
    <tbody>
      {displayHotels.map((hotel) => (
        <tr key={hotel._id} className="border-b hover:bg-gray-50">
          <td className="py-3 px-4">
<button
  onClick={() => handleHotelClick(hotel._id)}
  className="text-blue-600 hover:underline font-medium"
>
  {hotel.name}
</button>
            <div className="text-sm text-gray-500">{hotel.groupName}</div>
          </td>
          <td className="py-3 px-4">{hotel.meals.join(" ▪ ")}</td>
          <td className="py-3 px-4">
            {hotel.rooms.map((r) => r.roomTypes.join(", ")).join(" | ")}
          </td>
          <td className="py-3 px-4">
            {hotel.checkinTime} / {hotel.checkoutTime}
          </td>
          <td className="py-3 px-4">
            {hotel.childrenAgeRangeMin}-{hotel.childrenAgeRangeMax} years
          </td>
          <td className="py-3 px-4">{hotel.paymentPreference || "N/A"}</td>
          <td className="py-3 px-4">
            <div>{hotel.location}</div>
            <div className="text-sm text-gray-500">
              {hotel.city}, {hotel.state}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Card View */}
<div className="lg:hidden space-y-4">
  {displayHotels.map((hotel) => (
    <div
      key={hotel._id}
      className="bg-white p-4 rounded-lg shadow border border-gray-200"
    >
<button
  onClick={() => handleHotelClick(hotel._id)}
  className="text-blue-700 font-semibold text-lg hover:underline"
>
  {hotel.name}
</button>
      <p className="text-sm text-gray-600">{hotel.city} • {hotel.rooms?.[0]?.roomTypes?.[0]} • {hotel.groupName}</p>

      <div className="mt-3 text-sm text-gray-800">
        <p className="mb-1">
          🍽 <strong>Meal Plan:</strong> {hotel.meals.join(" • ")}
        </p>
        <p className="mb-1">
          ⏰ <strong>CheckIn/Out:</strong> {hotel.checkinTime} - {hotel.checkoutTime}
        </p>
        <p className="mb-1">
          🛏 <strong>Room Types:</strong> {hotel.rooms.map(r => r.roomTypes.join(", ")).join(" | ")}
        </p>
      </div>

      <hr className="my-3" />

      <div className="flex justify-between text-sm text-gray-700">
        <div>
          📅 <strong>Rate Validity</strong>
          <br />
          <span className="text-xs text-gray-400">--</span>
        </div>
        <div>
          🧒 <strong>Child EB Age</strong>
          <br />
          {hotel.childrenAgeRangeMin}-{hotel.childrenAgeRangeMax}yo
        </div>
      </div>

      <div className="mt-3 text-sm">
        💳 <strong>Payment Preference:</strong>
        <br />
        {hotel.paymentPreference || "N/A"}
      </div>
    </div>
  ))}
</div>

    </div>
  );
};

export default Hotel;