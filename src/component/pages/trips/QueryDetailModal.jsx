import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { FiPlus, FiCalendar, FiUser, FiEdit, FiSearch, FiMoreVertical, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import QuotationDetails from './QuoteBasicDetailsPage';
import AllQuotesTab from './AllQuotesTab';
import NewQuoteTab from './NewQuoteTab';

// --- HELPER FUNCTIONS ---
const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "a few seconds ago";
};

const dueText = (date) => {
    if (!date) return '';
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < -1) return `Due ${Math.abs(days)} days ago`;
    if (days === -1) return `Due yesterday`;
    if (days === 0) return `Due today`;
    if (days === 1) return `Due tomorrow`;
    return `Due in ${days} days`;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const API_BASE_URL = "http://localhost:5500/mountainchain/api";

const QueryDetailPage = () => {
    const [editedQuery, setEditedQuery] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Basic Details');

    // State for Follow-up Modal & Menu
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isActionable, setIsActionable] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
    const [openFollowUpMenu, setOpenFollowUpMenu] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams();
    const followUpMenuRef = useRef(null);

    const latestQuote = useMemo(() => {
        if (!quotations || quotations.length === 0) return null;
        return quotations[0];
    }, [quotations]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (followUpMenuRef.current && !followUpMenuRef.current.contains(event.target)) {
                setOpenFollowUpMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [followUpMenuRef]);

    const handleNavigateToCreate = () => {
        if (editedQuery) navigate("/new-quote", { state: { query: editedQuery } });
        else toast.error("Query data not available.");
    };

    const handleUseQuote = (quoteId) => navigate(`/quotes/${quoteId}`);

    const fetchFollowUps = async (queryId, token) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/destination/getfollowupsquery/${queryId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setFollowUps(res.data.data || []);
        } catch (error) { 
            toast.error("Could not refresh follow-ups."); 
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            if (!token) { 
                toast.error("Authentication required."); 
                setLoading(false); 
                navigate('/login'); 
                return; 
            }
            
            try {
                const queryRes = await axios.get(`${API_BASE_URL}/destination/getquery/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const queryData = queryRes.data;
                setEditedQuery(queryData);

                const [quotesRes, followUpsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/quotations/by-query/${queryData._id}`, { 
                        headers: { Authorization: `Bearer ${token}` } 
                    }),
                    axios.get(`${API_BASE_URL}/destination/getfollowupsquery/${queryData._id}`, { 
                        headers: { Authorization: `Bearer ${token}` } 
                    })
                ]);
                
                setQuotations(quotesRes.data || []);
                setFollowUps(followUpsRes.data.data || []);
            } catch (error) { 
                toast.error('Failed to load trip details.'); 
                navigate(-1); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchAllData();
    }, [id, navigate]);

    const handleAddFollowUp = async () => {
        if (!newComment.trim()) return toast.error("Comment cannot be empty.");
        setIsSavingFollowUp(true);
        const token = sessionStorage.getItem('token');
        
        try {
            await axios.post(
                `${API_BASE_URL}/destination/addfollowups/${editedQuery._id}`, 
                { 
                    message: newComment, 
                    dueDate: isActionable ? dueDate : null, 
                    status: isActionable ? "Not Solved" : "Solved" 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success("Follow-up added!");
            setNewComment(''); 
            setIsActionable(false); 
            setDueDate(''); 
            setIsModalOpen(false);
            await fetchFollowUps(editedQuery._id, token);
        } catch (error) { 
            toast.error(error.response?.data?.message || "Failed to add follow-up."); 
        } finally { 
            setIsSavingFollowUp(false); 
        }
    };

    const handleMarkAsResolved = async (followUpIndex) => {
        const token = sessionStorage.getItem('token');
        const followUp = followUps[followUpIndex];
        if (!followUp || followUp.status === 'Solved') return;
        
        toast.loading("Updating status...");
        try {
            await axios.post(
                `${API_BASE_URL}/destination/query/${editedQuery._id}/followup/${followUpIndex}/status`, 
                { status: "Solved" }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.dismiss(); 
            toast.success("Marked as Resolved!");
            setOpenFollowUpMenu(null);
            await fetchFollowUps(editedQuery._id, token);
        } catch (error) { 
            toast.dismiss(); 
            toast.error(error.response?.data?.message || "Failed to update status."); 
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen font-semibold text-slate-500">
            Loading Trip Details...
        </div>
    );
    
    if (!editedQuery) return (
        <div className="p-4 text-center text-red-500">
            Query not found.
        </div>
    );

    return (
        <>
            {/* --- ADD FOLLOW-UP MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-bold text-slate-800">Add Follow-up Comment</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="p-2 hover:bg-slate-100 rounded-full"
                            >
                                <FiX />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Comment
                                </label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows="4"
                                    placeholder="Body of the comment here..."
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-start">
                                <input
                                    id="actionable"
                                    type="checkbox"
                                    checked={isActionable}
                                    onChange={(e) => setIsActionable(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1"
                                />
                                <label htmlFor="actionable" className="ml-3">
                                    <span className="font-semibold text-sm text-slate-800">
                                        Mark it as actionable comment
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        This will make it show up in the demanding comments section
                                    </p>
                                </label>
                            </div>
                            {isActionable && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Due Date <span className="text-xs font-normal text-slate-500">
                                            (if it needs to be resolved before a date)
                                        </span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end items-center p-4 bg-slate-50 border-t rounded-b-lg space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFollowUp}
                                disabled={isSavingFollowUp}
                                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isSavingFollowUp ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- MAIN PAGE LAYOUT --- */}
            <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen text-slate-800">
                <div className="max-w-screen-2xl mx-auto">
                    {/* Header Section */}
                    <header className="mb-0 bg-white p-4 rounded-t-lg shadow-sm border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center flex-wrap gap-x-4">
                                    <span># {editedQuery.queryId} • {editedQuery.guestName} • {editedQuery.destination?.name}</span>
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {editedQuery.querySource?.type || 'Direct Query'}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        Ref: {editedQuery.referenceId || 'N/A'}
                                    </span>
                                </h1>
                                <div className="flex items-center text-sm text-slate-500 mt-2 space-x-4">
                                    <span className="flex items-center">
                                        <FiCalendar className="mr-1.5" /> 
                                        {formatDate(editedQuery.startDate)} • {editedQuery.duration}
                                    </span>
                                    <span className="flex items-center">
                                        <FiUser className="mr-1.5" /> 
                                        {editedQuery.noOfAdults} Adult(s)
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500 mt-2">
                                    <FiUser className="mr-1.5" /> 
                                    {editedQuery.guestName} {editedQuery.phoneNumbers?.[0]} 
                                    <button className="ml-2 text-slate-400 hover:text-blue-600">
                                        <FiEdit size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded">
                                    {editedQuery.status}
                                </div>
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                                    <FiMoreVertical />
                                </button>
                            </div>
                        </div>
                        <div className="border-t mt-4 pt-3 flex justify-between items-center text-sm">
                            <div>
                                <span className="font-semibold text-slate-500 mr-2">Tags:</span> 
                                <span className="text-slate-400">No Tags</span>
                                <button className="ml-2 text-slate-400 hover:text-blue-600">
                                    <FiEdit size={12} />
                                </button>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500 mr-2">Sales Team:</span> 
                                {editedQuery.salesTeam?.name || 'N/A'}
                            </div>
                        </div>
                    </header>
                    
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200 bg-white px-4">
                        {['Basic Details', 'All Quotes', 'New Quote', 'Activities'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`-mb-px px-4 py-3 text-sm font-semibold ${
                                    activeTab === tab 
                                        ? 'border-b-2 border-blue-600 text-blue-600' 
                                        : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {tab}
                                {tab === 'All Quotes' && quotations.length > 0 && (
                                    <span className="ml-2 bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {quotations.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <main className="grid grid-cols-12 gap-6">
                        {/* Left Column (Main Content) */}
                        <div className="col-span-12 lg:col-span-9">
                            <div className="bg-white rounded-b-lg shadow-sm border border-t-0 min-h-[600px]">
                                {activeTab === 'Basic Details' && (
                                    <QuotationDetails quote={latestQuote} />
                                )}
                                
                                {activeTab === 'All Quotes' && (
                                    <AllQuotesTab 
                                        quotations={quotations} 
                                        onUseQuote={handleUseQuote} 
                                    />
                                )}
                                
                                {activeTab === 'New Quote' && (
                                    <NewQuoteTab 
                                        onNavigateToCreate={handleNavigateToCreate} 
                                    />
                                )}
                                
                                {activeTab === 'Activities' && (
                                    <div className="p-10 text-center text-slate-500">
                                        Activity tracking and management will be displayed here.
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Right Column (Follow-ups) */}
                        <div className="col-span-12 lg:col-span-3">
                            <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-6">
                                <h2 className="text-lg font-semibold text-slate-700 mb-4">
                                    Follow-ups
                                </h2>
                                <div className="space-y-4">
                                    {followUps.length > 0 ? (
                                        followUps.map((f, index) => (
                                            <div key={f._id} className="text-sm border-b border-slate-100 pb-3 last:border-b-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-slate-800 pr-6">
                                                        {f.message}
                                                    </p>
                                                    <div className="relative" ref={openFollowUpMenu === index ? followUpMenuRef : null}>
                                                        <button 
                                                            onClick={() => setOpenFollowUpMenu(openFollowUpMenu === index ? null : index)} 
                                                            className="p-1 text-slate-400 hover:text-slate-700"
                                                        >
                                                            <FiMoreVertical size={16} />
                                                        </button>
                                                        {openFollowUpMenu === index && f.status !== 'Solved' && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
                                                                <button 
                                                                    onClick={() => handleMarkAsResolved(index)} 
                                                                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                                >
                                                                    Mark as Resolved
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {timeAgo(f.createdAt)} by {f.createdBy?.name || 'User'}
                                                    {f.dueDate && (
                                                        <span className="font-semibold text-red-500">
                                                            • {dueText(f.dueDate)}
                                                        </span>
                                                    )}
                                                </p>
                                                {f.status === 'Solved' && (
                                                    <p className="text-xs text-green-600 font-semibold flex items-center mt-1">
                                                        <FiCheck size={14} className="mr-1" /> 
                                                        {f.createdBy?.name || 'User'}, {timeAgo(f.updatedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-slate-500 py-6">
                                            <h3 className="font-semibold text-slate-700">
                                                All caught up!
                                            </h3>
                                            <p className="mt-1">
                                                Add comments for this trip flow
                                            </p>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setIsModalOpen(true)} 
                                        className="w-full flex items-center justify-center text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md py-2"
                                    >
                                        <FiPlus size={16} className="mr-1" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default QueryDetailPage;