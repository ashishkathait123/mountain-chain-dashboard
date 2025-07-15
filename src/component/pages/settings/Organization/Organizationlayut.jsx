import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Navigation from '../../../Navagation/Navagation';
 
 
import {
  FiChevronRight,
  FiChevronLeft,
  FiFolder,
  FiUsers,
  FiSettings,
  FiMap,
  FiCompass,
  FiMail,
  FiDollarSign,
  FiFileText,
  FiFilter,
  FiTruck,
  FiUser,
} from 'react-icons/fi';

const OrganizationLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orgData, setOrgData] = useState(null);
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

  // Organization-specific header navigation items
  const orgHeaderItems = [
    { name: 'Repository', path: '/organization/repository', icon: FiFolder },
    { name: 'Users', path: '/organization/users', icon: FiUsers },
    { name: 'Settings', path: '/organization/settings', icon: FiSettings },
  ];

  // Sidebar navigation items
  const sidebarItems = [
    { name: 'Destinations', path: '/organization/destinations', icon: FiMap },
    { name: 'Trip Sources', path: '/organization/trip-sources', icon: FiCompass },
    { name: 'Email/PDF Templates', path: '/organization/email-templates', icon: FiMail },
    { name: 'Hotel Payment Prefs', path: '/organization/hotel-payment-prefs', icon: FiDollarSign },
    { name: 'T&C', path: '/organization/terms-conditions', icon: FiFileText },
    { name: 'Inc/Exclusions', path: '/organization/inclusions-exclusions', icon: FiFilter },
    { name: 'Cab Types', path: '/organization/cab-types', icon: FiTruck },
    { name: 'Tourists', path: '/organization/tourists', icon: FiUser },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-white overflow-hidden">
      {/* Header with Navigation */}
      <header className="bg-slate-900 p-4 shadow-lg">
        <Navigation className='bg-slate-200' role={sessionStorage.getItem('role') || 'Guest'} onLogout={handleLogout} />
        <nav className="flex space-x-6 mt-4 bg-slate-900 ">
          {orgHeaderItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-slate-700 text-white' : 'text-gray-400 hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-slate-100 p-4 h-full transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          } overflow-y-auto`}
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

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-slate-200 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizationLayout;