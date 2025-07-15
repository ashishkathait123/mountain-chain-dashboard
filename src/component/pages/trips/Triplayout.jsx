import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';

const TripLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrgData = sessionStorage.getItem('orgData');
    if (storedOrgData) {
      setOrgData(JSON.parse(storedOrgData));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // Organization-specific header navigation items (unchanged)
  const orgHeaderItems = [
    { name: 'Repository', path: '/organization/repository', icon: FiFolder },
    { name: 'Users', path: '/organization/users', icon: FiUsers },
    { name: 'Settings', path: '/organization/settings', icon: FiSettings },
  ];

  // Sidebar navigation items without the "Trips" submenu
  const sidebarItems = [
   
    { name: 'New Query', path: '/organization/trips/new-query', icon: FiCheckCircle },
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
              <div className="flex items-center">
                <FiFilter className="text-gray-600 mr-2" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter trips..."
                  className="p-2 rounded-md text-black border border-gray-300"
                />
              </div>
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
            <Outlet context={{ filter, setFilter, token: sessionStorage.getItem('token') }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default TripLayout;