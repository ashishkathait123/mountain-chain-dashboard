import React, { useState } from 'react';
import { FaBed } from 'react-icons/fa';
import { FiShare2, FiDownload, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

// --- HELPER FUNCTIONS ---
const API_BASE_URL = "http://localhost:5500/mountainchain/api";
const formatCurrency = (amount) => `INR ${amount?.toLocaleString('en-IN') || 0}`;
const formatDate = (dateString, options = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', options);
};
const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds > 86400 * 30) return `a month ago`;
    if (seconds > 86400) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds > 3600) return `${Math.floor(seconds / 3600)} hours ago`;
    return `a few minutes ago`;
};

// --- ACCORDION COMPONENT ---
const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const validChildren = React.Children.toArray(children).filter(Boolean);
    const hasContent = validChildren.length > 0;

    return (
        <div className="border-t border-slate-200">
            <button
                onClick={() => hasContent && setIsOpen(!isOpen)}
                className={`w-full text-left py-4 font-semibold text-slate-700 flex justify-between items-center ${hasContent ? 'cursor-pointer hover:bg-slate-50 px-2' : 'cursor-default text-slate-400'}`}
                disabled={!hasContent}
            >
                {title}
                {hasContent && (isOpen ? <FiChevronUp /> : <FiChevronDown />)}
            </button>
            {isOpen && hasContent && <div className="pb-4 px-2 text-sm text-slate-600">{validChildren}</div>}
        </div>
    );
};

// --- MAIN DISPLAY COMPONENT ---
const QuotationDetails = ({ quote }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);

    if (!quote) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-700">No Quotations Yet</h3>
                <p className="text-slate-500 mt-2">Create a custom quotation or use a suggestion to get started. The latest quote details will appear here.</p>
            </div>
        );
    }

    const totalServiceCost = (quote.hotelDetails?.entries?.reduce((acc, item) => acc + (item.sellingPrice || 0), 0) || 0) +
                           (quote.hotelDetails?.specialInclusions?.reduce((acc, item) => acc + (item.price || 0), 0) || 0);

    // --- PDF Download Handler ---


    const handlePreviewPDF = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) { toast.error("Authentication error."); return; }

    toast.info("Opening PDF preview...");

    try {
        const response = await axios.get(`${API_BASE_URL}/quotations/${quote.quoteId}/pdf`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        });

        const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        window.open(fileURL, '_blank'); // OPEN in new tab

    } catch (error) {
        console.error("PDF Preview Error:", error);
        toast.error("Failed to preview PDF.");
    } finally {
        setIsShareOpen(false);
    }
};

// --- PDF Download Handler ---
const handleDownloadPDF = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        toast.error("Authentication error.");
        return;
    }

    toast.info("Generating your PDF... Please wait.");

    try {
        const response = await axios.get(`${API_BASE_URL}/quotations/${quote.quoteId}/pdf`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob', // VERY IMPORTANT - get raw PDF
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = window.URL.createObjectURL(blob);

        // Option 1: Open in new tab (preview PDF)
        // window.open(fileURL);

        // Option 2: Force download (default)
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', `Quotation-${quote.quoteId}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(fileURL);

        toast.success("PDF downloaded successfully!");
    } catch (error) {
        console.error("PDF Download Error:", error);

        if (error.response && error.response.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function() {
                try {
                    const errorJson = JSON.parse(this.result);
                    toast.error(errorJson.message || "An unknown error occurred while generating the PDF.");
                } catch (e) {
                    toast.error("Could not parse the server error response.");
                }
            };
            reader.readAsText(error.response.data);
        } else {
            toast.error("Failed to download PDF. Please try again.");
        }
    } finally {
        setIsShareOpen(false);
    }
};



    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Package Quote Price</p>
                    <div className="flex items-baseline gap-3 mt-1">
                        <p className="text-3xl font-bold text-slate-800">{formatCurrency(quote.summary.totalSellingPrice)}</p>
                        <p className="text-slate-500">(inc. {quote.summary.gst?.value || 5}% GST) /</p>
                        <p className="text-slate-500">{formatCurrency(quote.summary.totalNetCost)} <span className="text-xs">(cost price)</span></p>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Created {timeAgo(quote.createdAt)} by {quote.createdBy?.name || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Edit Quote
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsShareOpen(!isShareOpen)} 
                            className="p-2 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 flex items-center gap-2 px-3"
                        >
                            <FiShare2 size={14}/> Share
                        </button>
                        {isShareOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
    <button 
        onClick={handleDownloadPDF}
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
    >
        <FiDownload size={14}/> Download PDF
    </button>
    <button 
        onClick={handlePreviewPDF}
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
    >
        <FiDownload size={14}/> Preview PDF
    </button>
    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
        <FiRefreshCw size={14}/> Regenerate Files
    </button>
</div>

                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    Latest Quote
                </span>
                <button className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                    Convert using Quote
                </button>
            </div>

            <div className="border border-slate-200 rounded-md p-3 mt-4 text-sm font-medium text-slate-700">
                {formatDate(quote.startDate)} for {quote.duration.split(', ')[1]} • {quote.pax} Adult(s)
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-8 mb-4">Services</h3>
            <div className="space-y-4">
                {/* Accommodation */}
                {quote.hotelDetails?.entries?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 text-sm">
                        <div className="col-span-1 flex items-center"><p className="font-semibold">Night</p></div>
                        <div className="col-span-4"><p className="font-semibold">Hotel</p></div>
                        <div className="col-span-2"><p className="font-semibold">Meal</p></div>
                        <div className="col-span-3"><p className="font-semibold">Rooms</p></div>
                        <div className="col-span-2 text-right"><p className="font-semibold">Price</p></div>

                        <div className="col-span-1">{item.stayNights.join(', ')}</div>
                        <div className="col-span-4">
                            <p className="font-semibold">{item.hotelName}</p>
                            <p className="text-xs">{item.hotelId?.city}</p>
                        </div>
                        <div className="col-span-2">{item.mealPlan}</div>
                        <div className="col-span-3">
                            <p>{item.numRooms} {item.roomConfig}</p>
                            <p className="text-xs">{item.paxPerRoom} Pax</p>
                        </div>
                        <div className="col-span-2 text-right font-semibold">
                            {formatCurrency(item.sellingPrice)}
                        </div>
                    </div>
                ))}
                {/* Special Inclusions */}
                {quote.hotelDetails?.specialInclusions?.length > 0 && (
                    <div className="grid grid-cols-12 gap-4 text-sm pt-4 border-t">
                        <div className="col-span-1"><p className="font-semibold">Night</p></div>
                        <div className="col-span-7"><p className="font-semibold">Service</p></div>
                        <div className="col-span-4 text-right"><p className="font-semibold">Price</p></div>
                        {quote.hotelDetails.specialInclusions.map((inc, i) => (
                           <React.Fragment key={i}>
                                <div className="col-span-1">{inc.night}</div>
                                <div className="col-span-7">
                                    <p className="font-semibold">{inc.service}</p>
                                    <p className="text-xs">{inc.comments}</p>
                                </div>
                                <div className="col-span-4 text-right font-semibold">
                                    {formatCurrency(inc.price)}
                                </div>
                           </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
            
            <hr className="my-6" />
            <div className="flex justify-end">
                <p className="text-lg font-bold text-slate-800">Total: {formatCurrency(totalServiceCost)}</p>
            </div>
            
            <div className="mt-8 space-y-2">
                <Accordion title="Inclusion / Exclusions">
                    {quote.inclusionsExclusions?.length > 0 ? (
                        quote.inclusionsExclusions.map((item, index) => (
                            <div key={index} className="grid grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-bold text-green-700 mb-1">Inclusions</h5>
                                    <p className="whitespace-pre-line">{item.included || 'N/A'}</p>
                                </div>
                                <div>
                                    <h5 className="font-bold text-red-700 mb-1">Exclusions</h5>
                                    <p className="whitespace-pre-line">{item.excluded || 'Anything not in Inclusions is Excluded'}</p>
                                </div>
                            </div>
                        ))
                    ) : null}
                </Accordion>
                <Accordion title="Day-wise Schedule">
                    {quote.dayWiseItinerary?.length > 0 ? (
                        quote.dayWiseItinerary.map(day => (
                            <div key={day.day} className="grid grid-cols-12 gap-4 mb-4 pb-4 border-b last:border-b-0">
                                <div className="col-span-2">
                                    <div className="p-2 bg-slate-50 rounded-md text-center">
                                        <p className="font-bold text-blue-600 text-base">Day {day.day}</p>
                                        <p className="text-xs text-slate-500">
                                            {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-10">
                                    <h4 className="font-bold text-base text-slate-800">{day.title}</h4>
                                    <p className="text-slate-600 whitespace-pre-line mt-1">{day.description}</p>
                                </div>
                            </div>
                        ))
                    ) : null}
                </Accordion>
            </div>
            <div className="mt-6">
                <button className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Edit Inclusion/Exclusions and Itinerary
                </button>
            </div>
        </div>
    );
};

export default QuotationDetails;