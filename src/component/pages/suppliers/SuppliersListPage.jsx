// src/pages/SuppliersListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiSearch, FiTag, FiPhone, FiTruck, FiMapPin } from 'react-icons/fi';

// --- Reusable Components ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, supplierName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold text-slate-800">Confirm Deletion</h2>
                <p className="my-4 text-slate-600">
                    Are you sure you want to delete the supplier: <strong className="font-semibold">{supplierName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
};

const SupplierCardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border animate-pulse">
        <div className="flex justify-between items-center">
            <div className="w-2/3 h-5 bg-slate-200 rounded"></div>
            <div className="w-1/4 h-5 bg-slate-200 rounded"></div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="w-full h-4 bg-slate-200 rounded"></div>
            <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
        </div>
    </div>
);


const SuppliersListPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                // Using the full API endpoint
                const response = await axios.get('https://mountain-chain.onrender.com/mountainchain/api/suppliers'); 
                setSuppliers(response.data.data);
                setFilteredSuppliers(response.data.data);
            } catch (error) {
                toast.error('Failed to fetch suppliers.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = suppliers.filter(s => 
            s.companyName.toLowerCase().includes(term) ||
            s.contacts[0]?.contactName.toLowerCase().includes(term)
        );
        setFilteredSuppliers(filtered);
    };

    const handleDelete = async () => {
        if (!supplierToDelete) return;
        try {
            // Using the full API endpoint for deletion
            await axios.delete(`https://mountain-chain.onrender.com/mountainchain/api/suppliers/${supplierToDelete._id}`);
            
            const updatedList = suppliers.filter(s => s._id !== supplierToDelete._id);
            setSuppliers(updatedList);
            setFilteredSuppliers(updatedList);
            toast.success(`Supplier "${supplierToDelete.companyName}" deleted.`);
        } catch (error) {
            toast.error('Failed to delete supplier.');
        } finally {
            setSupplierToDelete(null);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <Toaster position="top-right" />
            <DeleteConfirmationModal
                isOpen={!!supplierToDelete}
                onClose={() => setSupplierToDelete(null)}
                onConfirm={handleDelete}
                supplierName={supplierToDelete?.companyName}
            />
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Suppliers</h1>
                        <p className="text-slate-500 mt-1">Manage your transporter companies and single drivers.</p>
                    </div>
                    <button onClick={() => navigate('/suppliers/new')}             className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition flex items-center"
>
                        <FiPlus className="mr-2"/> New Supplier
                    </button>

                    
                </header>

                <div className="mb-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search by company or contact name..." onChange={handleSearch} className="w-full max-w-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                </div>

                {/* --- Content Area --- */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => <SupplierCardSkeleton key={i} />)}
                        </div>
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="text-center p-12">
                            <FiUsers className="mx-auto text-5xl text-slate-400 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700">No Suppliers Found</h3>
                            <p className="text-slate-500 mt-2">Get started by adding your first supplier.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {filteredSuppliers.map(supplier => (
                                <li key={supplier._id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-indigo-600 flex items-center">
                                                <FiTag className="mr-2"/> {supplier.supplierType}
                                            </p>
                                            <h3 className="text-lg font-bold text-slate-800 mt-1">{supplier.companyName}</h3>
                                            
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mt-3">
                                                <p className="flex items-center"><FiUsers className="mr-2 text-slate-400"/> {supplier.contacts[0]?.contactName}</p>
                                                <p className="flex items-center"><FiPhone className="mr-2 text-slate-400"/> {supplier.contacts[0]?.contactPhone}</p>
                                                {supplier.cabDetails?.cabName && <p className="flex items-center"><FiTruck className="mr-2 text-slate-400"/> {supplier.cabDetails.cabName} ({supplier.cabDetails.cabType})</p>}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 w-full sm:w-auto">
                                            <button onClick={() => navigate(`/suppliers/edit/${supplier._id}`)} className="flex-1 sm:flex-initial flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                                                <FiEdit className="mr-2" /> Edit
                                            </button>
                                            <button onClick={() => setSupplierToDelete(supplier)} className="flex-1 sm:flex-initial flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                                                <FiTrash2 className="mr-2" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuppliersListPage;