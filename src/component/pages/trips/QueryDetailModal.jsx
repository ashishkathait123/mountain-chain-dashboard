import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiEdit2, FiClock, FiPlus, FiCheck, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';

const QueryDetailPage = ({ token }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuery, setEditedQuery] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isActionable, setIsActionable] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [followUps, setFollowUps] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // UPDATED: This function now passes the entire query object to the new route
  const handleNavigate = () => {
    if (editedQuery) {
      navigate("/new-quote", { state: { query: editedQuery } });
    } else {
      toast.error("Query data is not available to create a quotation.");
    }
  };

  useEffect(() => {
    if (location.state?.query) {
      setEditedQuery(location.state.query);
      setLoading(false);
    } else {
      fetchQuery();
    }
  }, [id, location.state]);

  const fetchQuery = async () => {
    try {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(
      `https://mountain-chain.onrender.com/mountainchain/api/destination/getallquerys/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
      setEditedQuery(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load query');
      console.error('Error fetching query:', error);
      navigate(-1);
    }
  };

useEffect(() => {
  const fetchFollowUps = async () => {
    const token = sessionStorage.getItem('token');
    if (!token || !editedQuery?._id) return;
    try {
      const response = await axios.get(
        `https://mountain-chain.onrender.com/mountainchain/api/destination/getfollowupsquery?queryId=${editedQuery._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setFollowUps(response.data); 
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      toast.error("Failed to load follow-up history.");
    }
  };
  fetchFollowUps();
}, [editedQuery?._id]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...editedQuery[field]];
    newArray[index] = e.target.value;
    setEditedQuery(prev => ({ ...prev, [field]: newArray }));
  };

  const addPhoneNumber = () => {
    setEditedQuery(prev => ({
      ...prev,
      phoneNumbers: [...(prev.phoneNumbers || []), '']
    }));
  };

  const removePhoneNumber = (index) => {
    const newNumbers = [...editedQuery.phoneNumbers];
    newNumbers.splice(index, 1);
    setEditedQuery(prev => ({ ...prev, phoneNumbers: newNumbers }));
  };
  const handleMarkAsResolved = async (followUpId) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    toast.error("User not authenticated. Please login again.");
    return;
  }
  try {
    const response = await axios.put(
      `http://localhost:5500/mountainchain/api/destination/addfollowups/${followUpId}`,
      {
        status: "Solved"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setFollowUps(prev => prev.map(followUp => 
      followUp._id === followUpId ? { ...followUp, status: "Solved" } : followUp
    ));
    toast.success('Follow-up marked as resolved!');
  } catch (error) {
    console.error('Error marking follow-up as resolved:', error);
    toast.error(error.response?.data?.message || 'Failed to update follow-up status');
  }
};


  
  const handleSave = async () => {
    try {
      setSaving(true);
      setIsEditing(false);
      toast.success('Query updated successfully!');
    } catch (error) {
      toast.error('Failed to update query');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error("User not authenticated. Please login again.");
      return;
    }
    try {
      setSaving(true);
      const response = await axios.post(
        `https://mountain-chain.onrender.com/mountainchain/api/destination/addfollowups/${editedQuery._id}`,
        {
          message: newComment,
          dueDate: isActionable ? dueDate : undefined,
          status: isActionable ? "Not Solved" : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNewComment('');
      setIsActionable(false);
      setDueDate('');
      toast.success('Follow-up added successfully!');
    } catch (error) {
      console.error('Error adding follow-up:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to add follow-up');
    } finally {
      setSaving(false);
    }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!editedQuery) return <div className="p-4 text-center"><p className="text-red-500">Query not found</p><button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go Back</button></div>;

  return (
    // ... JSX remains the same, no changes needed here
    <div className="bg-white rounded-lg shadow-sm w-full max-w-6xl mx-auto my-4 overflow-y-auto text-black">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full mr-2"
            title="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-semibold">
              #{editedQuery.queryId} • {editedQuery.guestName} • {editedQuery.destination?.name}
              {editedQuery.querySource?.type && ` • ${editedQuery.querySource.type}`}
              {editedQuery.referenceId && ` • Ref: ${editedQuery.referenceId}`}
              {editedQuery.status && ` • ${editedQuery.status}`}
            </h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <FiCalendar className="mr-1" />
              {formatDate(editedQuery.startDate)} • {editedQuery.duration} • {editedQuery.noOfAdults} Adult{editedQuery.noOfAdults !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="Edit"
            >
              <FiEdit2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-4 px-4">
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'followups' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('followups')}
          >
            Follow-ups
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'quotes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('quotes')}
          >
            Quotes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Guest Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Guest Details</h3>
                {isEditing && (
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (
                      <>
                        <FiCheck className="mr-1" /> Save
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name & Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="guestName"
                      value={editedQuery.guestName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  ) : (
                    <p>{editedQuery.guestName || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedQuery.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  ) : (
                    <p>{editedQuery.email || 'N/A'}</p>
                  )}
                </div>

                {/* Phone Numbers */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number(s)</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedQuery.phoneNumbers?.map((num, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={num}
                            onChange={(e) => handleArrayChange(e, index, 'phoneNumbers')}
                            className="flex-1 p-2 border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoneNumber(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPhoneNumber}
                        className="mt-2 flex items-center text-blue-600 text-sm"
                      >
                        <FiPlus className="mr-1" /> Add Phone Number
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {editedQuery.phoneNumbers?.map((num, index) => (
                        <p key={index}>{num}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editedQuery.address || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                    />
                  ) : (
                    <p>{editedQuery.address || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <p>{editedQuery.destination?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p>{editedQuery.duration || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="startDate"
                      value={editedQuery.startDate ? editedQuery.startDate.split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  ) : (
                    <p>{formatDate(editedQuery.startDate)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Nights</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="numberOfNights"
                      value={editedQuery.numberOfNights || 1}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  ) : (
                    <p>{editedQuery.numberOfNights || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="noOfAdults"
                      value={editedQuery.noOfAdults || 1}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  ) : (
                    <p>{editedQuery.noOfAdults || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children Ages</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedQuery.childrenAges?.map((age, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="number"
                            value={age}
                            onChange={(e) => handleArrayChange(e, index, 'childrenAges')}
                            className="w-full p-2 border border-gray-300 rounded"
                            min="0"
                            placeholder="Age"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAges = [...editedQuery.childrenAges];
                              newAges.splice(index, 1);
                              setEditedQuery(prev => ({ ...prev, childrenAges: newAges }));
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditedQuery(prev => ({
                            ...prev,
                            childrenAges: [...(prev.childrenAges || []), '']
                          }));
                        }}
                        className="mt-2 flex items-center text-blue-600 text-sm"
                      >
                        <FiPlus className="mr-1" /> Add Child Age
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {editedQuery.childrenAges?.length > 0 ? (
                        editedQuery.childrenAges.map((age, index) => (
                          <p key={index}>{age} years</p>
                        ))
                      ) : (
                        <p>No children</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {editedQuery.comments && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Comments</h3>
                {isEditing ? (
                  <textarea
                    name="comments"
                    value={editedQuery.comments || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="3"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{editedQuery.comments}</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="space-y-6">
            {/* Existing Follow-ups */}
            <div className="space-y-4">
              <h3 className="font-medium">Follow-up History</h3>
              {editedQuery.followUps?.length > 0 ? (
                editedQuery.followUps.map((followUp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="whitespace-pre-wrap">{followUp.message}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <FiClock className="mr-1" />
                          {formatDateTime(followUp.createdAt)} by {followUp.createdBy?.name || 'System'}
                        </div>
                        {followUp.actionable && (
                          <div className="mt-2 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Actionable
                            </span>
                            {followUp.dueDate && (
                              <span className="ml-2">
                                Due: {formatDate(followUp.dueDate)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No follow-ups yet</p>
              )}
            </div>

            {/* Add New Follow-up */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Add Follow-up Comment</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-3"
                rows="3"
                placeholder="Enter your follow-up comment here..."
              />
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActionable}
                    onChange={() => setIsActionable(!isActionable)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Mark as actionable
                  </span>
                </label>
                {isActionable && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setNewComment('');
                      setIsActionable(false);
                      setDueDate('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={saving || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <h3 className="font-medium">Suggested Quotes</h3>
            <p className="text-gray-500">To Create Quote you can start with below suggestions.</p>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by trip id or guest name"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-medium">#52810</span>
                  <span className="ml-2">SSSASD</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Itinerary</button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Hotels</button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Details</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <div className="text-gray-500">Duration:</div>
                  <div>2 Days</div>
                </div>
                <div>
                  <div className="text-gray-500">Transfers:</div>
                  <div>1 Adults</div>
                </div>
                <div className="flex items-end">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Use this Quote
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
      <button
        onClick={handleNavigate}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
      >
        <FiPlus className="mr-1" />
        Create Custom Quotation
      </button>
    </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default QueryDetailPage;