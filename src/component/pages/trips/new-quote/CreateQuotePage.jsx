import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiArrowLeft } from 'react-icons/fi';

import FlightQuotation from './FlightQuotation';
import HotelQuotation from './HotelQuotation';
import TransportQuotation from './TransportQuotation';
import Summary from './Summary';

const CreateQuotePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = location.state?.query;

    // --- LIFTED STATE FOR ALL COMPONENTS ---

    // Flight State
    const [flights, setFlights] = useState([{
        id: 1, from: '', to: query?.destination?.name || '', departureTime: '', arrivalTime: '', airline: '',
        flightClass: 'Economy', flightNumber: '', adults: query?.noOfAdults || 1, children: query?.childrenAges?.length || 0,
        infants: 0, costPrice: '', givenPrice: '', comments: ''
    }]);

    // Hotel State
    const [hotelEntries, setHotelEntries] = useState([{
        id: 1, stayNights: [], selectedHotel: null, selectedRoomConfig: null, mealPlan: null, numRooms: 1,
        paxPerRoom: query?.noOfAdults || 2, numAWEB: 0, numCWEB: query?.childrenAges?.length || 0, numCNB: 0, sellingPrice: 0,
    }]);
    const [specialInclusions, setSpecialInclusions] = useState([]);

    // Transport State
    const [dayEntries, setDayEntries] = useState([{
        id: 1, selectedDays: [], selectedTransportRoute: null, serviceType: null,
        transportItems: [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }],
    }]);
    const [transportExtraServices, setTransportExtraServices] = useState([]);
    const [sameCabForAll, setSameCabForAll] = useState(false);


    // --- HANDLERS TO BE PASSED AS PROPS ---

    // Flight Handlers
    const updateFlight = (id, field, value) => setFlights(p => p.map(f => f.id === id ? { ...f, [field]: value } : f));
    const addFlight = () => setFlights(p => [...p, { id: (p[p.length - 1]?.id || 0) + 1, from: '', to: '', departureTime: '', arrivalTime: '', airline: '', flightClass: 'Economy', flightNumber: '', adults: query?.noOfAdults || 1, children: query?.childrenAges?.length || 0, infants: 0, costPrice: '', givenPrice: '', comments: '' }]);
    const removeFlight = (id) => flights.length > 1 && setFlights(p => p.filter(f => f.id !== id));
    
    // Hotel Handlers
    const updateHotelEntry = (id, field, value) => setHotelEntries(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));
    const addHotelEntry = () => setHotelEntries(p => [...p, { id: (p[p.length - 1]?.id || 0) + 1, stayNights: [], selectedHotel: null, selectedRoomConfig: null, mealPlan: null, numRooms: 1, paxPerRoom: query?.noOfAdults || 2, numAWEB: 0, numCWEB: query?.childrenAges?.length || 0, numCNB: 0, sellingPrice: 0 }]);
    const removeHotelEntry = (id) => hotelEntries.length > 1 && setHotelEntries(p => p.filter(e => e.id !== id));
    const duplicateHotelEntry = (id) => { const entryToDuplicate = hotelEntries.find(e => e.id === id); if (entryToDuplicate) { const newId = (hotelEntries[hotelEntries.length - 1]?.id || 0) + 1; setHotelEntries(prev => [...prev, { ...entryToDuplicate, id: newId, stayNights: [] }]); }};
    const updateInclusion = (id, field, value) => setSpecialInclusions(p => p.map(i => i.id === id ? { ...i, [field]: value, ...(field === 'hotelEntryId' && { night: null }) } : i));
    const addInclusion = () => setSpecialInclusions(p => [...p, { id: (p[p.length - 1]?.id || 0) + 1, service: '', hotelEntryId: null, night: null, price: 0, comments: '' }]);
    const removeInclusion = (id) => setSpecialInclusions(p => p.filter(i => i.id !== id));
    
    // Transport Handlers
    const updateDayEntry = (id, field, value) => setDayEntries(p => p.map(d => d.id === id ? { ...d, [field]: value, ...(field === 'selectedTransportRoute' && { serviceType: null, transportItems: [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }] }) } : d));
    const addDayEntry = () => setDayEntries(p => [...p, { id: (p[p.length - 1]?.id || 0) + 1, selectedDays: [], selectedTransportRoute: null, serviceType: null, transportItems: [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }] }]);
    const removeDayEntry = (id) => dayEntries.length > 1 && setDayEntries(p => p.filter(e => e.id !== id));
    const updateTransportItem = (dayId, itemId, field, value) => { setDayEntries(p => p.map(d => d.id === dayId ? { ...d, transportItems: d.transportItems.map(i => i.id === itemId ? { ...i, [field]: value, ...(field === 'selectedCab' && { rate: value.price || 0 }) } : i) } : d)); };
    const addTransportItem = (dayId) => { setDayEntries(p => p.map(d => d.id === dayId ? { ...d, transportItems: [...d.transportItems, { id: (d.transportItems[d.transportItems.length-1]?.id || 0)+1, selectedCab: null, qty: 1, rate: 0, given: '' }] } : d)); };
    const removeTransportItem = (dayId, itemId) => { setDayEntries(p => p.map(d => (d.id === dayId && d.transportItems.length > 1) ? { ...d, transportItems: d.transportItems.filter(i => i.id !== itemId) } : d)); };
    const handleDaySelection = (dayId, dayIndex) => { setDayEntries(p => p.map(e => e.id === dayId ? { ...e, selectedDays: e.selectedDays.includes(dayIndex) ? e.selectedDays.filter(d => d !== dayIndex) : [...e.selectedDays, dayIndex].sort((a,b) => a-b) } : e)); };
    const addExtraTransportService = () => setTransportExtraServices(p => [...p, { id: (p[p.length - 1]?.id || 0) + 1, service: '', price: 0, day: null, comments: '' }]);
    const removeExtraTransportService = (id) => setTransportExtraServices(p => p.filter(s => s.id !== id));
    const updateExtraTransportService = (id, field, value) => setTransportExtraServices(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
    const duplicateDayEntry = (id) => { const entryToDuplicate = dayEntries.find(e => e.id === id); if (entryToDuplicate) { const newId = (dayEntries[dayEntries.length - 1]?.id || 0) + 1; setDayEntries(prev => [...prev, { ...entryToDuplicate, id: newId }]); toast.success("Service duplicated."); }};
    const addNextDayService = (id) => { const entryToDuplicate = dayEntries.find(e => e.id === id); if(entryToDuplicate) { /* ...logic from previous step... */ }};


    // --- Totals Calculation in Parent ---
    const flightTotals = useMemo(() => flights.reduce((acc, f) => ({ net: acc.net + Number(f.costPrice || 0), selling: acc.selling + Number(f.givenPrice || 0) }), { net: 0, selling: 0 }), [flights]);
    const hotelTotals = useMemo(() => {
        const entriesTotal = hotelEntries.reduce((acc, h) => {
            const sellingPrice = Number(h.sellingPrice) || 0;
            // Assuming net rate is not directly available, can be calculated if needed
            return { net: acc.net, selling: acc.selling + (sellingPrice * h.stayNights.length) };
        }, { net: 0, selling: 0 });
        const inclusionsTotal = specialInclusions.reduce((acc, i) => acc + (Number(i.price) || 0), 0);
        return { net: entriesTotal.net + inclusionsTotal, selling: entriesTotal.selling + inclusionsTotal, entries: hotelEntries, inclusions: specialInclusions };
    }, [hotelEntries, specialInclusions]);
    const transportTotals = useMemo(() => {
        const entriesTotal = dayEntries.reduce((acc, d) => {
            const numDays = d.selectedDays.length || 1;
            d.transportItems.forEach(i => {
                acc.selling += Number(i.given || 0) * i.qty * numDays;
                acc.net += Number(i.rate || 0) * i.qty * numDays;
            });
            return acc;
        }, { net: 0, selling: 0 });
        const extrasTotal = transportExtraServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
        return { net: entriesTotal.net + extrasTotal, selling: entriesTotal.selling + extrasTotal };
    }, [dayEntries, transportExtraServices]);

    if (!query) return (<div>Error: No Query Data</div>);

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-xl mx-auto space-y-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-3">Basic Details</h2>
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-sm">
                        <div><p className="text-xs text-slate-500 uppercase">DESTINATION</p><p className="font-medium text-base">{query.destination?.name}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">START DATE</p><p className="font-medium text-base">{new Date(query.startDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">DURATION</p><p className="font-medium text-base">{query.duration}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">PAX</p><p className="font-medium text-base">{query.noOfAdults} Adult(s)</p></div>
                    </div>
                </div>

                <FlightQuotation queryData={query} flights={flights} onUpdate={updateFlight} onAdd={addFlight} onRemove={removeFlight} />
                
                <HotelQuotation 
                    queryData={query}
                    hotelEntries={hotelEntries}
                    specialInclusions={specialInclusions}
                    onUpdateEntry={updateHotelEntry}
                    onAddEntry={addHotelEntry}
                    onRemoveEntry={removeHotelEntry}
                    onDuplicateEntry={duplicateHotelEntry}
                    onUpdateInclusion={updateInclusion}
                    onAddInclusion={addInclusion}
                    onRemoveInclusion={removeInclusion}
                />

                <TransportQuotation 
                    queryData={query} 
                    dayEntries={dayEntries}
                    extraServices={transportExtraServices} // Pass the state here
                    sameCabForAll={sameCabForAll}
                    onUpdateDayEntry={updateDayEntry}
                    onAddDayEntry={addDayEntry}
                    onRemoveDayEntry={removeDayEntry}
                    onDuplicateDayEntry={duplicateDayEntry}
                    onAddNextDayService={addNextDayService}
                    onUpdateTransportItem={updateTransportItem}
                    onAddTransportItem={addTransportItem}
                    onRemoveTransportItem={removeTransportItem}
                    onHandleDaySelection={handleDaySelection}
                    onUpdateExtraService={updateExtraTransportService} // Pass the handler
                    onAddExtraService={addExtraTransportService}       // Pass the handler
                    onRemoveExtraService={removeExtraTransportService} // Pass the handler
                    onSetSameCabForAll={setSameCabForAll}
                />

                <Summary 
                    queryData={query}
                    flightData={flightTotals}
                    hotelData={hotelTotals}
                    transportData={transportTotals}
                />
            </div>
        </div>
    );
};

export default CreateQuotePage;