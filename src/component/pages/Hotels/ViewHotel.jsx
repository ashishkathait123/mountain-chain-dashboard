import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiEdit, FiPlus } from 'react-icons/fi';
import { HiArrowLeft } from 'react-icons/hi';

const ViewHotel = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(
          `https://mountain-chain.onrender.com/mountainchain/api/hotel/hotels/${id}`
        );
        setHotel(response.data.data);
      } catch (error) {
        console.error('Error fetching hotel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  if (loading) return <div className="p-6 text-gray-700">Loading...</div>;
  if (!hotel) return <div className="p-6 text-red-500">Hotel not found</div>;

  const formattedMeals = hotel.meals?.join(' • ') || 'Not specified';
  const formattedRoomTypes = hotel.rooms?.flatMap(r => r.roomTypes)?.join(' • ') || 'Not specified';
  const formattedCreatedAt = new Date(hotel.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="p-6">
      {/* Top Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <HiArrowLeft className="mr-1" />
            <Link to="/hotels" className="hover:underline mr-1">Hotels</Link>
            <span className="mx-1">/</span>
            <span className="text-black font-medium">{hotel.name}</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{hotel.name}</h1>
        </div>
        <Link to={`/hotels/edit/${id}`} className="flex items-center px-4 py-2 text-sm bg-white border rounded hover:bg-gray-100">
          <FiEdit className="mr-2" />
          Edit
        </Link>
      </div>

      {/* Top Info Row */}
      <div className="grid grid-cols-4 gap-6 bg-white rounded-lg shadow-sm p-6 border mb-6">
        {/* Left Side */}
        <div className="col-span-3 space-y-2">
          <div className="text-gray-600"><strong>Location:</strong> {hotel.city}, {hotel.state}, India</div>
          <div className="text-gray-600"><strong>Category:</strong> {hotel.stars === 5 ? 'Luxury' : 'Super deluxe'}</div>
          <div className="text-gray-600">
            <strong>Hotel Group:</strong>{' '}
            <span className="text-blue-700 hover:underline cursor-pointer">{hotel.groupName || 'Not specified'}</span>
          </div>
        </div>

        {/* Right Side: Image placeholder */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-28 h-28 border rounded bg-gray-50 flex items-center justify-center text-gray-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18V3H3zm16.5 10.5l-4.5-6-6 7.5-4.5-3-3 4.5" />
            </svg>
          </div>
          <button className="mt-2 px-3 py-1 text-sm border rounded hover:bg-gray-100">Add Image</button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b mb-4">
        <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Details</button>
      </div>

      {/* Hotel Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border space-y-6 text-sm text-gray-700">
        <div>
          <strong>Available Meal Plans:</strong> <span className="ml-1">{formattedMeals}</span>
        </div>
        <div>
          <strong>Check-In:</strong> <span className="ml-1">12:00</span> &nbsp;|&nbsp;
          <strong>Check-Out:</strong> <span className="ml-1">11:00</span>
        </div>
        <div>
          <strong>Available Room Types:</strong> <span className="ml-1">{formattedRoomTypes}</span>
        </div>
        <div>
          <strong>Extra bed child ages:</strong>{' '}
          <span className="ml-1">From {hotel.childrenAgeRangeMin || 'N/A'} to {hotel.childrenAgeRangeMax || 'N/A'} years</span>
        </div>
        <div>
          <strong>Payment Preference:</strong> <span className="ml-1">{hotel.paymentPreference || 'Not Set'}</span>
        </div>
        <div>
          <strong>Trip Destinations:</strong>{' '}
          <span className="ml-1">{hotel.tripDestinations.name?.join(', ') || hotel.state}</span>
        </div>
        <div className="text-xs text-gray-500 pt-2">
          Created on {formattedCreatedAt} by Ravikant
        </div>
      </div>

      {/* Contacts Section */}
      <div className="bg-white rounded-lg shadow-sm border mt-6 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">Contacts</h2>
        <div className="flex items-start text-sm text-gray-700">
          <FiPlus className="mt-1 mr-2 text-blue-500" />
          <p>No contacts added. Add contacts like spokesperson for better communication and sharing across organisation.</p>
        </div>
      </div>
    </div>
  );
};

export default ViewHotel;
