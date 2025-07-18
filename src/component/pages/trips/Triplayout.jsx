import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../../../component/Navagation/Navagation';
import {
  FiChevronRight,
  FiChevronLeft,
  FiFolder,
  FiUsers,
  FiSettings,
  FiFilter,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiCheckSquare,
  FiFlag,
  FiCalendar,
  FiXCircle,
  FiSlash,
  FiX,
  FiChevronDown
} from 'react-icons/fi';
import { PulseLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom Dropdown Component
const MultiSelectDropdown = ({ 
  label, 
  options, 
  selectedValues, 
  onChange, 
  placeholder = "Select...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const selectedOptionNames = selectedValues.map(value => {
    const option = options.find(opt => opt._id === value);
    return option ? option.name : '';
  }).filter(name => name);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        className={`relative cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-white">
          <div className="flex flex-wrap gap-1 overflow-hidden max-h-10">
            {selectedOptionNames.length > 0 ? (
              selectedOptionNames.map((name, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {name}
                </span>
              ))
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <FiChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option._id}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                      selectedValues.includes(option._id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option._id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option._id)}
                      readOnly
                      className="mr-2 h-4 w-4 text-blue-600 rounded"
                    />
                    <span>{option.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const TripLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [filter, setFilter] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    destinations: [],
    sources: [],
    teamMembers: [],
    tags: []
  });
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  // Filter state
  const [filters, setFilters] = useState({
    destinations: [],
    sources: [],
    tags: [],
    owners: [],
    liveDuringFrom: '',
    liveDuringTo: '',
    createdBetweenFrom: '',
    createdBetweenTo: '',
    startDateBetweenFrom: '',
    startDateBetweenTo: '',
    endDateBetweenFrom: '',
    endDateBetweenTo: '',
    hasDuePayments: false,
    showArchived: false
  });

  useEffect(() => {
    const storedOrgData = sessionStorage.getItem('orgData');
    if (storedOrgData) {
      setOrgData(JSON.parse(storedOrgData));
    }
    
    if (token) {
      fetchFilterOptions();
    }
  }, [token]);

  const fetchFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [sourcesRes, destinationsRes, teamRes] = await Promise.all([
        axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/sourcelist', { headers }),
        axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist', { headers }),
        axios.get('https://mountain-chain.onrender.com/mountainchain/api/getusers', { headers })
      ]);

      // Filter only Sales Person and Operations roles
      const teamMembers = teamRes.data.data ? 
        teamRes.data.data.filter(user => ['Sales Person', 'Operations'].includes(user.role)) : [];

      setFilterOptions({
        destinations: destinationsRes.data?.data || [],
        sources: sourcesRes.data.data || [],
        teamMembers: teamMembers.map(member => ({
          ...member,
          name: `${member.name} (${member.role})`
        })),
        tags: [] // You would fetch tags from your API if available
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      toast.error('Failed to load filter options');
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        navigate('/login');
      }
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyFilters = () => {
    // Here you would typically apply the filters to your data
    console.log('Applying filters:', filters);
    
    // Convert the filters to a format suitable for API calls
    const apiFilters = {
      destinationIds: filters.destinations,
      sourceIds: filters.sources,
      tagIds: filters.tags,
      ownerIds: filters.owners,
      liveDuring: filters.liveDuringFrom && filters.liveDuringTo 
        ? { from: filters.liveDuringFrom, to: filters.liveDuringTo }
        : null,
      createdBetween: filters.createdBetweenFrom && filters.createdBetweenTo 
        ? { from: filters.createdBetweenFrom, to: filters.createdBetweenTo }
        : null,
      startDateBetween: filters.startDateBetweenFrom && filters.startDateBetweenTo 
        ? { from: filters.startDateBetweenFrom, to: filters.startDateBetweenTo }
        : null,
      endDateBetween: filters.endDateBetweenFrom && filters.endDateBetweenTo 
        ? { from: filters.endDateBetweenFrom, to: filters.endDateBetweenTo }
        : null,
      hasDuePayments: filters.hasDuePayments,
      showArchived: filters.showArchived
    };
    
    // You would pass these filters to your data fetching logic
    // For example, through context or a state management solution
    setShowFilterSidebar(false);
    toast.success('Filters applied successfully!');
  };

  const resetFilters = () => {
    setFilters({
      destinations: [],
      sources: [],
      tags: [],
      owners: [],
      liveDuringFrom: '',
      liveDuringTo: '',
      createdBetweenFrom: '',
      createdBetweenTo: '',
      startDateBetweenFrom: '',
      startDateBetweenTo: '',
      endDateBetweenFrom: '',
      endDateBetweenTo: '',
      hasDuePayments: false,
      showArchived: false
    });
    toast.info('Filters reset to default');
  };

  const orgHeaderItems = [
    { name: 'Repository', path: '/organization/repository', icon: FiFolder },
    { name: 'Users', path: '/organization/users', icon: FiUsers },
    { name: 'Settings', path: '/organization/settings', icon: FiSettings },
  ];

  const sidebarItems = [
    { name: 'New Query', path: '/organization/trips/new-query-list', icon: FiCheckCircle },
    { name: 'In Progress', path: '/organization/trips/in-progress', icon: FiClock },
    { name: 'Converted', path: '/organization/trips/converted', icon: FiCheckSquare },
    { name: 'On Trip', path: '/organization/trips/on-trip', icon: FiFlag },
    { name: 'Past Trips', path: '/organization/trips/past-trips', icon: FiCalendar },
    { name: 'Canceled', path: '/organization/trips/canceled', icon: FiXCircle },
    { name: 'Dropped', path: '/organization/trips/dropped', icon: FiSlash },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-white overflow-hidden">
      {/* Header with Navigation */}
      <header className="bg-slate-900 p-4 shadow-lg">
        <Navigation className="bg-slate-200" role={sessionStorage.getItem('role') || 'Guest'} onLogout={handleLogout} />
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-slate-100 p-4 h-full transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} overflow-y-auto`}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mb-6 p-2 bg-slate-800 rounded-full hover:bg-gray-600 transition-colors"
          >
            {isSidebarOpen ? <FiChevronLeft className="h-5 w-5" /> : <FiChevronRight className="h-5 w-5" />}
          </button>
          <nav>
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive ? 'bg-slate-200 text-black' : 'text-gray-900 hover:bg-gray-200'
                      } ${!isSidebarOpen ? 'justify-center' : ''}`
                    }
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {isSidebarOpen && item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area with Subheader */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Subheader for Trip Section */}
          <div className="bg-white p-4 shadow-md flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Trip Section</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFilterSidebar(true)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FiFilter className="mr-2" />
                Filters
              </button>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter trips..."
                className="p-2 rounded-md text-black border border-gray-300"
              />
              <button
                onClick={() => navigate('/organization/trips/new-query/add')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Add New Query
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-slate-200 overflow-y-auto">
            <Outlet context={{ filter, setFilter, filters, token: sessionStorage.getItem('token') }} />
          </main>
        </div>

        {/* Filter Sidebar */}
        {showFilterSidebar && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilterSidebar(false)}></div>
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowFilterSidebar(false)}
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>

                    {loadingOptions ? (
                      <div className="flex justify-center items-center h-64">
                        <PulseLoader color="#3B82F6" size={10} />
                      </div>
                    ) : (
                      <div className="mt-6 space-y-6 text-black">
                        {/* Destinations */}
                        <MultiSelectDropdown
                          label="Destinations"
                          options={filterOptions.destinations.map(d => ({ ...d, name: d.name }))}
                          selectedValues={filters.destinations}
                          onChange={(values) => setFilters(prev => ({ ...prev, destinations: values }))}
                          placeholder="Select destination(s)..."
                        />

                        {/* Trip Sources */}
                        <MultiSelectDropdown
                          label="Trip Sources"
                          options={filterOptions.sources.map(s => ({ ...s, name: s.type }))}
                          selectedValues={filters.sources}
                          onChange={(values) => setFilters(prev => ({ ...prev, sources: values }))}
                          placeholder="Select source(s)..."
                        />

                        {/* Tags */}
                        <MultiSelectDropdown
                          label="Tags"
                          options={filterOptions.tags}
                          selectedValues={filters.tags}
                          onChange={(values) => setFilters(prev => ({ ...prev, tags: values }))}
                          placeholder={filterOptions.tags.length > 0 ? "Select tag(s)..." : "No tags available"}
                          disabled={filterOptions.tags.length === 0}
                        />

                        {/* Sales and Ops owners */}
                        <MultiSelectDropdown
                          label="Sales and Ops owners"
                          options={filterOptions.teamMembers}
                          selectedValues={filters.owners}
                          onChange={(values) => setFilters(prev => ({ ...prev, owners: values }))}
                          placeholder="Select team member(s)..."
                        />

                        {/* Live During */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Live During</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              name="liveDuringFrom"
                              value={filters.liveDuringFrom}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                            <input
                              type="date"
                              name="liveDuringTo"
                              value={filters.liveDuringTo}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                          </div>
                        </div>

                        {/* Created Between */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created Between</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              name="createdBetweenFrom"
                              value={filters.createdBetweenFrom}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                            <input
                              type="date"
                              name="createdBetweenTo"
                              value={filters.createdBetweenTo}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                          </div>
                        </div>

                        {/* Start-Date Between */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start-Date Between</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              name="startDateBetweenFrom"
                              value={filters.startDateBetweenFrom}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                            <input
                              type="date"
                              name="startDateBetweenTo"
                              value={filters.startDateBetweenTo}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                          </div>
                        </div>

                        {/* End-Date Between */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End-Date Between</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              name="endDateBetweenFrom"
                              value={filters.endDateBetweenFrom}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                            <input
                              type="date"
                              name="endDateBetweenTo"
                              value={filters.endDateBetweenTo}
                              onChange={handleFilterChange}
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                          </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              id="hasDuePayments"
                              name="hasDuePayments"
                              type="checkbox"
                              checked={filters.hasDuePayments}
                              onChange={handleFilterChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="hasDuePayments" className="ml-2 block text-sm text-gray-700">
                              Has Due Payments
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="showArchived"
                              name="showArchived"
                              type="checkbox"
                              checked={filters.showArchived}
                              onChange={handleFilterChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showArchived" className="ml-2 block text-sm text-gray-700">
                              Show Archived
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
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
    </div>
  );
};

export default TripLayout;