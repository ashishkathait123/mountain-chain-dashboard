import React, { useState } from 'react';
import { FaBed, FaCar, FaPlane,  } from 'react-icons/fa';
import { FiShare2, FiDownload, FiRefreshCw, FiChevronDown, FiChevronUp, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- HELPER FUNCTIONS ---
const API_BASE_URL = "https://mountain-chain.onrender.com/mountainchain/api";

const formatCurrency = (amount, withSymbol = true) => {
    if (typeof amount !== 'number') return withSymbol ? 'INR 0' : '0';
    const options = withSymbol ? { style: 'currency', currency: 'INR' } : {};
    return new Intl.NumberFormat('en-IN', options).format(amount);
};

const formatDate = (dateString, options = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 5) return "just now";
    const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    let counter;
    for (const key in intervals) {
        counter = Math.floor(seconds / intervals[key]);
        if (counter > 0) return `${counter} ${key}${counter !== 1 ? 's' : ''} ago`;
    }
    return 'just now';
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

// --- VIEW FOR A CONVERTED QUOTE ---
const ConvertedQuoteView = ({ quote, navigate }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const totalServiceCost = (quote.hotelDetails?.entries?.reduce((acc, item) => acc + (item.sellingPrice || 0), 0) || 0) +
                           (quote.hotelDetails?.specialInclusions?.reduce((acc, item) => acc + (item.price || 0), 0) || 0);
    // const handleOpenPDF = async (action = 'preview') => {
    //     const token = sessionStorage.getItem('token');
    //     if (!token) { toast.error("Authentication error."); return; }
        
    //     const toastId = toast.loading(`Generating your PDF for ${action}...`);

    //     try {
    //         const response = await axios.get(`${API_BASE_URL}/quotations/${quote.quoteId}/pdf`, {
    //             headers: { Authorization: `Bearer ${token}` },
    //             responseType: 'blob',
    //         });

    //         const pdfBlob = response.data;
    //         if (pdfBlob.type !== "application/pdf") {
    //             throw new Error("Server did not return a valid PDF file.");
    //         }

    //         const fileURL = window.URL.createObjectURL(pdfBlob);

    //         if (action === 'preview') {
    //             window.open(fileURL, '_blank');
    //             toast.update(toastId, { 
    //                 render: "PDF preview opened!", 
    //                 type: "success", 
    //                 isLoading: false, 
    //                 autoClose: 3000 
    //             });
    //         } else {
    //             const link = document.createElement('a');
    //             link.href = fileURL;
    //             link.setAttribute('download', `Quotation-${quote.quoteId}.pdf`);
    //             document.body.appendChild(link);
    //             link.click();
    //             link.remove();
    //             window.URL.revokeObjectURL(fileURL);
    //             toast.update(toastId, { 
    //                 render: "PDF Downloaded!", 
    //                 type: "success", 
    //                 isLoading: false, 
    //                 autoClose: 3000 
    //             });
    //         }
    //     } catch (error) {
    //         console.error("PDF Handling Error:", error);
    //         if (error.response && error.response.data instanceof Blob) {
    //             try {
    //                 const errorText = await error.response.data.text();
    //                 const errorJson = JSON.parse(errorText);
    //                 toast.update(toastId, { 
    //                     render: errorJson.message || "PDF generation failed.", 
    //                     type: "error", 
    //                     isLoading: false, 
    //                     autoClose: 5000 
    //                 });
    //             } catch (e) {
    //                 toast.update(toastId, { 
    //                     render: "An unknown error occurred.", 
    //                     type: "error", 
    //                     isLoading: false, 
    //                     autoClose: 5000 
    //                 });
    //             }
    //         } else {
    //             toast.update(toastId, { 
    //                 render: error.message || "Failed to generate PDF.", 
    //                 type: "error", 
    //                 isLoading: false, 
    //                 autoClose: 5000 
    //             });
    //         }
    //     } finally {
    //         setIsShareOpen(false);
    //     }
    // };

    return (
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Package Quote Price</p>
                    <div className="mt-2 border border-green-500 bg-green-50 rounded-lg p-3">
                        <div className="inline-block bg-white border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                            Used for Conversion
                        </div>
                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-slate-800">{formatCurrency(quote.summary.totalSellingPrice)}</p>
                            <p className="text-slate-500">(inc. {quote.summary.gst?.value || 5}% GkST) /</p>
                            
                            <p className="text-slate-500">{formatCurrency(quote.summary.totalNetCost)} <span className="text-xs">(cost price)</span></p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Created {timeAgo(quote.createdAt)} by {quote.createdBy?.name || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/edit-quote/${quote.quoteId}`)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit Quote</button>
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
                                    onClick={() => handleOpenPDF('download')}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                    <FiDownload size={14}/> Download PDF
                                </button>
                                <button 
                                    onClick={() => handleOpenPDF('preview')}
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

            <div className="border border-slate-200 rounded-md p-3 mt-4 text-sm font-medium text-slate-700">
                {formatDate(quote.startDate)} for {quote.duration.split(', ')[1]} • {quote.pax} Adult(s)
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-8 mb-4">Services</h3>
            <div className="space-y-6">
                {/* Flights Section */}
                {quote.flights && quote.flights.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FaPlane className="text-blue-600" />
                            <h4 className="font-semibold text-slate-700">Flights</h4>
                        </div>
                        <div className="pl-8 text-sm space-y-2">
                            {quote.flights.map((flight, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 pb-2 border-b last:border-b-0">
                                    <div className="col-span-4">
                                        <p className="font-semibold">{flight.airline} {flight.flightNumber}</p>
                                        <p className="text-xs">{flight.from?.name} to {flight.to?.name}</p>
                                    </div>
                                    <div className="col-span-4">
                                        <p>{formatDate(flight.departureTime, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} - {formatDate(flight.arrivalTime, { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="col-span-2">{flight.flightClass}</div>
                                    <div className="col-span-2 text-right font-semibold">{formatCurrency(flight.givenPrice)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accommodation Section */}
                {quote.hotelDetails && quote.hotelDetails.entries.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FaBed className="text-blue-600" />
                            <h4 className="font-semibold text-slate-700">Accommodation</h4>
                        </div>
                        <div className="pl-8 text-sm">
                            <div className="grid grid-cols-12 gap-4 font-semibold text-slate-600 mb-2">
                                <div className="col-span-1">Night</div>
                                <div className="col-span-4">Hotel</div>
                                <div className="col-span-2">Meal</div>
                                <div className="col-span-3">Rooms</div>
                                <div className="col-span-2 text-right">Price</div>
                            </div>
                            {quote.hotelDetails.entries.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 py-2 border-b last:border-b-0">
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
                            {quote.hotelDetails.specialInclusions?.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                    <h5 className="font-semibold text-xs uppercase text-slate-500 mb-1">Hotel Special Inclusions</h5>
                                    {quote.hotelDetails.specialInclusions.map((inc, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-4">
                                            <div className="col-span-1">{inc.night}</div>
                                            <div className="col-span-9">
                                                <p className="font-semibold">{inc.service}</p>
                                                <p className="text-xs">{inc.comments}</p>
                                            </div>
                                            <div className="col-span-2 text-right font-semibold">
                                                {formatCurrency(inc.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transport Section */}
                {quote.transportDetails && quote.transportDetails.entries.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FaCar className="text-blue-600" />
                            <h4 className="font-semibold text-slate-700">Transport</h4>
                        </div>
                        <div className="pl-8 text-sm space-y-2">
                            {quote.transportDetails.entries.map((entry, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 pb-2 border-b last:border-b-0">
                                    <div className="col-span-4">
                                        <p className="font-semibold">{entry.serviceName}</p>
                                        <p className="text-xs">{entry.route}</p>
                                    </div>
                                    <div className="col-span-6">
                                        {entry.transportItems.map(item => `${item.qty} x ${item.cabDetails}`).join(', ')}
                                    </div>
                                    <div className="col-span-2 text-right font-semibold">
                                        {formatCurrency(entry.transportItems.reduce((acc, item) => acc + item.givenPrice * item.qty, 0))}
                                    </div>
                                </div>
                            ))}
                        </div>
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
        </div>
    );
};

// --- VIEW FOR A PRE-CONVERSION QUOTE ---
const PreConversionQuoteView = ({ quote, navigate, convertedQuoteId }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    
    const totalHotelCost = (quote.hotelDetails?.entries?.reduce((acc, item) => acc + (item.sellingPrice || 0) * (item.stayNights?.length || 1), 0) || 0) +
                         (quote.hotelDetails?.specialInclusions?.reduce((acc, item) => acc + (item.price || 0), 0) || 0);

    const totalTransportCost = (quote.transportDetails?.entries?.reduce((acc, entry) => {
        const numDays = entry.selectedDays?.length || 1;
        const entryTotal = entry.transportItems?.reduce((itemAcc, item) => itemAcc + (item.givenPrice || 0) * item.qty, 0) || 0;
        return acc + (entryTotal * numDays);
    }, 0) || 0) + (quote.transportDetails?.extraServices?.reduce((acc, service) => acc + (service.price || 0), 0) || 0);

    const totalFlightCost = quote.flights?.reduce((acc, flight) => acc + (flight.givenPrice || 0), 0) || 0;

    const totalServiceCost = totalHotelCost + totalTransportCost + totalFlightCost;

    const handleOpenPDF = async (action = 'preview') => {
        const token = sessionStorage.getItem('token');
        if (!token) { toast.error("Authentication error."); return; }
        
        const toastId = toast.loading(`Generating your PDF for ${action}...`);

        try {
            const response = await axios.get(`${API_BASE_URL}/quotations/${quote.quoteId}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const pdfBlob = response.data;
            if (pdfBlob.type !== "application/pdf") {
                throw new Error("Server did not return a valid PDF file.");
            }

            const fileURL = window.URL.createObjectURL(pdfBlob);

            if (action === 'preview') {
                window.open(fileURL, '_blank');
                toast.update(toastId, { 
                    render: "PDF preview opened!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
            } else {
                const link = document.createElement('a');
                link.href = fileURL;
                link.setAttribute('download', `Quotation-${quote.quoteId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(fileURL);
                toast.update(toastId, { 
                    render: "PDF Downloaded!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
            }
        } catch (error) {
            console.error("PDF Handling Error:", error);
            if (error.response && error.response.data instanceof Blob) {
                try {
                    const errorText = await error.response.data.text();
                    const errorJson = JSON.parse(errorText);
                    toast.update(toastId, { 
                        render: errorJson.message || "PDF generation failed.", 
                        type: "error", 
                        isLoading: false, 
                        autoClose: 5000 
                    });
                } catch (e) {
                    toast.update(toastId, { 
                        render: "An unknown error occurred.", 
                        type: "error", 
                        isLoading: false, 
                        autoClose: 5000 
                    });
                }
            } else {
                toast.update(toastId, { 
                    render: error.message || "Failed to generate PDF.", 
                    type: "error", 
                    isLoading: false, 
                    autoClose: 5000 
                });
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
    {/* This correctly displays the final rounded price */}
    <p className="text-3xl font-bold text-slate-800">{formatCurrency(quote.summary.totalSellingPrice)}</p>
    
    <p className="text-slate-500">(inc. {quote.summary.gst?.value || 5}% GST) /</p>
    
    {/* This now displays the subtotal with markup */}
    <p className="text-slate-500">
        {formatCurrency(quote.summary?.subtotalWithMarkup)} 
        <span className="text-xs"> (subtotal with markup)</span>
    </p>
</div>
                    <p className="text-xs text-slate-400 mt-2">Created {timeAgo(quote.createdAt)} by {quote.createdBy?.name || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/edit-quote/${quote.quoteId}`)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit Quote</button>
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
                                    onClick={() => handleOpenPDF('download')}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                    <FiDownload size={14}/> Download PDF
                                </button>
                                <button 
                                    onClick={() => handleOpenPDF('preview')}
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
                <button 
                    className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    onClick={() => navigate(`/convert-trip/${quote._id}`)}
                    disabled={!!convertedQuoteId}
                >
                    Convert using Quote
                </button>
            </div>

            <div className="border border-slate-200 rounded-md p-3 mt-4 text-sm font-medium text-slate-700">
                {formatDate(quote.startDate)} for {quote.duration.split(', ')[1]} • {quote.pax} Adult(s)
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-8 mb-4">Services</h3>
            <div className="space-y-6">
                {/* Flights Section */}
                {quote.flights && quote.flights.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FaPlane className="text-blue-600" />
                            <h4 className="font-semibold text-slate-700">Flights</h4>
                        </div>
                        <div className="pl-8 text-sm space-y-2">
                            {quote.flights.map((flight, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 pb-2 border-b last:border-b-0">
                                    <div className="col-span-4">
                                        <p className="font-semibold">{flight.airline} {flight.flightNumber}</p>
                                        <p className="text-xs">{flight.from?.name} to {flight.to?.name}</p>
                                    </div>
                                    <div className="col-span-4">
                                        <p>{formatDate(flight.departureTime, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} - {formatDate(flight.arrivalTime, { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="col-span-2">{flight.flightClass}</div>
                                    <div className="col-span-2 text-right font-semibold">{formatCurrency(flight.givenPrice)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accommodation Section */}
                {quote.hotelDetails && quote.hotelDetails.entries.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FaBed className="text-blue-600" />
                            <h4 className="font-semibold text-slate-700">Accommodation</h4>
                        </div>
                        <div className="pl-8 text-sm">
                            <div className="grid grid-cols-12 gap-4 font-semibold text-slate-600 mb-2">
                                <div className="col-span-1">Night</div>
                                <div className="col-span-4">Hotel</div>
                                <div className="col-span-2">Meal</div>
                                <div className="col-span-3">Rooms</div>
                                <div className="col-span-2 text-right">Price</div>
                            </div>
                            {quote.hotelDetails.entries.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 py-2 border-b last:border-b-0">
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
                            {quote.hotelDetails.specialInclusions?.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                    <h5 className="font-semibold text-xs uppercase text-slate-500 mb-1">Hotel Special Inclusions</h5>
                                    {quote.hotelDetails.specialInclusions.map((inc, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-4">
                                            <div className="col-span-1">{inc.night}</div>
                                            <div className="col-span-9">
                                                <p className="font-semibold">{inc.service}</p>
                                                <p className="text-xs">{inc.comments}</p>
                                            </div>
                                            <div className="col-span-2 text-right font-semibold">
                                                {formatCurrency(inc.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transport Section */}
                {quote.transportDetails && quote.transportDetails.entries.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FaCar className="text-blue-600" />
                            <h4 className="font-semibold text-slate-700">Transport</h4>
                        </div>
                        <div className="pl-8 text-sm space-y-2">
                            {quote.transportDetails.entries.map((entry, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 pb-2 border-b last:border-b-0">
                                    <div className="col-span-4">
                                        <p className="font-semibold">{entry.serviceName}</p>
                                        <p className="text-xs">{entry.route}</p>
                                    </div>
                                    <div className="col-span-6">
                                        {entry.transportItems.map(item => `${item.qty} x ${item.cabDetails}`).join(', ')}
                                    </div>
                                    <div className="col-span-2 text-right font-semibold">
                                        {formatCurrency(entry.transportItems.reduce((acc, item) => acc + item.givenPrice * item.qty, 0))}
                                    </div>
                                </div>
                            ))}
                        </div>
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
        </div>
    );
};

// --- MAIN COMPONENT ---
const QuotationDetails = ({ quote, convertedQuoteId }) => {
    const navigate = useNavigate();

    if (!quote) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-700">No Quotations Yet</h3>
                <p className="text-slate-500 mt-2">The latest quote details will appear here once created.</p>
            </div>
        );
    }
    
    // This boolean decides which view to render
    const isConvertedQuote = quote._id === convertedQuoteId;

    if (isConvertedQuote) {
        return <ConvertedQuoteView quote={quote} navigate={navigate} />;
    }

    return <PreConversionQuoteView quote={quote} navigate={navigate} convertedQuoteId={convertedQuoteId} />;
};

export default QuotationDetails;