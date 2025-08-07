import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Import all your form section components
import FlightQuotation from './FlightQuotation';
import HotelQuotation from './HotelQuotation';
import TransportQuotation from './TransportQuotation';
import Summary from './Summary';
import ItineraryDetails from '../ItineraryDetails';

const API_BASE_URL = "https://mountain-chain.onrender.com/mountainchain/api";

// Helper function to format dates for datetime-local inputs
const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Invalid date format for input:", isoString);
        return '';
    }
};

const QuoteFormPage = () => {
    const { quoteId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const isEditMode = !!quoteId;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [query, setQuery] = useState(location.state?.query || null);
    
    // All form states initialized as empty arrays to prevent undefined errors
    const [flights, setFlights] = useState([]);
    const [hotelEntries, setHotelEntries] = useState([]);
    const [specialInclusions, setSpecialInclusions] = useState([]);
    const [dayEntries, setDayEntries] = useState([]);
    const [transportExtraServices, setTransportExtraServices] = useState([]);
    const [dayWiseItinerary, setDayWiseItinerary] = useState([]);
    const [inclusionsExclusions, setInclusionsExclusions] = useState([]);
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [sameCabForAll, setSameCabForAll] = useState(false);

    // --- Data fetching and initialization ---
  useEffect(() => {
        const initializeForm = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) { toast.error("Authentication required."); navigate('/login'); return; }

            try {
                let currentQuery = location.state?.query;

                if (isEditMode) {
                    const response = await axios.get(`${API_BASE_URL}/quotations/${quoteId}`, { headers: { Authorization: `Bearer ${token}` } });
                    const quoteData = response.data;
                    currentQuery = quoteData.queryId;
                    setQuery(currentQuery);
                    
                    // --- CRITICAL FIX: Ensure all state values are defined, never undefined ---
                    setFlights(quoteData.flights?.map((f, i) => ({
                        id: i + 1,
                        from: f.from || '',
                        to: f.to || '',
                        departureTime: formatDateForInput(f.departureTime),
                        arrivalTime: formatDateForInput(f.arrivalTime),
                        airline: f.airline || '',
                        flightClass: f.flightClass || 'Economy',
                        flightNumber: f.flightNumber || '',
                        adults: f.adults || 0,
                        children: f.children || 0,
                        infants: f.infants || 0,
                        costPrice: f.costPrice || '',
                        givenPrice: f.givenPrice || '',
                        comments: f.comments || ''
                    })) || []);

                    setHotelEntries(quoteData.hotelDetails?.entries?.map((h, i) => ({
                        id: i + 1,
                        stayNights: h.stayNights || [],
                        selectedHotel: h.selectedHotel || null,
                        hotelId: h.hotelId || null,
                        hotelName: h.hotelName || '',
                        selectedRoomConfig: h.selectedRoomConfig || null,
                        roomConfig: h.roomConfig || '',
                        mealPlan: h.mealPlan || null,
                        numRooms: h.numRooms || 1,
                        paxPerRoom: h.paxPerRoom || 2,
                        numAWEB: h.numAWEB || 0,
                        numCWEB: h.numCWEB || 0,
                        numCNB: h.numCNB || 0,
                        sellingPrice: h.sellingPrice || 0
                    })) || []);

                    setSpecialInclusions(quoteData.hotelDetails?.specialInclusions?.map((s, i) => ({
                        id: i + 1,
                        service: s.service || '',
                        hotelEntryId: s.hotelEntryId || null,
                        night: s.night || null,
                        price: s.price || 0,
                        comments: s.comments || ''
                    })) || []);
                    
                    setDayEntries(quoteData.transportDetails?.entries?.map((d, i) => ({ 
                        ...d, 
                        id: i + 1,
                        transportItems: d.transportItems?.map((t, ti) => ({ ...t, id: ti + 1, given: t.given || '' })) || []
                    })) || []);

                    setTransportExtraServices(quoteData.transportDetails?.extraServices?.map((e, i) => ({ ...e, id: i + 1 })) || []);
                    setDayWiseItinerary(quoteData.dayWiseItinerary || []);
                    setInclusionsExclusions(quoteData.inclusionsExclusions?.map((ie, i) => ({ ...ie, id: i + 1 })) || []);
                    setTermsAndConditions(quoteData.termsAndConditions?.join('\n') || '');

                } else if (currentQuery) {
                    // This block for Create Mode is already robust
                    setQuery(currentQuery);
                    setFlights([{ id: Date.now(), from: '', to: currentQuery.destination?._id || '', departureTime: '', arrivalTime: '', airline: '', flightClass: 'Economy', flightNumber: '', adults: currentQuery.noOfAdults || 1, children: currentQuery.childrenAges?.length || 0, infants: 0, costPrice: '', givenPrice: '', comments: '' }]);
                    setHotelEntries([{ id: Date.now(), stayNights: [], selectedHotel: null, selectedRoomConfig: null, mealPlan: null, numRooms: 1, paxPerRoom: currentQuery.noOfAdults || 2, numAWEB: 0, numCWEB: currentQuery.childrenAges?.length || 0, numCNB: 0, sellingPrice: 0, }]);
                    setDayEntries([{ id: Date.now(), selectedDays: [], selectedTransportRoute: null, serviceType: null, transportItems: [{ id: 1, selectedCab: null, qty: 1, rate: 0, given: '' }], }]);
                    setInclusionsExclusions([{ id: Date.now(), category: 'Inclusions', included: '', excluded: 'Anything not in inclusions is excluded' }]);
                } else {
                    if (!isEditMode) throw new Error("No query data found.");
                }
            } catch (error) {
                toast.error(error.message || "Failed to load quotation data.");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };
        initializeForm();
    }, [quoteId, isEditMode, navigate, location.state?.query]);// CRITICAL FIX: Removed 'query' from dependency array

    // --- ALL HANDLER FUNCTIONS ---
    const updateFlight = (id, field, value) => setFlights(p => p.map(f => f.id === id ? { ...f, [field]: value } : f));
    const addFlight = () => setFlights(p => [...p, { id: Date.now(), from: '', to: query.destination?._id || '', departureTime: '', arrivalTime: '', airline: '', flightClass: 'Economy', flightNumber: '', adults: query.noOfAdults || 1, children: query.childrenAges?.length || 0, infants: 0, costPrice: '', givenPrice: '', comments: '' }]);
    const removeFlight = (id) => flights.length > 1 && setFlights(p => p.filter(f => f.id !== id));
    
    const updateHotelEntry = (id, field, value) => setHotelEntries(p => p.map(h => h.id === id ? { ...h, [field]: value } : h));
    const addHotelEntry = () => setHotelEntries(p => [...p, { id: Date.now(), stayNights: [], selectedHotel: null, selectedRoomConfig: null, mealPlan: null, numRooms: 1, paxPerRoom: query.noOfAdults || 2, numAWEB: 0, numCWEB: query.childrenAges?.length || 0, numCNB: 0, sellingPrice: 0 }]);
    const removeHotelEntry = (id) => hotelEntries.length > 1 && setHotelEntries(p => p.filter(h => h.id !== id));
    const duplicateHotelEntry = (id) => { const entry = hotelEntries.find(h => h.id === id); if (entry) setHotelEntries(p => [...p, { ...entry, id: Date.now() }]); };
    
    const updateSpecialInclusion = (id, field, value) => setSpecialInclusions(p => p.map(si => si.id === id ? { ...si, [field]: value } : si));
    const addSpecialInclusion = () => setSpecialInclusions(p => [...p, { id: Date.now(), night: '', service: '', price: 0, comments: '' }]);
    const removeSpecialInclusion = (id) => setSpecialInclusions(p => p.filter(si => si.id !== id));
    
    const updateDayEntry = (id, field, value) => setDayEntries(p => p.map(d => d.id === id ? { ...d, [field]: value } : d));
    const addDayEntry = () => setDayEntries(p => [...p, { id: Date.now(), selectedDays: [], transportItems: [{ id: 1, qty: 1, rate: 0, given: '' }] }]);
    const removeDayEntry = (id) => dayEntries.length > 1 && setDayEntries(p => p.filter(d => d.id !== id));
    const duplicateDayEntry = (id) => { const entry = dayEntries.find(d => d.id === id); if (entry) setDayEntries(p => [...p, { ...entry, id: Date.now() }]); };
    
    const updateTransportItem = (dayId, itemId, field, value) => setDayEntries(p => p.map(d => d.id === dayId ? { ...d, transportItems: d.transportItems.map(i => i.id === itemId ? { ...i, [field]: value } : i) } : d));
    const addTransportItem = (dayId) => setDayEntries(p => p.map(d => d.id === dayId ? { ...d, transportItems: [...d.transportItems, { id: Date.now(), qty: 1, rate: 0, given: '' }] } : d));
    const removeTransportItem = (dayId, itemId) => setDayEntries(p => p.map(d => (d.id === dayId && d.transportItems.length > 1) ? { ...d, transportItems: d.transportItems.filter(i => i.id !== itemId) } : d));
    
    const handleDaySelection = (dayId, dayIndex) => setDayEntries(p => p.map(e => e.id === dayId ? { ...e, selectedDays: e.selectedDays.includes(dayIndex) ? e.selectedDays.filter(d => d !== dayIndex) : [...e.selectedDays, dayIndex].sort((a,b) => a-b) } : e));
    
    const updateExtraTransportService = (id, field, value) => setTransportExtraServices(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
    const addExtraTransportService = () => setTransportExtraServices(p => [...p, { id: Date.now(), service: '', price: 0, day: null, comments: '' }]);
    const removeExtraTransportService = (id) => setTransportExtraServices(p => p.filter(s => s.id !== id));

    // --- Robust useMemo hooks for totals ---
    const flightTotals = useMemo(() => ({ net: flights?.reduce((acc, f) => acc + Number(f.costPrice || 0), 0) || 0, selling: flights?.reduce((acc, f) => acc + Number(f.givenPrice || 0), 0) || 0, entries: flights || [] }), [flights]);
    const hotelTotals = useMemo(() => {
        const entries = hotelEntries || [];
        const inclusions = specialInclusions || [];
        const entriesTotal = entries.reduce((acc, h) => acc + ((Number(h.sellingPrice) || 0) * (h.stayNights?.length || 1)), 0);
        const inclusionsTotal = inclusions.reduce((acc, i) => acc + (Number(i.price) || 0), 0);
        return { net: 0, selling: entriesTotal + inclusionsTotal, entries: entries, inclusions: inclusions };
    }, [hotelEntries, specialInclusions]);
    const transportTotals = useMemo(() => {
        const entries = dayEntries || [];
        const extras = transportExtraServices || [];
        const entriesTotal = entries.reduce((acc, d) => {
            const numDays = d.selectedDays?.length || 1;
            const entryTotal = d.transportItems?.reduce((itemAcc, item) => itemAcc + (Number(item.given || 0) * item.qty), 0) || 0;
            return acc + (entryTotal * numDays);
        }, 0);
        const extrasTotal = extras.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
        return { net: 0, selling: entriesTotal + extrasTotal, entries: entries, extras: extras };
    }, [dayEntries, transportExtraServices]);
    
    // --- Central source of truth for trip dates ---
    const tripDates = useMemo(() => {
        if (!query?.startDate || !query?.duration) return [];
        const nights = parseInt(query.duration.split('N')[0].trim(), 10) || 0;
        if (nights === 0) return [];
        const startDate = new Date(query.startDate);
        return Array.from({ length: nights + 1 }, (_, i) => { // +1 for days
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            return d;
        });
    }, [query]);
    
const handleSaveQuote = async (summaryData) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        toast.error("Authentication required.");
        navigate('/login');
        return;
    }

    setIsSaving(true);

    try {
        const payload = {
            queryId: query?._id || query,
            flights,
            hotelDetails: {
                entries: hotelEntries,
                specialInclusions
            },
            transportDetails: {
                entries: dayEntries,
                extraServices: transportExtraServices,
                sameCabForAll
            },
            dayWiseItinerary,
            inclusionsExclusions,
            termsAndConditions: termsAndConditions
                .split('\n')
                .map(line => line.trim())
                .filter(line => !!line),
            summary: summaryData,
        };

        let response;

        if (isEditMode) {
            response = await axios.put(`${API_BASE_URL}/quotations/${quoteId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            response = await axios.post(`${API_BASE_URL}/quotations`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        if (response.status === 200 || response.status === 201) {
            toast.success("Quotation saved successfully!");
navigate(`/organization/trips/query/${query?._id || query}`);
        } else {
            throw new Error("Unexpected response from server.");
        }

    } catch (error) {
        console.error("Save failed:", error);
        toast.error(error.response?.data?.message || error.message || "Failed to save quote.");
    } finally {
        setIsSaving(false);
    }
};
    
    if (isLoading) return <div className="p-10 text-center font-semibold text-slate-600">Loading Quotation Form...</div>;
    if (!query) return <div className="p-10 text-center font-semibold text-red-500">Error: Could not find query data.</div>;

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-xl mx-auto space-y-8">
                {/* ... (Header JSX is correct) ... */}

                <FlightQuotation 
                    queryData={query} flights={flights} 
                    onUpdate={updateFlight} onAdd={addFlight} onRemove={removeFlight}
                />
                
                <HotelQuotation 
                    queryData={query} hotelEntries={hotelEntries} specialInclusions={specialInclusions} tripDates={tripDates}
                    onUpdateEntry={updateHotelEntry} onAddEntry={addHotelEntry} onRemoveEntry={removeHotelEntry} onDuplicateEntry={duplicateHotelEntry}
                    onUpdateInclusion={updateSpecialInclusion} onAddInclusion={addSpecialInclusion} onRemoveInclusion={removeSpecialInclusion}
                />
                
                {/* --- CRITICAL FIX: Pass all required props to TransportQuotation --- */}
                <TransportQuotation 
                    queryData={query} dayEntries={dayEntries} extraServices={transportExtraServices} tripDates={tripDates} sameCabForAll={sameCabForAll}
                    onUpdateDayEntry={updateDayEntry} onAddDayEntry={addDayEntry} onRemoveDayEntry={removeDayEntry} onDuplicateDayEntry={duplicateDayEntry}
                    onUpdateTransportItem={updateTransportItem} onAddTransportItem={addTransportItem} onRemoveTransportItem={removeTransportItem}
                    onHandleDaySelection={handleDaySelection}
                    onUpdateExtraService={updateExtraTransportService} onAddExtraService={addExtraTransportService} onRemoveExtraService={removeExtraTransportService}
                    onSetSameCabForAll={setSameCabForAll}
                />
                
                <ItineraryDetails 
                    queryData={query} itinerary={dayWiseItinerary} setItinerary={setDayWiseItinerary}
                    inclusions={inclusionsExclusions} setInclusions={setInclusionsExclusions}
                    terms={termsAndConditions} setTerms={setTermsAndConditions}
                />
                
                <Summary 
                    queryData={query} flightData={flightTotals} hotelData={hotelTotals} transportData={transportTotals} 
                    onSave={handleSaveQuote} isSaving={isSaving} 
                />
            </div>
        </div>
    );
};

export default QuoteFormPage;