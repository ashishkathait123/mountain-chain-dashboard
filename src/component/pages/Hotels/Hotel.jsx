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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this number
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
    setCurrentPage(1); // Reset to first page when searching
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
  setCurrentPage(1); // Reset to first page when filtering
  let results = hotels;

  // Meal Plans Filter
  if (filters.mealPlans?.length > 0) {
    results = results.filter(hotel =>
      filters.mealPlans.some(plan => hotel.meals.includes(plan))
    );
  }

  // Room Types Filter
  if (filters.roomTypes?.length > 0) {
    results = results.filter(hotel =>
      hotel.rooms?.some(room =>
        filters.roomTypes.some(type => room.roomTypes.includes(type))
      )
    );
  }

  // Check In/Out Time Filter
  if (filters.checkInOut?.trim()) {
    results = results.filter(hotel => {
      const combinedTime = `${hotel.checkinTime} - ${hotel.checkoutTime}`.toLowerCase();
      return combinedTime.includes(filters.checkInOut.toLowerCase());
    });
  }

  // Rate Validity Filter (matching child age range as string)
  if (filters.rateValidity?.trim()) {
    const rateText = filters.rateValidity.replace(/\s/g, '');
    results = results.filter(hotel => {
      const hotelAgeRange = `${hotel.childrenAgeRangeMin}-${hotel.childrenAgeRangeMax}`;
      return hotelAgeRange.includes(rateText);
    });
  }

  // Payment Preference Filter
  if (filters.paymentPreference?.length > 0) {
    results = results.filter(hotel =>
      filters.paymentPreference.includes(hotel.paymentPreference)
    );
  }

  setFilteredHotels(results);
};


  const handleAddNew = () => {
    // Logic to handle adding a new hotel
    console.log("Add new hotel clicked");
  };

  // Get current hotels for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <HotelsHeader 
        onSearch={handleSearch} 
        onFilter={handleFilter} 
        onAddNew={handleAddNew}
      />
      
      <p className="text-gray-600 mb-6">
        Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredHotels.length)} of {filteredHotels.length} Items
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
            {currentHotels.map((hotel) => (
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
        {currentHotels.map((hotel) => (
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

      {/* Pagination */}
      {filteredHotels.length > itemsPerPage && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 border-t border-b ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Hotel;