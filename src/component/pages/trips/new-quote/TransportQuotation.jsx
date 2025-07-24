// src/pages/TransportQuotation.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast, Toaster } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiRefreshCw, FiMessageSquare, FiCopy, FiX } from 'react-icons/fi';
import { FaBusAlt } from 'react-icons/fa';

// --- Helper Functions & Components ---

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const selectStyles = {
    control: (p, { isDisabled }) => ({ ...p, minHeight: '40px', backgroundColor: isDisabled ? '#f1f5f9' : 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }),
    menu: (p) => ({ ...p, zIndex: 20 }),
    placeholder: (p) => ({...p, color: '#9ca3af'})
};

// --- Main Quotation Component ---

const TransportQuotation = () => {
    const [dayEntries, setDayEntries] = useState([{
        id: 1, selectedDays: [], selectedTransportRoute: null, serviceType: null,
        transportItems: [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }],
    }]);
    const [allTransports, setAllTransports] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [tripDates, setTripDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sameCabForAll, setSameCabForAll] = useState(false);
    const [globalCab, setGlobalCab] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [transportRes, suppliersRes] = await Promise.all([
                    axios.get('https://mountain-chain.onrender.com/mountainchain/api/transport/list'),
                    axios.get('https://mountain-chain.onrender.com/mountainchain/api/suppliers')
                ]);
                setAllTransports(transportRes.data.data || []);
                setAllSuppliers(suppliersRes.data.data || []);
            } catch (error) {
                toast.error("Failed to fetch critical data. Please refresh.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        const startDate = new Date('2025-10-01');
        const numberOfNights = 5;
        const dates = Array.from({ length: numberOfNights + 1 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });
        setTripDates(dates);
        fetchData();
    }, []);

    // --- Dynamic Options for Select Dropdowns ---

    const transportRouteOptions = useMemo(() => {
        const uniqueRoutes = new Map();
        allTransports.forEach(t => {
            const key = `${t.fromCity}-${t.toCity}`;
            if (!uniqueRoutes.has(key)) {
                uniqueRoutes.set(key, { value: t, label: `${t.fromCity} to ${t.toCity}` });
            }
        });
        return Array.from(uniqueRoutes.values());
    }, [allTransports]);

    const getServiceTypeOptions = (route) => {
        if (!route) return [];
        return allTransports
            .filter(t => t.fromCity === route.fromCity && t.toCity === route.toCity)
            .map(t => ({ value: t.serviceName, label: t.serviceName }));
    };

    // --- CORRECTED CAB FILTERING LOGIC ---
    const getCabOptionsForService = (service) => {
        if (!service || !allSuppliers || !service.tripDestinations) return [];
        
        // service.tripDestinations is an array of STRINGS.
        const serviceDestinationNames = service.tripDestinations;

        const matchingSuppliers = allSuppliers.filter(supplier => {
            // supplier.tripDestinations is an array of OBJECTS.
            // We need to check if any of the supplier's destination *names* are in the service's destination list.
            return supplier.tripDestinations && supplier.tripDestinations.some(supplierDest => 
                serviceDestinationNames.includes(supplierDest.name)
            );
        });
        
        // Now, flatten the cabs from all matching suppliers
        const allCabs = matchingSuppliers.flatMap(supplier => supplier.cabs || []);

        // Create unique cab options
        const uniqueCabs = new Map();
        allCabs.forEach(cab => {
            const key = `${cab.cabName}-${cab.cabType}-${cab.numberOfSeater}`;
            if (!uniqueCabs.has(key)) {
                uniqueCabs.set(key, { value: cab, label: `${cab.cabName} (${cab.cabType})` });
            }
        });

        return Array.from(uniqueCabs.values());
    };
    
    // --- State Handlers ---

    const updateDayEntry = (id, field, value) => {
        setDayEntries(prev => prev.map(entry => {
            if (entry.id === id) {
                const newEntry = { ...entry, [field]: value };
                if (field === 'selectedTransportRoute') {
                    newEntry.serviceType = null;
                    newEntry.transportItems = [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }];
                }
                return newEntry;
            }
            return entry;
        }));
    };

    const updateTransportItem = (dayId, itemId, field, value) => {
        setDayEntries(prev => prev.map(entry => {
            if (entry.id === dayId) {
                const updatedItems = entry.transportItems.map(item => {
                    if (item.id === itemId) {
                        const newItem = { ...item, [field]: value };
                        if (field === 'selectedCab') {
                            newItem.rate = value?.price || 0;
                            if (sameCabForAll) setGlobalCab(value);
                        }
                        return newItem;
                    }
                    return item;
                });
                return { ...entry, transportItems: updatedItems };
            }
            return entry;
        }));
    };
    
    useEffect(() => {
        if (sameCabForAll && globalCab) {
            setDayEntries(prev => prev.map(entry => ({
                ...entry,
                transportItems: entry.transportItems.map(item => ({ ...item, selectedCab: globalCab, rate: globalCab.price || 0 }))
            })));
        }
    }, [globalCab, sameCabForAll]);

    // --- UI Actions ---
    const addTransportItem = (dayId) => {
        setDayEntries(prev => prev.map(entry => {
            if (entry.id === dayId) {
                const newId = (entry.transportItems[entry.transportItems.length - 1]?.id || 0) + 1;
                return { ...entry, transportItems: [...entry.transportItems, { id: newId, selectedCab: null, qty: 1, rate: 0, given: '' }]};
            }
            return entry;
        }));
    };
    
    const removeTransportItem = (dayId, itemId) => {
        setDayEntries(prev => prev.map(entry => {
            if (entry.id === dayId && entry.transportItems.length > 1) {
                return { ...entry, transportItems: entry.transportItems.filter(item => item.id !== itemId) };
            }
            return entry;
        }));
    };

    const addDayEntry = () => {
        const newId = (dayEntries[dayEntries.length - 1]?.id || 0) + 1;
        setDayEntries(prev => [...prev, { id: newId, selectedDays: [], selectedTransportRoute: null, serviceType: null, transportItems: [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }] }]);
    };

    const removeDayEntry = (id) => setDayEntries(prev => prev.filter(e => e.id !== id));
    
    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <div className="max-w-screen-xl mx-auto">
                <header className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0"><FaBusAlt size={24} /></div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Transports and Activities</h1>
                        <p className="text-sm text-slate-500">Please add the transportation services and activities (if included) details and the selling cost price for each service.</p>
                        <p className="text-xs text-slate-400 mt-1">💡 Tip: To speed up the process of adding multiple services, use <span className="font-semibold">Next Day</span> or <span className="font-semibold">Duplicate</span> actions.</p>
                    </div>
                </header>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-center cursor-pointer"><input type="checkbox" checked={sameCabForAll} onChange={(e) => setSameCabForAll(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/><span className="ml-3 text-sm font-medium text-slate-700">Same Cab Type for All</span></label>
                </div>

                <div className="space-y-4">
                    {dayEntries.map(entry => (
                        <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Side: Days & Service Selection */}
                                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 block mb-2">Days</label>
                                        <div className="p-2 border rounded-md max-h-40 overflow-y-auto bg-slate-50">
                                             {tripDates.map((date, i) => (
                                                <div key={i} className="flex items-center my-1"><input type="checkbox" id={`day-${entry.id}-${i}`} checked={entry.selectedDays.includes(i)} onChange={() => { /* Handler needed */ }} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                                <label htmlFor={`day-${entry.id}-${i}`} className="ml-3 text-sm text-slate-600">{`Day ${i + 1} (${date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})`}</label></div>
                                            ))}
                                        </div>
                                    </div>
                                     <div>
                                        <label className="text-sm font-semibold text-slate-600 block mb-2">Service Locations</label>
                                        <Select options={transportRouteOptions} value={entry.selectedTransportRoute ? { value: entry.selectedTransportRoute, label: `${entry.selectedTransportRoute.fromCity} to ${entry.selectedTransportRoute.toCity}` } : null} onChange={opt => updateDayEntry(entry.id, 'selectedTransportRoute', opt.value)} styles={selectStyles} placeholder="Select a route..." isLoading={isLoading}/>
                                     </div>
                                      <div>
                                        <label className="text-sm font-semibold text-slate-600 block mb-2">Service Type</label>
                                        <Select options={getServiceTypeOptions(entry.selectedTransportRoute)} value={entry.serviceType ? { value: entry.serviceType, label: entry.serviceType } : null} onChange={opt => updateDayEntry(entry.id, 'serviceType', opt.value)} isDisabled={!entry.selectedTransportRoute} styles={selectStyles} placeholder="Select a service..."/>
                                      </div>
                                </div>
                                {/* Right Side: Prices and Transport Items */}
                                <div className="lg:col-span-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-slate-700">Transportation and Prices - <span className="text-blue-600">Wednesday, 1 Oct</span></h3>
                                        <div className="flex space-x-3 text-slate-500"><FiMessageSquare size={16} /><FiRefreshCw size={16} /></div>
                                    </div>
                                    <div className="space-y-2">
                                        {entry.transportItems.map(item => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50/70 rounded-md">
                                                <div className="col-span-12 sm:col-span-5"><Select options={getCabOptionsForService(entry.selectedTransportRoute)} value={item.selectedCab ? { value: item.selectedCab, label: `${item.selectedCab.cabName} (${item.selectedCab.cabType})` } : null} onChange={opt => updateTransportItem(entry.id, item.id, 'selectedCab', opt.value)} isDisabled={!entry.serviceType} styles={selectStyles} placeholder="Select a Cab..."/></div>
                                                <div className="col-span-4 sm:col-span-2"><input type="number" value={item.qty} onChange={e => updateTransportItem(entry.id, item.id, 'qty', e.target.value)} className="w-full text-sm text-center border-slate-300 rounded-md"/></div>
                                                <div className="col-span-4 sm:col-span-2"><input type="text" value={formatCurrency(item.rate)} disabled className="w-full text-sm text-center border-slate-300 rounded-md bg-slate-100 text-orange-600 font-semibold"/></div>
                                                <div className="col-span-4 sm:col-span-2"><input type="number" value={item.given} onChange={e => updateTransportItem(entry.id, item.id, 'given', e.target.value)} className="w-full text-sm text-center border-slate-300 rounded-md"/></div>
                                                <div className="col-span-12 sm:col-span-1 flex justify-end"><button onClick={() => removeTransportItem(entry.id, item.id)} className="p-2 text-slate-400 hover:text-red-500"><FiX size={16}/></button></div>
                                            </div>
                                        ))}
                                    </div>
                                     <button onClick={() => addTransportItem(entry.id)} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mt-2"><FiPlus className="mr-1"/> Add More</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-end space-x-4 mt-4 pt-3 border-t border-slate-100">
                                <button className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"><FiPlus className="mr-1"/> Next Day</button>
                                <button className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"><FiCopy className="mr-1"/> Duplicate</button>
                                {dayEntries.length > 1 && <button onClick={() => removeDayEntry(entry.id)} className="flex items-center text-xs font-semibold text-red-500 hover:text-red-700"><FiTrash2 className="mr-1"/> Remove</button>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                    <button onClick={addDayEntry} className="w-full md:w-auto bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
                        + Add Day
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransportQuotation;