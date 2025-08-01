import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaBed, FaExclamationTriangle } from 'react-icons/fa';
import { FiPlus, FiCopy, FiTrash2, FiMessageSquare, FiRefreshCw, FiX } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ... (Helper components remain the same)
const formatCurrency = (amount) => { if (typeof amount !== 'number' || isNaN(amount)) return '₹0'; return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount); };
const InputField = ({ label, ...props }) => ( <div> <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label> <input {...props} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50 disabled:cursor-not-allowed" /> </div> );
const selectStyles = { control: (p) => ({ ...p, minHeight: '40px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem' }), menu: (p) => ({ ...p, zIndex: 20 }), placeholder: (p) => ({ ...p, color: '#9ca3af' }) };

const HotelQuotation = ({ 
    queryData, hotelEntries, specialInclusions,
    onUpdateEntry, onAddEntry, onRemoveEntry, onDuplicateEntry,
    onUpdateInclusion, onAddInclusion, onRemoveInclusion,
}) => {
    const [allHotels, setAllHotels] = useState([]);
    const [tripDates, setTripDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/hotel/gethotels');
                setAllHotels(res.data.hotels || []);
            } catch (error) { toast.error("Failed to fetch hotel data."); } finally { setIsLoading(false); }
        };
        if (queryData?.startDate && queryData?.numberOfNights) {
            const startDate = new Date(queryData.startDate);
            const dates = Array.from({ length: queryData.numberOfNights }, (_, i) => { const d = new Date(startDate); d.setDate(startDate.getDate() + i); return d; });
            setTripDates(dates);
        }
        fetchData();
    }, [queryData]);

    // --- RE-INTRODUCED: Calculate total for this section ---
    const accommodationTotal = useMemo(() => {
        const hotelSelling = hotelEntries.reduce((acc, entry) => acc + ((Number(entry.sellingPrice) || 0) * entry.stayNights.length), 0);
        const inclusionsSelling = specialInclusions.reduce((acc, inclusion) => acc + (Number(inclusion.price) || 0), 0);
        return hotelSelling + inclusionsSelling;
    }, [hotelEntries, specialInclusions]);
    
    const hotelOptions = useMemo(() => { if (!queryData?.destination?.name) return []; const destName = queryData.destination.name.toLowerCase(); return allHotels.filter(h => h.city?.toLowerCase() === destName).map(h => ({ value: h, label: h.name })); }, [allHotels, queryData]);
    const inclusionHotelOptions = useMemo(() => hotelEntries.filter(e => e.selectedHotel).map(e => ({ value: e.id, label: e.selectedHotel.name })), [hotelEntries]);
    const getNightOptionsForHotel = (hotelEntryId) => { const entry = hotelEntries.find(e => e.id === hotelEntryId); if (!entry) return []; return entry.stayNights.map(i => ({ value: i, label: `${i + 1}N (${tripDates[i].toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })})` })); };
    const getRoomOptions = (h) => h?.rooms.map((r, i) => ({ value: r, label: r.roomTypes.join(', ') || `Config ${i + 1}` })) || [];
    const getMealOptions = (h) => h?.meals.map(m => ({ value: m, label: m })) || [];
    const calculateNetRate = (entry) => { if (!entry.selectedRoomConfig) return 0; const { BasePrice=0, AWEB=0, CWEB=0, CWoEB=0 } = entry.selectedRoomConfig; return (BasePrice * entry.numRooms) + (AWEB * entry.numAWEB) + (CWEB * entry.numCWEB) + (CWoEB * entry.numCNB); };

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm border border-slate-200">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <div className="max-w-screen-xl mx-auto">
                <header className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white"><FaBed size={24} /></div>
                    <div><h1 className="text-2xl font-bold text-slate-800">Hotels</h1><p className="text-sm text-slate-500">Add hotel details for <span className='font-bold'>{queryData?.destination?.name}</span>.</p><p className="text-xs text-slate-400 mt-1">💡 Tip: Use <span className="font-semibold">Duplicate</span> to quickly add similar hotel stays.</p></div>
                </header>
                <div className="space-y-6">
                    {hotelEntries.map((entry) => {
                        const netRate = calculateNetRate(entry);
                        const sellingPrice = entry.sellingPrice;
                        let priceColorClass = 'bg-yellow-100 border-yellow-400 text-yellow-800';
                        if (sellingPrice > netRate) priceColorClass = 'bg-green-100 border-green-400 text-green-800';
                        if (sellingPrice < netRate && sellingPrice > 0) priceColorClass = 'bg-red-100 border-red-400 text-red-800';
                        return (
                        <div key={entry.id} className="bg-white rounded-lg shadow-inner border border-slate-200">
                           {/* ... JSX for hotel entry inputs ... (unchanged) */}
                           <div className="grid grid-cols-1 xl:grid-cols-3 gap-x-6 p-4">
                                <div className="xl:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4">
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Stay Nights</label><Select isMulti options={tripDates.map((d, i) => ({ value: i, label: `${i + 1}N (${d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})` }))} value={entry.stayNights.map(n => ({ value: n, label: `${n + 1}N (${tripDates[n].toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})` }))} onChange={opts => onUpdateEntry(entry.id, 'stayNights', opts.map(o => o.value))} styles={selectStyles} placeholder="Select night(s)..." /></div>
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Hotel</label><Select options={hotelOptions} value={entry.selectedHotel ? { value: entry.selectedHotel, label: entry.selectedHotel.name } : null} onChange={opt => onUpdateEntry(entry.id, 'selectedHotel', opt.value)} styles={selectStyles} placeholder="Type to search..." isLoading={isLoading} noOptionsMessage={() => 'No hotels found.'}/>{entry.selectedHotel && <p className="text-xs text-slate-500 mt-1">{entry.selectedHotel.city} • {entry.selectedHotel.stars} Star</p>}</div>
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Meal Plan</label><Select options={getMealOptions(entry.selectedHotel)} value={entry.mealPlan ? { value: entry.mealPlan, label: entry.mealPlan } : null} onChange={opt => onUpdateEntry(entry.id, 'mealPlan', opt.value)} isDisabled={!entry.selectedHotel} styles={selectStyles} placeholder="Select..."/></div>
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Room Type</label><Select options={getRoomOptions(entry.selectedHotel)} value={entry.selectedRoomConfig ? { value: entry.selectedRoomConfig, label: entry.selectedRoomConfig.roomTypes.join(', ') } : null} onChange={opt => onUpdateEntry(entry.id, 'selectedRoomConfig', opt.value)} isDisabled={!entry.selectedHotel} styles={selectStyles} placeholder="Select..."/></div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-4 mt-4 pt-3 border-t border-slate-100">
                                        <InputField label="Pax/room (WoEB)" type="number" value={entry.paxPerRoom} onChange={e => onUpdateEntry(entry.id, 'paxPerRoom', parseInt(e.target.value) || 2)} disabled={!entry.selectedRoomConfig} />
                                        <InputField label="No. of rooms" type="number" min="1" value={entry.numRooms} onChange={e => onUpdateEntry(entry.id, 'numRooms', Math.max(1, parseInt(e.target.value) || 1))} disabled={!entry.selectedRoomConfig} />
                                        <InputField label={`AWEB (${formatCurrency(entry.selectedRoomConfig?.AWEB)})`} type="number" min="0" value={entry.numAWEB} onChange={e => onUpdateEntry(entry.id, 'numAWEB', parseInt(e.target.value) || 0)} disabled={!entry.selectedRoomConfig} />
                                        <InputField label={`CWEB (${formatCurrency(entry.selectedRoomConfig?.CWEB)})`} type="number" min="0" value={entry.numCWEB} onChange={e => onUpdateEntry(entry.id, 'numCWEB', parseInt(e.target.value) || 0)} disabled={!entry.selectedRoomConfig} />
                                        <InputField label={`CNB (${formatCurrency(entry.selectedRoomConfig?.CWoEB)})`} type="number" min="0" value={entry.numCNB} onChange={e => onUpdateEntry(entry.id, 'numCNB', parseInt(e.target.value) || 0)} disabled={!entry.selectedRoomConfig} />
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Comp Child</label><div className="w-full text-sm h-10 flex items-center px-3 bg-slate-50 rounded-md text-slate-700">{entry.selectedHotel ? `Upto ${entry.selectedHotel.childrenAgeRangeMax || 'N/A'}y` : 'N/A'}</div></div>
                                    </div>
                                </div>
                                <div className="xl:col-span-1 mt-4 xl:mt-0 xl:border-l xl:pl-4">
                                     <div className="bg-slate-50/80 rounded-md p-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 px-1"><span>Date</span><span>Net Rate</span><span>Given Price</span></div>
                                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {entry.stayNights.length > 0 ? entry.stayNights.map(nightIndex => (
                                                <div key={nightIndex} className="flex justify-between items-center text-sm">
                                                    <div><p className="font-semibold text-slate-800">{tripDates[nightIndex].toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p><p className="text-xs text-slate-500">{tripDates[nightIndex].toLocaleDateString('en-US', { weekday: 'long' })}</p></div>
                                                    <span className="font-semibold text-orange-600">{formatCurrency(netRate)}</span>
                                                    <div className="relative"><span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${priceColorClass.replace('bg-', 'text-')}`}>INR</span><input type="number" value={entry.sellingPrice} onChange={e => onUpdateEntry(entry.id, 'sellingPrice', parseInt(e.target.value) || 0)} className={`font-bold rounded-md h-9 w-28 text-right pr-2 pl-9 text-sm border ${priceColorClass}`} />{sellingPrice < netRate && sellingPrice > 0 && <FaExclamationTriangle className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" title="Selling price is lower than net rate!"/>}</div>
                                                </div>
                                            )) : <p className="text-center text-xs text-slate-500 py-4">Select nights to see pricing.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                           <div className="flex items-center space-x-4 mt-3 p-4 border-t border-slate-100 bg-slate-50/70 rounded-b-lg"><button onClick={() => onDuplicateEntry(entry.id)} className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"><FiCopy className="mr-1"/>Duplicate</button>{hotelEntries.length > 1 && <button onClick={() => onRemoveEntry(entry.id)} className="flex items-center text-xs font-semibold text-red-500 hover:text-red-700"><FiTrash2 className="mr-1"/>Remove</button>}</div>
                        </div>
                        );
                    })}
                </div>
                <div className="mt-8"><button onClick={onAddEntry} className="w-full md:w-auto flex items-center justify-center bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"><FiPlus className="mr-2"/>Add Hotel Stay</button></div>
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Any special inclusions in hotels</h2>
                    <p className="text-sm text-slate-500 mb-4">Add any extra services for hotels e.g. special dinner, honeymoon cake etc.</p>
                    <div className="space-y-3">{specialInclusions.map((inclusion, index) => (<div key={inclusion.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center">
                        <div className="col-span-12 sm:col-span-3">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Service</label>}<input type="text" placeholder="e.g. Honeymoon Cake" value={inclusion.service} onChange={e => onUpdateInclusion(inclusion.id, 'service', e.target.value)} className="w-full text-sm border-slate-300 rounded-md"/></div>
                        <div className="col-span-12 sm:col-span-2">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Hotel</label>}<Select options={inclusionHotelOptions} value={inclusionHotelOptions.find(opt => opt.value === inclusion.hotelEntryId)} onChange={opt => onUpdateInclusion(inclusion.id, 'hotelEntryId', opt.value)} styles={selectStyles} placeholder="Select..." noOptionsMessage={() => 'Add a hotel first'}/></div>
                        <div className="col-span-12 sm:col-span-2">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Night</label>}<Select options={getNightOptionsForHotel(inclusion.hotelEntryId)} value={getNightOptionsForHotel(inclusion.hotelEntryId).find(opt => opt.value === inclusion.night)} onChange={opt => onUpdateInclusion(inclusion.id, 'night', opt.value)} styles={selectStyles} placeholder="Select..." isDisabled={!inclusion.hotelEntryId} noOptionsMessage={() => 'Select nights for hotel'}/></div>
                        <div className="col-span-6 sm:col-span-2">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Total Price (INR)</label>}<input type="number" placeholder="e.g. 1200" value={inclusion.price} onChange={e => onUpdateInclusion(inclusion.id, 'price', parseInt(e.target.value) || 0)} className="w-full text-sm border-slate-300 rounded-md"/></div>
                        <div className="col-span-6 sm:col-span-2">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Comments</label>}<input type="text" placeholder="Any comments" value={inclusion.comments} onChange={e => onUpdateInclusion(inclusion.id, 'comments', e.target.value)} className="w-full text-sm border-slate-300 rounded-md"/></div>
                        <div className="col-span-12 sm:col-span-1 flex items-end justify-start sm:justify-center"><button onClick={() => onRemoveInclusion(inclusion.id)} className="p-2 text-slate-400 hover:text-red-600" title="Remove Service"><FiX size={18}/></button></div>
                    </div>))}</div>
                     <div className="mt-4"><button onClick={onAddInclusion} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"><FiPlus className="mr-1"/> Add Service</button></div>
                </div>
                {/* --- RE-INTRODUCED: Accommodation Total Badge --- */}
                <div className="mt-8 flex justify-end">
                    <div className="bg-amber-100 border border-amber-300 text-amber-800 font-bold py-2 px-4 rounded-lg">
                        Accommodation's Total: {formatCurrency(accommodationTotal)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelQuotation;