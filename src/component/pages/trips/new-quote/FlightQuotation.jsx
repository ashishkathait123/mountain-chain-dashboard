import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { FaPlaneDeparture } from 'react-icons/fa';
import Select from 'react-select';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- Helper Functions & Components ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
        <input {...props} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
    </div>
);

const selectStyles = {
    control: (p) => ({ ...p, minHeight: '40px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem' }),
    menu: (p) => ({ ...p, zIndex: 20 }),
    placeholder: (p) => ({ ...p, color: '#9ca3af' })
};

// --- Main Flight Quotation Component ---
const FlightQuotation = ({ queryData, flights, onUpdate, onAdd, onRemove }) => {
    
    const [allDestinations, setAllDestinations] = useState([]);
    const [isDestinationsLoading, setIsDestinationsLoading] = useState(true);

    const airlineOptions = [
        { value: 'IndiGo', label: 'IndiGo' }, { value: 'Air India', label: 'Air India' }, { value: 'SpiceJet', label: 'SpiceJet' },
        { value: 'Vistara', label: 'Vistara' }, { value: 'AirAsia India', label: 'AirAsia India' }, { value: 'Go First', label: 'Go First' },
    ];

    useEffect(() => {
        const fetchDestinations = async () => {
            setIsDestinationsLoading(true);
            try {
                const response = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist');
                setAllDestinations(response.data.data || []);
            } catch (error) { toast.error("Could not fetch destination list for flights."); } finally { setIsDestinationsLoading(false); }
        };
        fetchDestinations();
    }, []);

    const destinationOptions = useMemo(() => 
        allDestinations.map(dest => ({ value: dest.name, label: `${dest.name}, ${dest.country}` })),
        [allDestinations]
    );

    // --- RE-INTRODUCED: Calculate total for this section from props ---
    const flightsTotal = useMemo(() => {
        return flights.reduce((total, flight) => total + (Number(flight.givenPrice) || 0), 0);
    }, [flights]);

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm border border-slate-200 font-sans">
            <div className="max-w-screen-xl mx-auto">
                <header className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0"><FaPlaneDeparture size={24} /></div>
                    <div><h1 className="text-2xl font-bold text-slate-800">Flight Details</h1><p className="text-sm text-slate-500">Please provide flight details for this quote if included.</p></div>
                </header>
                <div className="space-y-6">
                    {flights.map(flight => (
                        <div key={flight.id} className="p-4 rounded-lg border border-slate-200 shadow-inner relative bg-slate-50/50">
                             {flights.length > 1 && (<button onClick={() => onRemove(flight.id)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600" title="Remove Flight"><FiX size={18} /></button>)}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-6 gap-y-4">
                                <div className="lg:col-span-3 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">From</label><Select options={destinationOptions} isLoading={isDestinationsLoading} value={destinationOptions.find(opt => opt.value === flight.from)} onChange={opt => onUpdate(flight.id, 'from', opt.value)} styles={selectStyles} placeholder="Select origin..." /></div>
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Destination</label><Select options={destinationOptions} isLoading={isDestinationsLoading} value={destinationOptions.find(opt => opt.value === flight.to)} onChange={opt => onUpdate(flight.id, 'to', opt.value)} styles={selectStyles} placeholder="Select destination..."/></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Departure Time" type="datetime-local" value={flight.departureTime} onChange={e => onUpdate(flight.id, 'departureTime', e.target.value)} />
                                        <InputField label="Arrival Time" type="datetime-local" value={flight.arrivalTime} onChange={e => onUpdate(flight.id, 'arrivalTime', e.target.value)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                     <InputField label="Cost Price (INR)" type="number" placeholder="0" value={flight.costPrice} onChange={e => onUpdate(flight.id, 'costPrice', e.target.value)} />
                                     <InputField label="Given/Selling Price (INR)" type="number" placeholder="0" value={flight.givenPrice} onChange={e => onUpdate(flight.id, 'givenPrice', e.target.value)} />
                                </div>
                                <div className="lg:col-span-3 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Airline</label><Select options={airlineOptions} value={airlineOptions.find(opt => opt.value === flight.airline)} onChange={opt => onUpdate(flight.id, 'airline', opt.value)} styles={selectStyles} placeholder="Select airline..." /></div>
                                        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Class</label><select value={flight.flightClass} onChange={e => onUpdate(flight.id, 'flightClass', e.target.value)} className="w-full text-sm h-[40px] border-slate-300 rounded-md shadow-sm"><option>Economy</option><option>Premium Economy</option><option>Business Class</option><option>First Class</option></select></div>
                                        <InputField label="Flight Number" placeholder="e.g. 6E-2022" value={flight.flightNumber} onChange={e => onUpdate(flight.id, 'flightNumber', e.target.value)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4"><InputField label="Comments" placeholder="Any comments regarding service" value={flight.comments} onChange={e => onUpdate(flight.id, 'comments', e.target.value)} /></div>
                                <div className="lg:col-span-3"><div className="grid grid-cols-3 gap-4">
                                    <InputField label="No. of Adults" type="number" min="0" value={flight.adults} onChange={e => onUpdate(flight.id, 'adults', e.target.value)} />
                                    <InputField label="Children (2-12 yrs)" type="number" min="0" value={flight.children} onChange={e => onUpdate(flight.id, 'children', e.target.value)} />
                                    <InputField label="Infants (Below 2 yrs)" type="number" min="0" value={flight.infants} onChange={e => onUpdate(flight.id, 'infants', e.target.value)} />
                                </div></div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* --- RE-INTRODUCED: Total Badge for this section --- */}
                <div className="mt-6 flex justify-between items-center">
                    <button onClick={onAdd} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                        <FiPlus className="mr-1"/> Add More Flight
                    </button>
                    {flightsTotal > 0 && (
                        <div className="bg-amber-100 border border-amber-300 text-amber-800 font-bold py-2 px-4 rounded-lg">
                            Flight's Total: {formatCurrency(flightsTotal)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightQuotation;