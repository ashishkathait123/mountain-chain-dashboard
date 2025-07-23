import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiPlus, FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TransportServices = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 10;
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

 // Define the fetch function outside useEffect so it's reusable
const fetchTransportServices = async () => {
  setLoading(true);
  try {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found');

    const response = await axios.get(
      'https://mountain-chain.onrender.com/mountainchain/api/transport/list',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.success) {
      const transformedServices = response.data.data.map(service => ({
        _id: service._id,
        fromCity: service.fromCity,
        toCity: service.toCity,
        price: service.price,
        services: [
          service.serviceName,
          ...(service.itinerary ? [service.itinerary.title] : []),
          ...service.tripDestinations
        ].filter(Boolean)
      }));

      setServices(transformedServices);
      setFilteredServices(transformedServices);
    } else {
      throw new Error('Failed to fetch transport services');
    }
  } catch (err) {
    console.error('Error fetching transport services:', err);
  } finally {
    setLoading(false);
  }
};

// Call it once when the component mounts
useEffect(() => {
  fetchTransportServices();
}, []);


  useEffect(() => {
    const results = services.filter(service =>
      service.fromCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredServices(results);
    setCurrentPage(1);
  }, [searchTerm, services]);

  // Pagination logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const handleAddService = () => navigate('/addservice');
  const toggleMenu = (id) => setActiveMenu(activeMenu === id ? null : id);
  const handleEdit = (id) => navigate(`/service/update/${id}`);
   
  const handleDelete = async (serviceId) => {
  if (window.confirm('Are you sure you want to delete this service?')) {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      await axios.delete(`https://mountain-chain.onrender.com/mountainchain/api/transport/delete/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

      });

      // Remove the deleted service from UI
      const updatedServices = services.filter(service => service._id !== serviceId);
      setServices(updatedServices);
            const toastId = toast.loading("Updating service...");
toast.dismiss(toastId);
      setFilteredServices(updatedServices);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  }
  
};


  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Transport Services</h1>
            <button 
              onClick={handleAddService}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              <FiPlus size={16} />
              New Service
            </button>
          </div>
         <div className="flex justify-between items-center mt-4">
  <p className="text-sm text-gray-600">Showing {filteredServices.length} Items</p>

  <div className="flex items-center gap-3">
    <div className="relative w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search services..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Reload SVG Button */}
{/* Reload SVG Button */}
<button
  onClick={fetchTransportServices}
  className="text-gray-600 hover:text-blue-600 transition"
  title="Reload"
  disabled={loading} // Optional: disable button while loading
>
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${loading ? 'animate-spin text-blue-600' : ''}`}
  >
    <path d="M16.023 9.348h4.992M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
  </svg>
</button>

  </div>
</div>

        </div>

        {/* Services Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 capitalize">
                    {service.fromCity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">
                    {service.toCity}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {service.services.map((s, i) => (
                        
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {s}
                        </span>
                        
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">
                    {service.price ? `₹${service.price}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <button 
                      onClick={() => toggleMenu(service._id)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <FiMoreVertical />
                    </button>
                    {activeMenu === service._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => handleEdit(service._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                          Edit Service
                          </button>
                        </div>
                        <div className="py-1">
  <button
    onClick={() => handleDelete(service._id)}
    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
  >
    Delete Service
  </button>
</div>

                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstService + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastService, filteredServices.length)}</span> of{' '}
                  <span className="font-medium">{filteredServices.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportServices;