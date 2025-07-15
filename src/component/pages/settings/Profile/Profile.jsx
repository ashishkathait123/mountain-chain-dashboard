import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Appearance from './Apperance';
import Password from './Password';
import SecurityLogs from './Security';

const ProfileSection = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    businessName: '',
    businessId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Sidebar navigation items
  const sidebarItems = [
    { name: 'Your Profile', path: '/profile', icon: '👤' },
    { name: 'Password', path: '/profile/password', icon: '🔒' },
    { name: 'Security Logs', path: '/profile/security-logs', icon: '📝' },
    { name: 'Appearance', path: '/profile/appearance', icon: '🎨' },
  ];

  // Fetch user data from sessionStorage
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData({
          name: parsedData.name || 'Ravikant',
          email: parsedData.email || 'Mountainschaintravel@gmail.com',
          role: parsedData.role || 'Admin',
          businessName: parsedData.businessName || 'Mountains Chain Travel',
          businessId: parsedData.businessId || 'MCTXYH'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload a JPEG or PNG image');
        return;
      }
      if (file.size > 1048576) {
        alert('Image must be less than 1MB in size');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg font-medium text-gray-900">Profile</h1>
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={() => document.getElementById('mobile-sidebar').classList.toggle('hidden')}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        id="mobile-sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden md:block w-full md:w-64 bg-white border-r border-gray-200 p-4 fixed h-full z-20 overflow-y-auto"
      >
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900">Dashboard</h2>
        </div>
        <nav>
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="mr-3 text-gray-500">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
          >
            <span className="mr-2">→</span> Logout
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 md:p-8 md:ml-64 overflow-y-auto h-screen"
      >
        <div className="max-w-4xl mx-auto  relative">
          {/* Profile Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {/* Personal Information */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
                  <p className="mt-1 text-gray-900">{userData.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="mt-1 text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
                  <p className="mt-1 text-gray-900">{userData.role}</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</p>
                  <p className="mt-1 text-gray-900">{userData.businessName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business ID</p>
                  <p className="mt-1 text-gray-900">{userData.businessId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Outlet />
      </motion.div>
    </div>
  );
};

export default ProfileSection;