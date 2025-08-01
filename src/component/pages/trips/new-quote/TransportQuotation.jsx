import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast, Toaster } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiRefreshCw, FiMessageSquare, FiCopy, FiX } from 'react-icons/fi';
import { FaBusAlt } from 'react-icons/fa';

// ... (Helper components remain the same)
const formatCurrency = (amount) => { if (typeof amount !== 'number' || isNaN(amount)) return 'N/A'; return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount); };
const selectStyles = { control: (p, { isDisabled }) => ({ ...p, minHeight: '40px', backgroundColor: isDisabled ? '#f1f5f9' : 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }), menu: (p) => ({ ...p, zIndex: 20 }), placeholder: (p) => ({...p, color: '#9ca3af'}) };


const TransportQuotation = ({
    queryData, dayEntries, extraServices, sameCabForAll,
    onUpdateDayEntry, onAddDayEntry, onRemoveDayEntry, onDuplicateDayEntry, onAddNextDayService,
    onUpdateTransportItem, onAddTransportItem, onRemoveTransportItem, onHandleDaySelection,
    onUpdateExtraService, onAddExtraService, onRemoveExtraService, onSetSameCabForAll
}) => {
    const [allTransports, setAllTransports] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [tripDates, setTripDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [globalCab, setGlobalCab] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [transportRes, suppliersRes] = await Promise.all([ axios.get('https://mountain-chain.onrender.com/mountainchain/api/transport/list'), axios.get('https://mountain-chain.onrender.com/mountainchain/api/suppliers') ]);
                setAllTransports(transportRes.data.data || []);
                setAllSuppliers(suppliersRes.data.data || []);
            } catch (error) { toast.error("Failed to fetch critical transport data."); } finally { setIsLoading(false); }
        };
        if (queryData?.startDate && queryData?.numberOfNights) {
            const startDate = new Date(queryData.startDate);
            const dates = Array.from({ length: queryData.numberOfNights + 1 }, (_, i) => { const d = new Date(startDate); d.setDate(startDate.getDate() + i); return d; });
            setTripDates(dates);
        }
        fetchData();
    }, [queryData]);

    useEffect(() => { if (sameCabForAll && globalCab) { dayEntries.forEach(entry => { entry.transportItems.forEach(item => { onUpdateTransportItem(entry.id, item.id, 'selectedCab', globalCab); }); }); } }, [globalCab, sameCabForAll, dayEntries, onUpdateTransportItem]);

    // --- RE-INTRODUCED: Calculate totals for this section ---
    const transportSectionTotals = useMemo(() => {
        const mainSelling = dayEntries.reduce((acc, entry) => {
            const numDays = entry.selectedDays.length || 1;
            const entryTotal = entry.transportItems.reduce((sum, item) => sum + ((Number(item.given) || 0) * item.qty), 0);
            return acc + (entryTotal * numDays);
        }, 0);
        const extrasSelling = extraServices.reduce((acc, service) => acc + (Number(service.price) || 0), 0);
        return { total: mainSelling + extrasSelling, extras: extrasSelling };
    }, [dayEntries, extraServices]);
    
    // ... (Memoized options and other functions remain the same)
    const transportRouteOptions = useMemo(() => { if (!queryData?.destination?._id || !allTransports.length) return []; const destId = queryData.destination._id; const relevant = allTransports.filter(t => t.tripDestinations?.includes(destId)); const unique = new Map(); relevant.forEach(t => { const key = `${t.fromCity}-${t.toCity}-${t.serviceName}`; if (!unique.has(key)) unique.set(key, { value: t, label: `${t.fromCity} to ${t.toCity} (${t.serviceName})` }); }); return Array.from(unique.values()); }, [allTransports, queryData]);
    const dayOptions = useMemo(() => tripDates.map((date, i) => ({ value: i, label: `Day ${i + 1} (${date.toLocaleDateString('en-US', { weekday: 'short' })})` })), [tripDates]);
    const getServiceTypeOptions = (r) => !r ? [] : allTransports.filter(t => t.fromCity === r.fromCity && t.toCity === r.toCity).map(t => ({ value: t.serviceName, label: t.serviceName }));
    const getCabOptionsForService = (r) => { if (!r || !allSuppliers.length || !r.tripDestinations) return []; const destIds = r.tripDestinations; const matching = allSuppliers.filter(s => s.tripDestinations?.some(sd => destIds.includes(sd._id))); const allCabs = matching.flatMap(s => s.cabs || []); const unique = new Map(); allCabs.forEach(c => { const key = `${c.cabName}-${c.cabType}-${c.numberOfSeater}`; if (!unique.has(key)) unique.set(key, { value: c, label: `${c.cabName} (${c.cabType}, ${c.numberOfSeater} Seater)` }); }); return Array.from(unique.values()); };
    const updateTransportItem = (dayId, itemId, field, value) => { if (field === 'selectedCab' && sameCabForAll) setGlobalCab(value); onUpdateTransportItem(dayId, itemId, field, value); };


    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm border border-slate-200 font-sans">
            <Toaster position="top-right" />
            <div className="max-w-screen-xl mx-auto">
                <header className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0"><FaBusAlt size={24} /></div>
                    <div><h1 className="text-2xl font-bold text-slate-800">Transports and Activities</h1><p className="text-sm text-slate-500">Add transportation services for the trip.</p><p className="text-xs text-slate-400 mt-1">💡 Tip: Use <span className="font-semibold">Next Day</span> or <span className="font-semibold">Duplicate</span> for faster entry.</p></div>
                </header>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"><label className="flex items-center cursor-pointer"><input type="checkbox" checked={sameCabForAll} onChange={(e) => onSetSameCabForAll(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/><span className="ml-3 text-sm font-medium text-slate-700">Same Cab Type for All Services</span></label></div>
                
                {/* ... (JSX for transport entries is unchanged) ... */}
                <div className="space-y-4">{dayEntries.map(entry => (
                    <div key={entry.id} className="bg-white rounded-lg shadow-inner border border-slate-200 p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                <div><label className="text-sm font-semibold text-slate-600 block mb-2">Days</label><div className="p-2 border rounded-md max-h-40 overflow-y-auto bg-slate-50">{tripDates.map((date, i) => (<div key={i} className="flex items-center my-1"><input type="checkbox" id={`day-${entry.id}-${i}`} checked={entry.selectedDays.includes(i)} onChange={() => onHandleDaySelection(entry.id, i)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><label htmlFor={`day-${entry.id}-${i}`} className="ml-3 text-sm text-slate-600">{`Day ${i + 1} (${date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})`}</label></div>))}</div></div>
                                <div><label className="text-sm font-semibold text-slate-600 block mb-2">Service Locations</label><Select options={transportRouteOptions} value={entry.selectedTransportRoute ? { value: entry.selectedTransportRoute, label: `${entry.selectedTransportRoute.fromCity} to ${entry.selectedTransportRoute.toCity} (${entry.selectedTransportRoute.serviceName})` } : null} onChange={opt => onUpdateDayEntry(entry.id, 'selectedTransportRoute', opt.value)} styles={selectStyles} placeholder="Select a route..." isLoading={isLoading} noOptionsMessage={() => 'No routes for this destination.'}/></div>
                                <div><label className="text-sm font-semibold text-slate-600 block mb-2">Service Type</label><Select options={getServiceTypeOptions(entry.selectedTransportRoute)} value={entry.serviceType ? { value: entry.serviceType, label: entry.serviceType } : null} onChange={opt => onUpdateDayEntry(entry.id, 'serviceType', opt.value)} isDisabled={!entry.selectedTransportRoute} styles={selectStyles} placeholder="Select a service..."/></div>
                            </div>
                            <div className="lg:col-span-8">
                                <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-bold text-slate-700">Transportation and Prices - <span className="text-blue-600">{entry.selectedDays.length > 0 ? `Day(s) ${entry.selectedDays.map(d => d + 1).join(', ')}` : 'Select a day'}</span></h3><div className="flex space-x-3 text-slate-500"><FiMessageSquare size={16} /><FiRefreshCw size={16} /></div></div>
                                <div className="space-y-2">{entry.transportItems.map(item => (<div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50/70 rounded-md">
                                    <div className="col-span-12 sm:col-span-5"><Select options={getCabOptionsForService(entry.selectedTransportRoute)} value={item.selectedCab ? { value: item.selectedCab, label: `${item.selectedCab.cabName} (${item.selectedCab.cabType}, ${item.selectedCab.numberOfSeater} Seater)` } : null} onChange={opt => updateTransportItem(entry.id, item.id, 'selectedCab', opt.value)} isDisabled={!entry.serviceType} styles={selectStyles} placeholder="Select a Cab..."/></div>
                                    <div className="col-span-4 sm:col-span-2"><input type="number" value={item.qty} onChange={e => onUpdateTransportItem(entry.id, item.id, 'qty', e.target.value)} className="w-full text-sm text-center border-slate-300 rounded-md"/></div>
                                    <div className="col-span-4 sm:col-span-2"><input type="text" value={formatCurrency(item.rate)} disabled className="w-full text-sm text-center border-slate-300 rounded-md bg-slate-100 text-orange-600 font-semibold"/></div>
                                    <div className="col-span-4 sm:col-span-2"><input type="number" value={item.given} onChange={e => onUpdateTransportItem(entry.id, item.id, 'given', e.target.value)} placeholder="Price" className="w-full text-sm text-center border-slate-300 rounded-md"/></div>
                                    <div className="col-span-12 sm:col-span-1 flex justify-end"><button onClick={() => onRemoveTransportItem(entry.id, item.id)} className="p-2 text-slate-400 hover:text-red-500"><FiX size={16}/></button></div>
                                </div>))}</div>
                                <button onClick={() => onAddTransportItem(entry.id)} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mt-2"><FiPlus className="mr-1"/> Add More Cabs</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-4 mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 rounded-b-lg">
                            <button onClick={() => onAddNextDayService(entry.id)} className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"><FiPlus className="mr-1"/> Next Day Service</button>
                            <button onClick={() => onDuplicateDayEntry(entry.id)} className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"><FiCopy className="mr-1"/> Duplicate</button>
                            {dayEntries.length > 1 && <button onClick={() => onRemoveDayEntry(entry.id)} className="flex items-center text-xs font-semibold text-red-500 hover:text-red-700"><FiTrash2 className="mr-1"/> Remove</button>}
                        </div>
                    </div>
                ))}</div>
                <div className="mt-6"><button onClick={onAddDayEntry} className="w-full md:w-auto flex items-center justify-center bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"><FiPlus className="mr-2"/> Add Service</button></div>
                
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Any extra or sightseeing in transportation</h2>
                    <p className="text-sm text-slate-500 mb-4">Add any extra services like any side destination trip that is provided only per customer request.</p>
                    <div className="space-y-3">{extraServices.map((service, index) => (<div key={service.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center">
                        <div className="col-span-12 sm:col-span-3">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Service</label>}<input type="text" placeholder="e.g. Lunch, Monument Ticket" value={service.service} onChange={e => onUpdateExtraService(service.id, 'service', e.target.value)} className="w-full text-sm border-slate-300 rounded-md"/></div>
                        <div className="col-span-6 sm:col-span-2">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Total Price (INR)</label>}<input type="number" placeholder="e.g. 300" value={service.price} onChange={e => onUpdateExtraService(service.id, 'price', parseInt(e.target.value) || 0)} className="w-full text-sm border-slate-300 rounded-md"/></div>
                        <div className="col-span-6 sm:col-span-3">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Day</label>}<Select options={dayOptions} value={dayOptions.find(opt => opt.value === service.day)} onChange={opt => onUpdateExtraService(service.id, 'day', opt.value)} styles={selectStyles} placeholder="Select Day..."/></div>
                        <div className="col-span-12 sm:col-span-3">{index === 0 && <label className="block text-xs font-semibold text-slate-600 mb-1">Comments</label>}<input type="text" placeholder="Any comments regarding service" value={service.comments} onChange={e => onUpdateExtraService(service.id, 'comments', e.target.value)} className="w-full text-sm border-slate-300 rounded-md"/></div>
                        <div className="col-span-12 sm:col-span-1 flex items-end justify-start sm:justify-center"><button onClick={() => onRemoveExtraService(service.id)} className="p-2 text-slate-400 hover:text-red-600" title="Remove Service"><FiX size={18}/></button></div>
                    </div>))}</div>
                    <div className="mt-4"><button onClick={onAddExtraService} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"><FiPlus className="mr-1"/> Add Service</button></div>
                </div>

                {/* --- RE-INTRODUCED: Total Badges for this section --- */}
                <div className="mt-8 flex justify-end items-center gap-4">
                    {transportSectionTotals.extras > 0 && 
                        <div className="bg-amber-100 border border-amber-300 text-amber-800 font-bold py-2 px-4 rounded-lg">
                            Other's: {formatCurrency(transportSectionTotals.extras)}
                        </div>
                    }
                    <div className="bg-blue-100 border border-blue-300 text-blue-800 font-bold py-2 px-4 rounded-lg">
                        Transport's Total: {formatCurrency(transportSectionTotals.total)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportQuotation;