import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HotelsHeader from "./HotelsHeader"; // Assuming this component is styled
import { FiEye, FiTrash2, FiAlertTriangle, FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// --- Reusable UI Components ---

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, hotelName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-md transform transition-all">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                        <FiAlertTriangle className="text-red-600 text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Confirm Deletion</h2>
                </div>
                <p className="my-4 text-slate-600">
                    Are you sure you want to delete <strong className="font-semibold text-slate-900">{hotelName}</strong>? This action is irreversible.
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const NoResults = ({ onClear }) => (
    <div className="text-center bg-white p-10 rounded-xl shadow-md border">
        <FiInbox className="mx-auto text-5xl text-slate-400 mb-4" />
        <h3 className="text-xl font-semibold text-slate-800">No Hotels Found</h3>
        <p className="text-slate-500 mt-2">Your search or filter criteria did not match any hotels.</p>
        <button
            onClick={onClear}
            className="mt-6 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
        >
            Clear Filters & Search
        </button>
    </div>
);


// --- Main Hotel List Component ---

const Hotel = () => {
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [hotelToDelete, setHotelToDelete] = useState(null);
    const navigate = useNavigate();

    // --- Data Fetching ---
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                // Assuming token is needed for this GET request as well for consistency
                const token = sessionStorage.getItem('token');
                if (!token) throw new Error('Authentication token not found.');

                const response = await axios.get(
                    "https://mountain-chain.onrender.com/mountainchain/api/hotel/gethotels",
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setHotels(response.data.hotels);
                setFilteredHotels(response.data.hotels);
            } catch (err) {
                setError(err.message);
                toast.error(err.message || "Failed to fetch hotels.");
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    // --- Search & Filter Logic ---
    const applyFiltersAndSearch = (term, currentFilters) => {
        let results = [...hotels];
        
        // Apply search
        if (term) {
             results = results.filter(hotel =>
                hotel.name.toLowerCase().includes(term.toLowerCase()) ||
                hotel.location.toLowerCase().includes(term.toLowerCase()) ||
                hotel.city.toLowerCase().includes(term.toLowerCase())
            );
        }
        
        // Apply filters (assuming structure from your original code)
        if (currentFilters?.mealPlans?.length > 0) {
            results = results.filter(hotel => currentFilters.mealPlans.some(plan => hotel.meals.includes(plan)));
        }
        // Add other filters here...

        setFilteredHotels(results);
        setCurrentPage(1);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        applyFiltersAndSearch(term, {}); // Resetting filters on new search for simplicity
    };
    
    const handleFilter = (filters) => {
        applyFiltersAndSearch(searchTerm, filters);
    };

    const clearAll = () => {
        setSearchTerm('');
        setFilteredHotels(hotels);
        setCurrentPage(1);
        // You might need to call a reset function inside HotelsHeader
    };
    
    // --- Delete Logic ---
    const openDeleteModal = (hotel, event) => {
        event.stopPropagation(); // Prevent navigation when clicking delete button
        setHotelToDelete(hotel);
    };

    const closeDeleteModal = () => {
        setHotelToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!hotelToDelete) return;
        try {
            const token = sessionStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            await axios.delete(
                `https://mountain-chain.onrender.com/mountainchain/api/hotel/hotels/${hotelToDelete._id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Optimistically update UI
            const updatedHotels = hotels.filter(h => h._id !== hotelToDelete._id);
            setHotels(updatedHotels);
            setFilteredHotels(updatedHotels);

            toast.success(`Hotel "${hotelToDelete.name}" deleted successfully!`);
        } catch (error) {
            console.error('Error deleting hotel:', error);
            toast.error(error.response?.data?.message || 'Failed to delete hotel.');
        } finally {
            closeDeleteModal();
        }
    };
    
    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

    // --- Loading and Error States ---
    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div></div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    return (
        <>
            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
            <DeleteConfirmationModal
                isOpen={!!hotelToDelete}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                hotelName={hotelToDelete?.name}
            />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-white/60 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                         <h1 className="text-2xl font-bold text-slate-900">Hotel Management</h1>
                         <p className="text-slate-500 mt-1">Browse, filter, and manage your hotel listings.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <HotelsHeader 
                        onSearch={handleSearch} 
                        onFilter={handleFilter} 
                        onAddNew={() => navigate('/hotels/add')} // Navigate to an 'add' route
                    />
                    
                    {currentHotels.length > 0 ? (
                      <>
                        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hotel</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Meal Plans</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {currentHotels.map((hotel) => (
                                        <tr 
                                            key={hotel._id} 
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => navigate(`/hotels/${hotel._id}`)} style={{ cursor: 'pointer' }}>
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-11 w-11 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-indigo-700 font-bold text-lg">{hotel.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900">{hotel.name}</div>
                                                        <div className="text-sm text-slate-500">{hotel.groupName || 'No Group'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => navigate(`/hotels/${hotel._id}`)} style={{ cursor: 'pointer' }}>
                                                <div className="text-sm text-slate-900">{hotel.location}</div>
                                                <div className="text-sm text-slate-500">{hotel.city}, {hotel.state}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => navigate(`/hotels/${hotel._id}`)} style={{ cursor: 'pointer' }}>
                                                <div className="flex flex-wrap gap-1">
                                                    {hotel.meals.slice(0, 3).map((meal, index) => (
                                                        <span key={index} className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">{meal}</span>
                                                    ))}
                                                    {hotel.meals.length > 3 && <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">+{hotel.meals.length - 3}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <button onClick={() => navigate(`/hotels/${hotel._id}`)} className="text-slate-500 hover:text-indigo-600 transition" title="View Details">
                                                        <FiEye size={18} />
                                                    </button>
                                                    <button onClick={(e) => openDeleteModal(hotel, e)} className="text-slate-500 hover:text-red-600 transition" title="Delete Hotel">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, filteredHotels.length)}</span> of <span className="font-semibold">{filteredHotels.length}</span> results
                                </p>
                                <div className="flex items-center">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <FiChevronLeft />
                                    </button>
                                    <span className="px-4 text-sm font-medium">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                      </>
                    ) : (
                        <NoResults onClear={clearAll} />
                    )}
                </div>
            </div>
        </>
    );
};

export default Hotel;