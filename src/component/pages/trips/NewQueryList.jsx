import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 import
import { FiPhone, FiChevronDown } from 'react-icons/fi';

const NewQueryList = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 👈 use navigate

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await fetch('https://mountain-chain.onrender.com/mountainchain/api/destination/getallquerys');
        const data = await response.json();
        const newQueries = data.data.filter(query => query.status === "New");
        setQueries(newQueries);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queries:', error);
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  const handleCallClick = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleQueryClick = (query) => {
    navigate(`/organization/trips/query/${query._id}`, { state: { query } }); // 👈 pass query as state
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
   <div className="p-2 sm:p-4">
  <div className="bg-white rounded-lg shadow overflow-x-auto">
    <div className="p-4 border-b">
      <h1 className="text-base sm:text-lg text-black font-semibold">
        Showing 1 - {queries.length} of {queries.length} Items
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
          {queries.map((query) => (
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
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {query.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );
};

export default NewQueryList;
