import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaBed, FaExclamationTriangle } from 'react-icons/fa';
import { FiPlus, FiCopy, FiTrash2, FiMoon, FiMapPin, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TransportQuotation from './TransportQuotation';
// --- Reusable UI Components & Helpers ---

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

// A reusable styled input field for consistency
const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
        <input {...props} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50 disabled:cursor-not-allowed" />
    </div>
);

const selectStyles = {
    control: (p) => ({ ...p, minHeight: '40px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem' }),
    menu: (p) => ({ ...p, zIndex: 20 }),
    placeholder: (p) => ({ ...p, color: '#9ca3af' })
};


// --- Main Quotation Component ---

const HotelQuotation = () => {
    const [hotelEntries, setHotelEntries] = useState(() => [{
        id: 1,
        stayNights: [],
        selectedHotel: null,
        selectedRoomConfig: null,
        mealPlan: null,
        numRooms: 1,
        paxPerRoom: 2,
        numAWEB: 0,
        numCWEB: 0,
        numCNB: 0,
        sellingPrice: 0,
    }]);
    const [allHotels, setAllHotels] = useState([]);
    const [tripDates, setTripDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/hotel/gethotels');
                setAllHotels(res.data.hotels || []);
            } catch (error) {
                toast.error("Failed to fetch hotel data.");
            } finally {
                setIsLoading(false);
            }
        };

        const startDate = new Date('2025-10-01');
        const numberOfNights = 5;
        const dates = Array.from({ length: numberOfNights }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });
        setTripDates(dates);
        fetchData();
    }, []);

    // --- State & Calculation Logic ---
    const updateEntry = (id, field, value) => {
        setHotelEntries(prev => prev.map(entry => {
            if (entry.id === id) {
                const newEntry = { ...entry, [field]: value };
                if (field === 'selectedHotel') {
                    newEntry.mealPlan = null;
                    newEntry.selectedRoomConfig = null;
                }
                if (field === 'selectedRoomConfig' && value) {
                    newEntry.sellingPrice = calculateNetRate(newEntry);
                }
                return newEntry;
            }
            return entry;
        }));
    };
    
    const calculateNetRate = (entry) => {
        if (!entry.selectedRoomConfig || entry.numRooms <= 0) return 0;
        const { BasePrice = 0, AWEB = 0, CWEB = 0, CWoEB = 0 } = entry.selectedRoomConfig;
        return (BasePrice * entry.numRooms) + (AWEB * entry.numAWEB) + (CWEB * entry.numCWEB) + (CWoEB * entry.numCNB);
    };

    const totals = useMemo(() => {
        return hotelEntries.reduce((acc, entry) => {
            const nightlyNetRate = calculateNetRate(entry);
            const entryNetTotal = nightlyNetRate * entry.stayNights.length;
            const entrySellingTotal = entry.sellingPrice * entry.stayNights.length;
            
            acc.net += entryNetTotal;
            acc.selling += entrySellingTotal;
            return acc;
        }, { net: 0, selling: 0 });
    }, [hotelEntries]);


    // --- Component Actions ---
    const addHotelEntry = () => {
        const newId = (hotelEntries[hotelEntries.length - 1]?.id || 0) + 1;
        setHotelEntries(prev => [...prev, {
            id: newId, stayNights: [], selectedHotel: null, selectedRoomConfig: null, mealPlan: null, 
            numRooms: 1, paxPerRoom: 2, numAWEB: 0, numCWEB: 0, numCNB: 0, sellingPrice: 0,
        }]);
    };

    const duplicateEntry = (id) => {
        const entryToDuplicate = hotelEntries.find(e => e.id === id);
        if (entryToDuplicate) {
            const newId = (hotelEntries[hotelEntries.length - 1]?.id || 0) + 1;
            setHotelEntries(prev => [...prev, { ...entryToDuplicate, id: newId, stayNights: [] }]);
        }
    };

    const removeEntry = (id) => setHotelEntries(prev => prev.filter(e => e.id !== id));
    
    // --- Select Options ---
    const hotelOptions = useMemo(() => allHotels.map(h => ({ value: h, label: h.name })), [allHotels]);
    const getRoomOptions = (h) => h?.rooms.map((r, i) => ({ value: r, label: r.roomTypes.join(', ') || `Config ${i + 1}` })) || [];
    const getMealOptions = (h) => h?.meals.map(m => ({ value: m, label: m })) || [];

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div className="max-w-screen-xl mx-auto">
                <header className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <FaBed size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Hotels</h1>
                        <p className="text-sm text-slate-500">Please add hotel details with services and selling cost for each.</p>
                        <p className="text-xs text-slate-400 mt-1">💡 Tip: Use <span className="font-semibold">Duplicate</span> to quickly add similar hotel stays for different nights.</p>
                    </div>
                </header>

                <div className="space-y-6">
                    {hotelEntries.map((entry) => {
                        const netRate = calculateNetRate(entry);
                        const sellingPrice = entry.sellingPrice;
                        const { BasePrice = 0, AWEB = 0, CWEB = 0, CWoEB = 0 } = entry.selectedRoomConfig || {};

                        let priceColorClass = 'bg-yellow-100 border-yellow-400 text-yellow-800';
                        if (sellingPrice > netRate) priceColorClass = 'bg-green-100 border-green-400 text-green-800';
                        if (sellingPrice < netRate && sellingPrice > 0) priceColorClass = 'bg-red-100 border-red-400 text-red-800';

                        return (
                        <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-x-6 p-4">
                                {/* --- INPUTS SECTION (Left & Center) --- */}
                                <div className="xl:col-span-2">
                                    {/* Main Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Stay Nights</label>
                                            <Select isMulti options={tripDates.map((d, i) => ({ value: i, label: `${i + 1}N (${d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})` }))} value={entry.stayNights.map(n => ({ value: n, label: `${n + 1}N (${tripDates[n].toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})` }))} onChange={opts => updateEntry(entry.id, 'stayNights', opts.map(o => o.value))} styles={selectStyles} placeholder="Select night(s)..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Hotel</label>
                                            <Select options={hotelOptions} value={entry.selectedHotel ? { value: entry.selectedHotel, label: entry.selectedHotel.name } : null} onChange={opt => updateEntry(entry.id, 'selectedHotel', opt.value)} styles={selectStyles} placeholder="Type to search..." isLoading={isLoading} />
                                            {entry.selectedHotel && <p className="text-xs text-slate-500 mt-1">{entry.selectedHotel.city} • {entry.selectedHotel.stars} Star Property</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Meal Plan</label>
                                            <Select options={getMealOptions(entry.selectedHotel)} value={entry.mealPlan ? { value: entry.mealPlan, label: entry.mealPlan } : null} onChange={opt => updateEntry(entry.id, 'mealPlan', opt.value)} isDisabled={!entry.selectedHotel} styles={selectStyles} placeholder="Select..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Room Type</label>
                                            <Select options={getRoomOptions(entry.selectedHotel)} value={entry.selectedRoomConfig ? { value: entry.selectedRoomConfig, label: entry.selectedRoomConfig.roomTypes.join(', ') } : null} onChange={opt => updateEntry(entry.id, 'selectedRoomConfig', opt.value)} isDisabled={!entry.selectedHotel} styles={selectStyles} placeholder="Select..." />
                                        </div>
                                    </div>
                                    
                                    {/* UPDATED: Occupancy and Rooms Section */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-4 mt-4 pt-3 border-t border-slate-100">
                                        <InputField label="Pax/room (WoEB)" type="number" value={entry.paxPerRoom} onChange={e => updateEntry(entry.id, 'paxPerRoom', parseInt(e.target.value) || 2)} disabled={!entry.selectedRoomConfig} />
                                        <InputField label="No. of rooms" type="number" min="1" value={entry.numRooms} onChange={e => updateEntry(entry.id, 'numRooms', Math.max(1, parseInt(e.target.value) || 1))} disabled={!entry.selectedRoomConfig} />
                                        <InputField label={`AWEB (${formatCurrency(AWEB)})`} type="number" min="0" value={entry.numAWEB} onChange={e => updateEntry(entry.id, 'numAWEB', parseInt(e.target.value) || 0)} disabled={!entry.selectedRoomConfig} />
                                        <InputField label={`CWEB (${formatCurrency(CWEB)})`} type="number" min="0" value={entry.numCWEB} onChange={e => updateEntry(entry.id, 'numCWEB', parseInt(e.target.value) || 0)} disabled={!entry.selectedRoomConfig} />
                                        <InputField label={`CNB (${formatCurrency(CWoEB)})`} type="number" min="0" value={entry.numCNB} onChange={e => updateEntry(entry.id, 'numCNB', parseInt(e.target.value) || 0)} disabled={!entry.selectedRoomConfig} />
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Comp Child</label>
                                            <div className="w-full text-sm h-10 flex items-center px-3 bg-slate-50 rounded-md text-slate-700">
                                                {entry.selectedHotel ? `Upto ${entry.selectedHotel.childrenAgeRangeMax || 'N/A'}y` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* End of Updated Section */}

                                </div>
                                
                                {/* --- PRICING SECTION (Right) --- */}
                                <div className="xl:col-span-1 mt-4 xl:mt-0 xl:border-l xl:pl-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-slate-700">Prices</h3>
                                        <div className="flex space-x-3 text-slate-500">
                                            <FiMessageSquare size={16} className="cursor-pointer hover:text-blue-600" title="Add Note"/>
                                            <FiRefreshCw size={16} className="cursor-pointer hover:text-blue-600" title="Refresh Prices"/>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/80 rounded-md p-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 px-1">
                                            <span>Date</span>
                                            <span>Net Rate</span>
                                            <span>Given Price</span>
                                        </div>
                                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {entry.stayNights.length > 0 ? entry.stayNights.map(nightIndex => (
                                                <div key={nightIndex} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{tripDates[nightIndex].toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                                        <p className="text-xs text-slate-500">{tripDates[nightIndex].toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                                    </div>
                                                    <span className="font-semibold text-orange-600">{formatCurrency(netRate)}</span>
                                                    <div className="relative">
                                                        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${priceColorClass.replace('bg-', 'text-')}`}>INR</span>
                                                        <input type="number" value={entry.sellingPrice} onChange={e => updateEntry(entry.id, 'sellingPrice', parseInt(e.target.value) || 0)} className={`font-bold rounded-md h-9 w-28 text-right pr-2 pl-9 text-sm border ${priceColorClass}`} />
                                                        {sellingPrice < netRate && sellingPrice > 0 && <FaExclamationTriangle className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" title="Selling price is lower than net rate!"/>}
                                                    </div>
                                                </div>
                                            )) : <p className="text-center text-xs text-slate-500 py-4">Select nights to see pricing details.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* --- ACTIONS FOOTER --- */}
                            <div className="flex items-center space-x-4 mt-3 p-4 border-t border-slate-100">
                                <button onClick={() => duplicateEntry(entry.id)} className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"><FiCopy className="mr-1"/>Duplicate</button>
                                {hotelEntries.length > 1 && <button onClick={() => removeEntry(entry.id)} className="flex items-center text-xs font-semibold text-red-500 hover:text-red-700"><FiTrash2 className="mr-1"/>Remove</button>}
                            </div>
                        </div>
                        );
                    })}
                </div>

                <div className="mt-8">
                    <button onClick={addHotelEntry} className="w-full md:w-auto flex items-center justify-center bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
                        <FiPlus className="mr-2"/>Add Hotel
                    </button>
                </div>
                
                {/* --- GRAND TOTALS --- */}
                <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-6 bg-white p-4 rounded-xl shadow-lg border">
                    <div className="text-center md:text-right">
                        <p className="text-sm font-semibold text-slate-500">Total Net Cost</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.net)}</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm font-semibold text-slate-500">Total Selling Price</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.selling)}</p>
                    </div>
                     <div className="text-center md:text-right">
                        <p className="text-sm font-semibold text-slate-500">Total Profit / Loss</p>
                        <p className={`text-3xl font-bold ${totals.selling - totals.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(totals.selling - totals.net)}</p>
                    </div>
                </div>
            </div>
            <TransportQuotation/>
        </div>
    );
};

export default HotelQuotation;