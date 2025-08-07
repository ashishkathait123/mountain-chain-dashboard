import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import QuotationDetails from './trips/QuoteBasicDetailsPage';



const API_BASE_URL = "https://mountain-chain.onrender.com/mountainchain/api";

const ConversionPage = () => {
    const { quoteId } = useParams(); // Get quoteId from URL
    const navigate = useNavigate();
    
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [instalments, setInstalments] = useState([{ amount: '', dueDate: '' }]);
    const [comments, setComments] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const res = await axios.get(`${API_BASE_URL}/quotations/${quoteId}`, { // Assuming this is your endpoint to get a single quote
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuote(res.data);
                // Pre-fill the first instalment with the total amount
                if(res.data.summary.totalSellingPrice) {
                    setInstalments([{ amount: res.data.summary.totalSellingPrice, dueDate: '' }]);
                }
            } catch (error) {
                toast.error("Failed to load quotation details.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [quoteId, navigate]);

    const handleInstalmentChange = (index, field, value) => {
        const newInstalments = [...instalments];
        newInstalments[index][field] = value;
        setInstalments(newInstalments);
    };

    const addInstalment = () => {
        setInstalments([...instalments, { amount: '', dueDate: '' }]);
    };

    const removeInstalment = (index) => {
        const newInstalments = instalments.filter((_, i) => i !== index);
        setInstalments(newInstalments);
    };

    const handleConvertTrip = async () => {
        if (!isVerified) {
            return toast.warn("Please verify the details before converting.");
        }
        if (window.confirm("Are you sure you want to mark this trip as Converted?")) {
            setIsConverting(true);
            const token = sessionStorage.getItem('token');
            try {
                await axios.post(
                    `${API_BASE_URL}/destination/query/${quote.queryId._id}/convert`, 
                    {
                        quoteId: quote._id,
                        instalments,
                        comments
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Trip Converted Successfully!");
                navigate(`/organization/trips/query/${quote.queryId._id}`); // Navigate back to the query detail page
            } catch (error) {
                toast.error(error.response?.data?.message || "Conversion failed.");
            } finally {
                setIsConverting(false);
            }
        }
    };

    if (loading) return <div className="text-center p-10">Loading Conversion Details...</div>;
    if (!quote) return <div className="text-center p-10 text-red-500">Could not load quote.</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Convert Trip: #{quote.queryId.queryId}</h1>
            
            {/* Display the selected quote */}
            <div className="mb-8">
                <QuotationDetails quote={quote} isConversionView={true} />
            </div>

            {/* Instalments Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-lg font-semibold mb-4">Instalment Plan</h2>
                {instalments.map((inst, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
                        <div className="col-span-1">#{index + 1}</div>
                        <div className="col-span-5">
                            <label className="text-xs">Amount (INR)</label>
                            <input 
                                type="number" 
                                value={inst.amount}
                                onChange={e => handleInstalmentChange(index, 'amount', e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="col-span-5">
                            <label className="text-xs">Due Date</label>
                            <input 
                                type="date"
                                value={inst.dueDate}
                                onChange={e => handleInstalmentChange(index, 'dueDate', e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="col-span-1">
                            {instalments.length > 1 && (
                                <button onClick={() => removeInstalment(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                    <FiTrash2 />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button onClick={addInstalment} className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <FiPlus /> Add Another Instalment
                </button>
            </div>
            
            {/* Comments and Confirmation */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-2">Comments & Final Confirmation</h2>
                <textarea 
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Any comments regarding verification or prices etc..."
                    className="w-full p-2 border rounded-md mb-4"
                    rows="3"
                ></textarea>
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <label className="flex items-center">
                        <input 
                            type="checkbox"
                            checked={isVerified}
                            onChange={e => setIsVerified(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-3 font-semibold text-green-800">
                            Yes, I have verified the details are correct and have been confirmed with the client.
                        </span>
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-4">
                <button 
                    onClick={handleConvertTrip}
                    disabled={!isVerified || isConverting}
                    className="px-8 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                >
                    {isConverting ? 'Converting...' : 'Convert Trip'}
                </button>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConversionPage;