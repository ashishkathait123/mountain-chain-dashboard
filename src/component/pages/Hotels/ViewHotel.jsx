import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit, FiTrash2, FiMapPin, FiStar, FiClock, FiUsers, FiCreditCard, FiPhone, FiMail, FiCheckCircle, FiInfo, FiAlertTriangle, FiPlusCircle } from 'react-icons/fi';
import { HiArrowLeft } from 'react-icons/hi';

// --- Reusable UI Components ---

const Card = ({ children, title, icon, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
        <div className="p-6">
            {title && (
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    {icon}
                    <span className="ml-3">{title}</span>
                </h3>
            )}
            <div className="space-y-4 text-sm text-slate-600">
                {children}
            </div>
        </div>
    </div>
);

const InfoRow = ({ label, value, icon, className = '' }) => (
    <div className={`flex items-start ${className}`}>
        {icon && <div className="text-slate-400 mt-0.5 mr-3">{icon}</div>}
        <div className="flex-1">
            <span className="font-semibold text-slate-800">{label}:</span>
            <span className="ml-2 text-slate-600">{value || 'Not Specified'}</span>
        </div>
    </div>
);

const Pill = ({ text, className = '' }) => (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${className}`}>
        {text}
    </span>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, hotelName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center">
                    <FiAlertTriangle className="text-red-500 text-2xl mr-4" />
                    <h2 className="text-xl font-bold text-slate-800">Confirm Deletion</h2>
                </div>
                <p className="my-4 text-slate-600">
                    Are you absolutely sure you want to delete the hotel: <strong className="font-semibold">{hotelName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 font-semibold transition">
                        Yes, Delete Hotel
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main ViewHotel Component ---

const ViewHotel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) throw new Error('Authentication token not found');

                const response = await axios.get(
                    `https://mountain-chain.onrender.com/mountainchain/api/hotel/hotels/${id}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setHotel(response.data.data);
            } catch (error) {
                console.error('Error fetching hotel:', error);
                toast.error('Failed to load hotel details.');
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    const handleDelete = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');
            
            await axios.delete(
                `https://mountain-chain.onrender.com/mountainchain/api/hotel/hotels/${id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success('Hotel deleted successfully!');
            setTimeout(() => navigate('/hotels'), 2000);
        } catch (error) {
            console.error('Error deleting hotel:', error);
            toast.error(error.response?.data?.message || 'Failed to delete hotel.');
        } finally {
            setDeleteModalOpen(false);
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center text-center p-6">
                 <div>
                    <FiAlertTriangle className="text-red-500 text-5xl mx-auto mb-4"/>
                    <h1 className="text-2xl font-bold text-slate-800">Hotel Not Found</h1>
                    <p className="text-slate-600 mt-2">The hotel you are looking for does not exist or has been removed.</p>
                    <Link to="/hotels" className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                        Back to Hotels List
                    </Link>
                </div>
            </div>
        );
    }
    
    // --- Formatted Data ---
    const formattedCreatedAt = new Date(hotel.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedMeals = hotel.meals?.length > 0 
        ? hotel.meals.map(meal => <Pill key={meal} text={meal} className="bg-green-100 text-green-800" />)
        : <Pill text="Not specified" className="bg-slate-100 text-slate-800" />;
    const formattedDestinations = hotel.tripDestinations?.length > 0 
        ? hotel.tripDestinations.map(dest => <Pill key={dest.name} text={dest.name} className="bg-blue-100 text-blue-800" />)
        : <Pill text={hotel.state} className="bg-blue-100 text-blue-800" />;

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                hotelName={hotel.name}
            />
            <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                        <div>
                            <Link to="/hotels" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center mb-2">
                                <HiArrowLeft className="mr-2" /> Back to Hotels
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
                            <div className="flex items-center text-slate-500 mt-2">
                                <FiMapPin className="mr-2"/>
                                <span>{hotel.city}, {hotel.state}</span>
                                <span className="mx-2">|</span>
                                <FiStar className="mr-1 text-yellow-500"/>
                                <span>{hotel.stars} Star Property</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                            <Link to={`/hotels/edit/${id}`} className="flex items-center px-4 py-2 text-sm font-semibold bg-white border rounded-lg shadow-sm hover:bg-slate-50 transition">
                                <FiEdit className="mr-2" /> Edit
                            </Link>
                            <button onClick={() => setDeleteModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 border rounded-lg shadow-sm hover:bg-red-700 transition">
                                <FiTrash2 className="mr-2" /> Delete
                            </button>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card title="Hotel Overview" icon={<FiInfo className="text-indigo-500"/>}>
                                <InfoRow label="Group Name" value={hotel.groupName} />
                                <InfoRow label="Payment Policy" value={hotel.paymentPreference} icon={<FiCreditCard />} />
                                <InfoRow label="Check-in Time" value={hotel.checkinTime} icon={<FiClock />} />
                                <InfoRow label="Check-out Time" value={hotel.checkoutTime} icon={<FiClock />} />
                                <InfoRow label="Child Age Range" value={`${hotel.childrenAgeRangeMin} - ${hotel.childrenAgeRangeMax} years`} icon={<FiUsers />} />
                                <div className="flex items-start pt-2">
                                    <div className="text-slate-400 mt-0.5 mr-3"><FiCheckCircle /></div>
                                    <div>
                                        <span className="font-semibold text-slate-800">Available Meal Plans:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">{formattedMeals}</div>
                                    </div>
                                </div>
                                <div className="flex items-start pt-2">
                                    <div className="text-slate-400 mt-0.5 mr-3"><FiMapPin /></div>
                                    <div>
                                        <span className="font-semibold text-slate-800">Trip Destinations:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">{formattedDestinations}</div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Room Configurations" icon={<FiUsers className="text-indigo-500"/>}>
                                {hotel.rooms?.map((room, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-lg border">
                                        <h4 className="font-semibold text-md text-indigo-700 mb-3">{room.roomTypes.join(' / ') || 'Unnamed Room'}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                             <InfoRow label="Base Price" value={`₹${room.BasePrice}`} />
                                             <InfoRow label="Total Rooms" value={room.numberOfRooms} />
                                             <InfoRow label="AWEB" value={`₹${room.AWEB}`} />
                                             <InfoRow label="CWEB" value={`₹${room.CWEB}`} />
                                             <InfoRow label="CWoEB" value={`₹${room.CWoEB}`} />
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        </div>

                        <div className="space-y-8">
                             <Card title="Contact Information" icon={<FiPhone className="text-indigo-500"/>}>
                                {hotel.phoneNumbers?.length > 0 ? hotel.phoneNumbers.map((phone, i) => (
                                    <InfoRow key={i} label={`Phone ${i+1}`} value={phone} icon={<FiPhone />} />
                                )) : <p>No phone numbers listed.</p>}
                                
                                {hotel.emails?.length > 0 ? hotel.emails.map((email, i) => (
                                    <InfoRow key={i} label={`Email ${i+1}`} value={email} icon={<FiMail />} />
                                )) : <p>No emails listed.</p>}
                                
                                <button className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                                    <FiPlusCircle className="mr-2"/> Add Contact
                                </button>
                            </Card>
                            <Card className="bg-slate-800 text-white">
                                <p className="text-xs text-slate-400">Record created by {hotel.createdBy?.name || 'Unknown User'} on</p>
                                <p className="font-semibold text-lg">{formattedCreatedAt}</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewHotel;