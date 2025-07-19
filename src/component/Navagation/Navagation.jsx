import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Navigation = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = sessionStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const navItems = [
    {
      name: 'Trips',
      path: '/organization/trips/new-query-list',
      roles: ['Admin', 'Sales Head', 'Sales Person', 'Operation Head', 'Reservation', 'Operation', 'Accountant', 'Data Operator', 'Reservation Head'],
      dropdown: [
        { name: 'Trips', path: '/organization/trips/new-query-list' },
        { name: 'Sales Report', path: '/admin/manage-users/view' },
      ],
    },
    {
      name: 'Manage Users',
      path: '/admin/manage-users',
      roles: ['Admin'],
      dropdown: [
        { name: 'Add User', path: '/admin/manage-users/add' },
        { name: 'View Users', path: '/admin/manage-users/view' },
      ],
    },
    {
      name: 'Reports',
      path: '/reports',
      roles: ['Admin', 'Sales Head', 'Operation Head', 'Accountant', 'Reservation Head'],
      dropdown: [
        { name: 'Sales Report', path: '/reports/sales' },
        { name: 'Operations Report', path: '/reports/operations' },
      ],
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: FiUser,
      roles: ['Admin', 'Sales Head', 'Sales Person', 'Operation Head', 'Reservation', 'Operation', 'Accountant', 'Data Operator', 'Reservation Head'],
      dropdown: [
        { name: 'Profile', path: '/profile' },
        { name: 'Organization', path: '/organization' },
      ],
    },
    {
      name: 'Hotels',
      path: '/hotels',
      icon: FiUser,
      roles: ['Admin', 'Sales Head', 'Sales Person', 'Operation Head', 'Reservation', 'Operation', 'Accountant', 'Data Operator', 'Reservation Head'],
      dropdown: [
        { name: 'Hotels', path: '/hotels' },
        { name: 'Hotel Price', path: '/hotel-price' },
      ],
    },
    {
      name: 'Transport Service',
      path: '/transport-Service',
      icon: FiUser,
      roles: ['Admin', 'Sales Head', 'Sales Person', 'Operation Head', 'Reservation', 'Operation', 'Accountant', 'Data Operator', 'Reservation Head'],
      dropdown: [
        { name: 'Transport Service', path: '/transport-Service' },
        { name: 'Transport Service Price', path: '/transport-Service-price' },
      ],
    },
  ];

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleLogout = () => {
    onLogout?.();
    sessionStorage.clear();
    navigate('/login'); 
  };

  if (!role) return <div className="bg-indigo-900 h-16 flex items-center justify-center text-white">Loading...</div>;

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink 
                to={`/${role?.toLowerCase().replace(' ', '-')}/dashboard`}
                className="flex items-center"
              >
                <img 
                  src="/logo-300x88-1[1].webp" 
                  width={150} 
                  alt="Company Logo"
                  className="h-10 object-contain filter brightness-0 invert"
                />
              </NavLink>
            </div>
            <div className="hidden md:flex md:ml-6 md:space-x-1">
              {navItems.map((item, index) => (
                item.roles.includes(role) && (
                  <div key={index} className="relative">
                    <div className="flex items-center group">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                            isActive
                              ? 'bg-white/10 text-white shadow-md backdrop-blur-sm'
                              : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.name}
                      </NavLink>
                      {item.dropdown && (
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="ml-1 p-1 text-indigo-200 hover:text-white focus:outline-none"
                        >
                          <FiChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              activeDropdown === index ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {item.dropdown && activeDropdown === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-20 left-0 mt-1 w-56 rounded-lg shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-white/10 py-1"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {item.dropdown.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            className="block px-4 py-2.5 text-sm text-indigo-900 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {subItem.name}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex items-center space-x-3 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-indigo-700 font-medium text-sm">{role.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-white">{role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-indigo-800 overflow-hidden"
        >
          <div className="pt-2 pb-3 space-y-1 px-2">
            {navItems.map((item, index) => (
              item.roles.includes(role) && (
                <div key={index} className="px-2">
                  <div className="flex flex-col">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                        }`
                      }
                      onClick={() => !item.dropdown && setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                        {item.name}
                      </div>
                      {item.dropdown && (
                        <FiChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${
                            activeDropdown === index ? 'rotate-180' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(index);
                          }}
                        />
                      )}
                    </NavLink>
                    {item.dropdown && activeDropdown === index && (
                      <div className="pl-8 mt-1 space-y-1">
                        {item.dropdown.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            className="block px-4 py-2.5 text-sm text-indigo-100 hover:bg-white/10 hover:text-white rounded-lg"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-white/10 px-4">
            <div className="flex items-center bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-indigo-700 font-medium">{role.charAt(0)}</span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{role}</div>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2.5 text-base font-medium text-white hover:bg-white/10 rounded-lg border border-white/20 hover:border-white/40 transition-all"
              >
                <FiLogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;