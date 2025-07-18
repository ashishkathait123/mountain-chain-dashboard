import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const HotelsHeader = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState({
    mealPlans: [],
    roomTypes: [],
    checkInOut: '',
    rateValidity: '',
    paymentPreference: []
  });

  const MEAL_PLANS = ['AP', 'BB', 'CP', 'EP', 'FB', 'HB', 'MAP', 'RO'];
  const ROOM_TYPES = [
    "AC Deluxe Tent", "camp", "Club Class", "Club Deluxe", "Club Executive",
    "Club House (4 Person)", "Club Room", "Cottage", "Cottage Room",
    "Courtyard Executive Room", "Courtyard Family Suite", "Courtyard Premium Suite",
    "Deluxe", "Deluxe (Non Balcony)", "Deluxe (NON VIEW)", "Deluxe double room",
    "Deluxe Non View", "Deluxe Room", "Deluxe Room (Balcony room)",
    "Deluxe Room (Non Valley Facing)", "Deluxe Room (Non View)", "Deluxe Room AC",
    "Deluxe Room Non AC", "Deluxe Room(Mountain View)", "Deluxe Rooms",
    "Deluxe Tent", "Deluxe With Balcony", "Deluxr Room", "Double Delux Room"
  ];
  const PAYMENT_PREFERENCES = [
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

const navigate = useNavigate();

  const onAddNew = () => {
    navigate('/addhotel');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    onFilter(filters);
    setShowFilterSidebar(false);
    toast.success('Filters applied successfully!');
  };

  const resetFilters = () => {
    setFilters({
      mealPlans: [],
      roomTypes: [],
      checkInOut: '',
      rateValidity: '',
      paymentPreference: []
    });
    toast.info('Filters reset to default');
  };

  return (
    <div className="bg-white p-4 shadow-md">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
  <h1 className="text-2xl font-bold text-gray-800">Hotels</h1>

  <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full lg:w-auto">
    <button
      onClick={() => setShowFilterSidebar(true)}
      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
    >
      <FiFilter className="mr-2" />
      Filter
    </button>

    <form onSubmit={handleSearch} className="relative w-full sm:w-auto flex-1">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search hotels..."
        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <FiSearch className="absolute left-3 top-3 text-gray-400" />
    </form>

    <button
      onClick={onAddNew}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
    >
      <FiPlus className="mr-2" />
      Add New
    </button>
  </div>
</div>


      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowFilterSidebar(false)}
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Hotel Filters</h2>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowFilterSidebar(false)}
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="mt-6 space-y-6 text-black">
                    {/* Meal Plans Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meal Plans</label>
                      <select
                        multiple
                        value={filters.mealPlans}
                        onChange={(e) => handleFilterChange('mealPlans', 
                          Array.from(e.target.selectedOptions, option => option.value)
                        )}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {MEAL_PLANS.map(plan => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </select>
                    </div>

                    {/* Room Types Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Types</label>
                      <select
                        multiple
                        value={filters.roomTypes}
                        onChange={(e) => handleFilterChange('roomTypes', 
                          Array.from(e.target.selectedOptions, option => option.value)
                        )}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {ROOM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Check-In/Out Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-In/Out Time</label>
                      <input
                        type="text"
                        value={filters.checkInOut}
                        onChange={(e) => handleFilterChange('checkInOut', e.target.value)}
                        placeholder="e.g., 12:00 - 11:00"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Rate Validity Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate Validity (Child Age)</label>
                      <input
                        type="text"
                        value={filters.rateValidity}
                        onChange={(e) => handleFilterChange('rateValidity', e.target.value)}
                        placeholder="e.g., 6 - 12yo"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Payment Preference Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Preferences</label>
                      <select
                        multiple
                        value={filters.paymentPreference}
                        onChange={(e) => handleFilterChange('paymentPreference', 
                          Array.from(e.target.selectedOptions, option => option.value)
                        )}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {PAYMENT_PREFERENCES.map(pref => (
                          <option key={pref} value={pref}>{pref}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4 flex justify-between">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsHeader;