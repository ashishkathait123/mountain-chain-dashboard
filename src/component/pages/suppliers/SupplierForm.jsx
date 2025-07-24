// src/pages/SupplierForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FiUsers, FiTag, FiPhone, FiTruck, FiMapPin, FiChevronRight, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaRegBuilding, FaUserCircle } from 'react-icons/fa';

// --- Reusable Components ---

const InputField = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

// --- Main Form Component ---

const SupplierForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    
    // UPDATED: State now uses a 'cabs' array and a 'contacts' array
    const [formData, setFormData] = useState({
        supplierType: 'Transporter Company',
        companyName: '',
        contacts: [{ contactName: '', contactPhone: '', contactEmail: '' }],
        cabs: [{ cabName: '', cabType: 'Sedan', numberOfSeater: '', price: '' }],
        tripDestinations: [],
    });
    
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [destinationsLoading, setDestinationsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEditing);

    // Fetch destinations for the dropdown
    useEffect(() => {
        setDestinationsLoading(true);
        axios.get('https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist')
            .then(res => {
                const options = res.data.data.map(dest => ({ value: dest._id, label: dest.name }));
                setDestinationOptions(options);
            })
            .catch(() => toast.error("Could not load destinations."))
            .finally(() => setDestinationsLoading(false));
    }, []);

    // Fetch existing supplier data if in editing mode
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            axios.get(`https://mountain-chain.onrender.com/mountainchain/api/suppliers/${id}`)
                .then(res => {
                    const { supplierType, companyName, contacts, cabs, tripDestinations } = res.data.data;
                    setFormData({
                        supplierType,
                        companyName,
                        contacts: contacts.length ? contacts : [{ contactName: '', contactPhone: '', contactEmail: '' }],
                        cabs: cabs.length ? cabs : [{ cabName: '', cabType: 'Sedan', numberOfSeater: '', price: '' }],
                        tripDestinations: tripDestinations.map(d => d._id),
                    });
                    setSelectedDestinations(tripDestinations.map(d => ({ value: d._id, label: d.name })));
                })
                .catch(() => toast.error("Failed to load supplier data."))
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    // --- Handlers for Form Fields ---

    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactChange = (index, e) => {
        const { name, value } = e.target;
        const updatedContacts = [...formData.contacts];
        updatedContacts[index][name] = value;
        setFormData(prev => ({ ...prev, contacts: updatedContacts }));
    };
    
    const handleCabChange = (index, e) => {
        const { name, value } = e.target;
        const updatedCabs = [...formData.cabs];
        updatedCabs[index][name] = value;
        setFormData(prev => ({ ...prev, cabs: updatedCabs }));
    };

    const addCab = () => {
        setFormData(prev => ({
            ...prev,
            cabs: [...prev.cabs, { cabName: '', cabType: 'Sedan', numberOfSeater: '', price: '' }]
        }));
    };
    
    const removeCab = (index) => {
        if (formData.cabs.length > 1) {
            const updatedCabs = formData.cabs.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, cabs: updatedCabs }));
        } else {
            toast.error("You must have at least one cab.");
        }
    };

    const handleDestinationChange = (selectedOptions) => {
        setSelectedDestinations(selectedOptions || []);
        const destinationIds = (selectedOptions || []).map(opt => opt.value);
        setFormData(prev => ({ ...prev, tripDestinations: destinationIds }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading(isEditing ? 'Updating supplier...' : 'Creating supplier...');

        try {
            // The formData is now in the correct structure for the backend
            const apiCall = isEditing 
                ? axios.put(`https://mountain-chain.onrender.com/mountainchain/api/suppliers/${id}`, formData)
                // When creating, we can use the same formData structure
                : axios.post('https://mountain-chain.onrender.com/mountainchain/api/suppliers', formData);

            await apiCall;
            toast.dismiss(toastId);
            toast.success(`Supplier ${isEditing ? 'updated' : 'created'} successfully!`);
            navigate('/supplier-list'); // Navigate to your list page
        } catch (error) {
            toast.dismiss(toastId);
            const message = error.response?.data?.message || 'An error occurred.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-12">Loading form...</div>;

    return (
        <div className="bg-slate-100 min-h-screen">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6 flex items-center text-sm">
                    <Link to="/supplier-list" className="flex items-center text-slate-500 hover:text-indigo-600"><FiArrowLeft className="mr-2" /> Suppliers</Link>
                    <FiChevronRight className="mx-2 text-slate-400" />
                    <span className="font-semibold text-slate-700">{isEditing ? 'Edit Supplier' : 'New Supplier'}</span>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-8">
                            {/* --- Supplier Type --- */}
                            <section>
                                <div className="flex items-start"><FiTag className="text-slate-500 mr-4 mt-1 h-5 w-5" />
                                    <div><h3 className="text-lg font-semibold text-slate-800">Cab Supplier Type</h3><p className="text-sm text-slate-500">Select if this is a company or a single driver.</p></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:ml-9">
                                    {['Transporter Company', 'Single Driver'].map(type => (
                                        <label key={type} className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.supplierType === type ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-300 hover:border-slate-400'}`}>
                                            <div className="flex items-center"><input type="radio" name="supplierType" value={type} checked={formData.supplierType === type} onChange={handleGeneralChange} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"/><div className="ml-3 text-sm"><p className="font-bold text-slate-800 flex items-center">{type} {type === 'Transporter Company' ? <FaRegBuilding className="ml-2 text-slate-500"/> : <FaUserCircle className="ml-2 text-slate-500"/>}</p><p className="text-slate-500 text-xs mt-1">{type === 'Transporter Company' ? 'For multi-driver/cab companies.' : 'If the driver is the only person.'}</p></div></div>
                                        </label>
                                    ))}
                                </div>
                            </section>
                            <hr/>
                            {/* --- Company Details --- */}
                             <section>
                                <div className="flex items-start"><FiUsers className="text-slate-500 mr-4 mt-1 h-5 w-5" />
                                    <div><h3 className="text-lg font-semibold text-slate-800">Company Details</h3><p className="text-sm text-slate-500">Provide the company or agent name.</p></div>
                                </div>
                                <div className="mt-4 sm:ml-9">
                                    <InputField label="Name">
                                        <input type="text" name="companyName" value={formData.companyName} onChange={handleGeneralChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Sample Transportations"/>
                                    </InputField>
                                </div>
                            </section>
                            <hr/>
                             {/* --- Contact Details (Only shows the first contact for simplicity) --- */}
                             <section>
                                <div className="flex items-start"><FiPhone className="text-slate-500 mr-4 mt-1 h-5 w-5" />
                                    <div><h3 className="text-lg font-semibold text-slate-800">Primary Contact</h3><p className="text-sm text-slate-500">Provide the main contact's details.</p></div>
                                </div>
                                <div className="mt-4 sm:ml-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <InputField label="Contact Name" required>
                                        <input type="text" name="contactName" value={formData.contacts[0].contactName} onChange={(e) => handleContactChange(0, e)} required className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Sample Name"/>
                                    </InputField>
                                     <InputField label="Contact Phone" required>
                                        <input type="tel" name="contactPhone" value={formData.contacts[0].contactPhone} onChange={(e) => handleContactChange(0, e)} required className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="+91..."/>
                                    </InputField>
                                     <InputField label="Contact Email">
                                        <input type="email" name="contactEmail" value={formData.contacts[0].contactEmail} onChange={(e) => handleContactChange(0, e)} className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="domain@example.com"/>
                                    </InputField>
                                </div>
                            </section>
                            <hr/>
                            {/* --- Trip Destinations --- */}
                            <section>
                                <div className="flex items-start"><FiMapPin className="text-slate-500 mr-4 mt-1 h-5 w-5" />
                                    <div><h3 className="text-lg font-semibold text-slate-800">Operating Destinations</h3><p className="text-sm text-slate-500">Select where this supplier operates.</p></div>
                                </div>
                                <div className="mt-4 sm:ml-9">
                                     <Select isMulti options={destinationOptions} value={selectedDestinations} onChange={handleDestinationChange} isLoading={destinationsLoading} isDisabled={destinationsLoading} placeholder="Select destinations..." classNamePrefix="react-select"/>
                                </div>
                            </section>
                            <hr/>
                            {/* --- UPDATED: Dynamic Cab Details Section --- */}
                            <section>
                                <div className="flex items-start"><FiTruck className="text-slate-500 mr-4 mt-1 h-5 w-5" />
                                    <div><h3 className="text-lg font-semibold text-slate-800">Cab Fleet</h3><p className="text-sm text-slate-500">Add one or more cabs provided by this supplier.</p></div>
                                </div>
                                <div className="mt-4 sm:ml-9 space-y-6">
                                    {formData.cabs.map((cab, index) => (
                                        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                                            {formData.cabs.length > 1 && (
                                                <button type="button" onClick={() => removeCab(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200">
                                                    <FiTrash2 size={14}/>
                                                </button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputField label="Cab Name" required><input type="text" name="cabName" value={cab.cabName} onChange={(e) => handleCabChange(index, e)} required className="w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., Toyota Innova"/></InputField>
                                                <InputField label="Cab Type" required><select name="cabType" value={cab.cabType} onChange={(e) => handleCabChange(index, e)} required className="w-full border-slate-300 rounded-md shadow-sm">{['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Tempo Traveller', 'Minibus'].map(type => <option key={type} value={type}>{type}</option>)}</select></InputField>
                                                <InputField label="Number of Seater" required><input type="number" name="numberOfSeater" value={cab.numberOfSeater} onChange={(e) => handleCabChange(index, e)} required className="w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., 7"/></InputField>
                                                <InputField label="Price (per day)" required><input type="number" name="price" value={cab.price} onChange={(e) => handleCabChange(index, e)} required className="w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., 4500"/></InputField>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addCab} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-4">
                                        <FiPlus className="mr-1"/> Add Another Cab
                                    </button>
                                </div>
                            </section>
                        </div>
                        {/* --- Footer with Actions --- */}
                        <div className="bg-slate-50 px-6 py-4 flex justify-end items-center gap-4 rounded-b-xl">
                             <button type="button" onClick={() => navigate('/supplier-list')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center">
                                {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                Save Details
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupplierForm;