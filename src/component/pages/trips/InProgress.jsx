import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://mountain-chain.onrender.com/mountainchain/api'; // Use your actual API base URL

const InProgress = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { filter, token } = useOutletContext(); // Get token from the parent layout

  useEffect(() => {
    // We must have a token to make an authenticated request
    if (!token) {
        setLoading(false);
        toast.error("Authentication token not found.");
        return;
    }

    const fetchTrips = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/destination/getallquerys`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        // Filter the data to only include trips with "In Progress" status
        const inProgressTrips = response.data.data.filter(query => query.status === "In Progress");
        setTrips(inProgressTrips);

      } catch (error) {
        console.error('Error fetching in-progress trips:', error);
        toast.error('Failed to fetch in-progress trips.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [token]); // Re-fetch if the token changes

  // --- HANDLER FUNCTIONS (Copied from NewQueryList) ---

  const handleCallClick = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleQueryClick = (query) => {
    // Navigate to the query detail page, passing the query object in the state
    navigate(`/organization/trips/query/${query._id}`, { state: { query } });
  };

  if (loading) {
    return <div className="p-4 text-center text-slate-500">Loading In-Progress Trips...</div>;
  }

  return (
   <div className="p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <h1 className="text-base sm:text-lg text-black font-semibold">
            Showing 1 - {trips.length} of {trips.length} In-Progress Trips
          </h1>
        </div>

        <div className="w-full">
          <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.length > 0 ? trips.map((query) => (
                <tr key={query._id} className="hover:bg-gray-50">
                  <td className="w-1/6 px-4 py-3">
                    <button
                      onClick={() => handleQueryClick(query)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {query.queryId}
                    </button>
                  </td>
                  <td className="w-1/5 px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-black">
                        {query.querySource.shortName} - {query.guestName}
                      </span>
                      <button
                        onClick={() => handleCallClick(query.phoneNumbers[0])}
                        className="text-gray-500 hover:text-blue-500 flex items-center mt-1"
                      >
                        <FiPhone className="mr-1" />
                        {query.phoneNumbers[0]}
                      </button>
                    </div>
                  </td>
                  <td className="w-1/4 px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-black">{query.destination.name}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(query.createdAt).toLocaleDateString('en-GB')} • {query.numberOfNights}N • {query.noOfAdults}A
                      </span>
                    </div>
                  </td>
                  <td className="w-1/4 px-4 py-3">
                    <div className="flex flex-col">
                      {query.salesTeam.map((member) => (
                        <span key={member._id} className="text-gray-700 text-sm">{member.name}</span>
                      ))}
                      <span className="text-gray-400 text-xs">
                        {new Date(query.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </td>
                  <td className="w-1/6 px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {query.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
                        No trips are currently in progress.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InProgress;