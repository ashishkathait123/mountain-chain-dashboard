import React from 'react';
import Navigation from './Navagation/Navagation';
  
  
const Layout = ({ children }) => {
  const role = sessionStorage.getItem('role') || 'Guest';
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userData');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation role={role} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-6">
        <div className=" ">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;