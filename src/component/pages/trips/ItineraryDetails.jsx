// src/components/ItineraryDetails.js

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Select from 'react-select';

const API_BASE_URL = "http://localhost:5500/mountainchain/api";

// Helper Component for Collapsible Sections
const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true); // Default to open
    return (
        <div className="border-t border-slate-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 font-semibold text-lg text-slate-800"
            >
                {title}
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isOpen && <div className="pb-4">{children}</div>}
        </div>
    );
};

const ItineraryDetails = ({ queryData, itinerary, setItinerary, inclusions, setInclusions, terms, setTerms }) => {
    // State for data fetched from APIs
    const [inclusionPresets, setInclusionPresets] = useState([]);
    const [termsPresets, setTermsPresets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch presets and terms when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                toast.error("Authentication required.");
                setIsLoading(false);
                return;
            }

            try {
                const [presetsRes, termsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/enex/presets`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/terms-and-conditions`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setInclusionPresets(presetsRes.data || []);
                setTermsPresets(termsRes.data || []);
            } catch (error) {
                toast.error("Failed to load presets or terms.");
                console.error("Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Generate the day-wise schedule based on query duration
    const daySchedule = useMemo(() => {
        if (!queryData?.startDate || !queryData?.duration) return [];

        const numberOfDays = parseInt(queryData.duration.split(',')[1].trim().split(' ')[0], 10);
        const startDate = new Date(queryData.startDate);
        
        const days = Array.from({ length: numberOfDays }, (_, i) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            return {
                day: i + 1,
                date: currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                weekday: currentDate.toLocaleDateString('en-GB', { weekday: 'long' })
            };
        });

        // Initialize itinerary state if it's empty
        if (itinerary.length !== days.length) {
            setItinerary(days.map(d => ({ day: d.day, title: '', description: '' })));
        }

        return days;
    }, [queryData, setItinerary]);

    // Handlers for Inclusions/Exclusions
    const handleInclusionChange = (index, field, value) => {
        const updated = [...inclusions];
        updated[index][field] = value;
        setInclusions(updated);
    };

    const addInclusionRow = () => {
        setInclusions([...inclusions, { id: Date.now(), category: 'Inclusions', included: '', excluded: '' }]);
    };

    const removeInclusionRow = (index) => {
        if (inclusions.length > 1) {
            setInclusions(inclusions.filter((_, i) => i !== index));
        }
    };

    const handlePresetSelect = (selectedOption) => {
        if (!selectedOption) {
            setInclusions([{ id: 1, category: 'Inclusions', included: '', excluded: '' }]);
            return;
        }
        const preset = inclusionPresets.find(p => p._id === selectedOption.value);
        if (preset) {
            const newInclusions = [{
                id: 1,
                category: 'Inclusions',
                included: preset.inclusions.join('\n'),
                excluded: preset.exclusions.join('\n')
            }];
            setInclusions(newInclusions);
        }
    };

    // Handler for Itinerary
    const handleItineraryChange = (index, field, value) => {
        const updated = [...itinerary];
        updated[index][field] = value;
        setItinerary(updated);
    };
    
    // Handler for Terms & Conditions
    const handleTermsSelect = (selectedOption) => {
        if (!selectedOption) {
            setTerms('');
            return;
        }
        const selectedTerms = termsPresets.find(t => t._id === selectedOption.value);
        if(selectedTerms) {
            setTerms(selectedTerms.termsAndConditionsText);
        }
    };

    // Options for React-Select
    const presetOptions = inclusionPresets.map(p => ({ value: p._id, label: p.presetName }));
    const termsOptions = termsPresets.map(t => ({ value: t._id, label: t.name }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
            {/* --- INCLUSION / EXCLUSION --- */}
            <Accordion title="Inclusion/Exclusion">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Select Inc/Exclusion Preset</label>
                        <Select
                            options={presetOptions}
                            isClearable
                            onChange={handlePresetSelect}
                            placeholder="Type to search..."
                            isLoading={isLoading}
                        />
                         <p className="text-xs text-slate-500 mt-1">Please provide inclusion/exclusion Details. Anything not in inclusion will be added to exclusion. Avoid adding redundant info like hotels, meal plans etc</p>
                    </div>
                    <div className="border rounded-md">
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 text-sm font-semibold">
                            <div className="col-span-5">Included</div>
                            <div className="col-span-5 text-red-600">Excluded</div>
                        </div>
                        {inclusions.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 border-t">
                               <div className="col-span-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="text"
                                        value={item.category}
                                        onChange={(e) => handleInclusionChange(index, 'category', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <textarea
                                        value={item.included}
                                        onChange={(e) => handleInclusionChange(index, 'included', e.target.value)}
                                        rows="4"
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className="col-span-5">
                                    <textarea
                                        value={item.excluded}
                                        onChange={(e) => handleInclusionChange(index, 'excluded', e.target.value)}
                                        rows="4"
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center pt-2">
                                    <button onClick={() => removeInclusionRow(index)} className="text-slate-400 hover:text-red-500"><FiX size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                        <button onClick={addInclusionRow} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                            <FiPlus className="mr-1"/> Add Inclusion/Exclusion
                        </button>
                        <p className="text-xs text-slate-500">Anything not in inclusions is excluded</p>
                    </div>
                </div>
            </Accordion>

            {/* --- DAY-WISE SCHEDULE --- */}
            <Accordion title="Day-wise Schedule">
                <div className="space-y-6">
                    {daySchedule.map((dayInfo, index) => (
                        <div key={dayInfo.day} className="grid grid-cols-12 gap-4">
                            <div className="col-span-2">
                                <div className="p-3 bg-slate-50 rounded-md text-center">
                                    <p className="font-bold text-blue-600">Day {dayInfo.day}</p>
                                    <p className="text-sm text-slate-600">{dayInfo.weekday}</p>
                                    <p className="text-xs text-slate-500">{dayInfo.date}</p>
                                </div>
                            </div>
                            <div className="col-span-10 grid grid-cols-2 gap-4">
                               <div className="col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Title of the Day visit"
                                        value={itinerary[index]?.title || ''}
                                        onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                               </div>
                               <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        placeholder="Please provide detailed description of the day visit..."
                                        rows="5"
                                        value={itinerary[index]?.description || ''}
                                        onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                               </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Accordion>
            
            {/* --- TERMS AND CONDITIONS --- */}
            <Accordion title="Terms and Conditions">
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Apply terms and conditions for this package</label>
                     <Select
                        options={termsOptions}
                        isClearable
                        onChange={handleTermsSelect}
                        placeholder="Select a terms & conditions preset..."
                        isLoading={isLoading}
                    />
                    <textarea
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        rows="6"
                        className="w-full p-2 mt-2 border rounded-md text-sm bg-slate-50"
                        placeholder="Terms and conditions will appear here..."
                    />
                </div>
            </Accordion>

            {/* --- OTHER INFORMATION --- */}
             <Accordion title="Other Information">
                {/* This can be built out later if needed */}
                <p className="text-sm text-slate-500">This section can be used for internal notes or other details.</p>
            </Accordion>

        </div>
    );
};

export default ItineraryDetails;