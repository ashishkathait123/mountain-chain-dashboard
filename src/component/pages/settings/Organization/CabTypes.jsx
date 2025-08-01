import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";

import { format, formatDistanceToNow } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiMoreVertical,
  FiX,
  FiArchive,
  FiPlus,
  FiEdit,
  FiMapPin,
  FiChevronRight,
  FiCheck,
  FiUser,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Reusable UI Components ---
const SkeletonLoader = () => (
  <div className="flex items-center justify-between p-4">
    <div className="space-y-2 w-full">
      <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse w-3/4"></div>
      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse w-1/2"></div>
    </div>
    <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
  </div>
);

const EditSupplierPopup = ({ supplier, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    contacts: [{ contactName: "", phone: "", email: "" }],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        companyName: supplier.companyName || "",
        contacts: supplier.contacts?.length
          ? [...supplier.contacts]
          : [{ contactName: "", phone: "", email: "" }],
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [name]: value };
    setFormData((prev) => ({ ...prev, contacts: updatedContacts }));
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { contactName: "", phone: "", email: "" }],
    }));
  };

  const removeContact = (index) => {
    if (formData.contacts.length <= 1) return;
    const updatedContacts = [...formData.contacts];
    updatedContacts.splice(index, 1);
    setFormData((prev) => ({ ...prev, contacts: updatedContacts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await axios.put(
        `https://mountain-chain.onrender.com/mountainchain/api/suppliers/${supplier._id}`,
        formData
      );
      toast.success("Supplier updated successfully!");
      onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-semibold text-gray-800 text-lg">
            Edit Supplier: <span className="text-blue-600">{supplier.companyName}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contacts
              </label>
              <button
                type="button"
                onClick={addContact}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
              >
                + Add Contact
              </button>
            </div>

            {formData.contacts.map((contact, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 rounded-lg relative">
                {formData.contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <FiX size={16} />
                  </button>
                )}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-gray-400" />
                    <input
                      type="text"
                      name="contactName"
                      placeholder="Contact Name"
                      value={contact.contactName}
                      onChange={(e) => handleContactChange(index, e)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiPhone className="text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, e)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMail className="text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, e)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-black"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditTripDestinationPopup = ({
  supplier,
  allDestinations,
  onClose,
  onSave,
}) => {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentDests = supplier.tripDestinations.map((d) => ({
      value: d._id,
      label: d.name,
    }));
    setSelectedDestinations(currentDests);
  }, [supplier]);

  const handleSave = async () => {
    setIsSaving(true);
    const destinationIds = selectedDestinations.map((d) => d.value);

    try {
      await axios.put(
        `https://mountain-chain.onrender.com/mountainchain/api/suppliers/${supplier._id}`,
        {
          tripDestinations: destinationIds,
        }
      );
      toast.success(`Destinations for "${supplier.companyName}" updated!`);
      onSave(supplier._id, selectedDestinations);
      onClose();
    } catch (error) {
      console.error("Error updating destinations:", error);
      toast.error("Failed to update destinations.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-semibold text-gray-800 text-lg">
            Edit Destinations for{" "}
            <span className="text-blue-600 font-bold">{supplier.companyName}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-5">
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Trip Destinations
          </label>
          <Select
            isMulti
            options={allDestinations}
            value={selectedDestinations}
            onChange={setSelectedDestinations}
            placeholder="Select destination(s)..."
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({
                ...base,
                minHeight: '44px',
                borderRadius: '10px',
                borderColor: '#e2e8f0',
                '&:hover': {
                  borderColor: '#cbd5e0'
                }
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected
                  ? '#3b82f6'
                  : isFocused
                  ? '#f1f5f9'
                  : 'white',
                color: isSelected ? 'white' : '#1e293b',
                ':active': {
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }
              })
            }}
          />
        </div>
        <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-black"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Page Component ---
const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingDestinations, setEditingDestinations] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDestination, setFilterDestination] = useState(null);
  const [filterArchived, setFilterArchived] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, destinationsRes] = await Promise.all([
        axios.get("https://mountain-chain.onrender.com/mountainchain/api/suppliers"),
        axios.get("https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist"),
      ]);
      setSuppliers(suppliersRes.data.data || []);
      setDestinations(destinationsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Could not fetch necessary data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const searchMatch =
        searchTerm === "" ||
        supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.cabs &&
          supplier.cabs.some((cab) =>
            cab.cabName.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const destinationMatch =
        !filterDestination ||
        supplier.tripDestinations.some(
          (d) => d._id === filterDestination.value
        );
      const archivedMatch = !filterArchived || supplier.isArchived;

      return searchMatch && destinationMatch && archivedMatch;
    });
  }, [suppliers, searchTerm, filterDestination, filterArchived]);

  const handleUpdateSupplier = (updatedSupplier) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier._id === updatedSupplier._id ? updatedSupplier : supplier
      )
    );
  };

  const handleUpdateSupplierDestinations = (supplierId, updatedDestinations) => {
    setSuppliers((prev) =>
      prev.map((supplier) => {
        if (supplier._id === supplierId) {
          return {
            ...supplier,
            tripDestinations: updatedDestinations.map((d) => ({
              _id: d.value,
              name: d.label,
            })),
          };
        }
        return supplier;
      })
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterDestination(null);
    setFilterArchived(false);
    setIsFilterOpen(false);
    toast("Filters Reset!", { icon: "🧹" });
  };

  const destinationOptions = useMemo(
    () => destinations.map((d) => ({ value: d._id, label: d.name })),
    [destinations]
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      <Toaster position="top-right" />
      <AnimatePresence>
        {editingSupplier && (
          <EditSupplierPopup
            supplier={editingSupplier}
            onClose={() => setEditingSupplier(null)}
            onSave={handleUpdateSupplier}
          />
        )}
        {editingDestinations && (
          <EditTripDestinationPopup
            supplier={editingDestinations}
            allDestinations={destinationOptions}
            onClose={() => setEditingDestinations(null)}
            onSave={handleUpdateSupplierDestinations}
          />
        )}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto p-4 md:p-6">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cab Suppliers</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your transportation providers</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers or cabs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(true)}
              className="p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 transition flex items-center"
            >
              <FiFilter className="mr-1.5" />
              <span className="hidden sm:inline">Filters</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/suppliers/new")}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition flex items-center"
            >
              <FiPlus className="mr-1.5" />
              <span className="hidden sm:inline">New Supplier</span>
            </motion.button>
          </div>
        </motion.header>

        <main className="relative">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="bg-white px-3 py-1.5 rounded-full shadow-xs border border-gray-200">
              Showing <span className="font-semibold text-blue-600">{filteredSuppliers.length}</span> of{" "}
              <span className="font-semibold">{suppliers.length}</span> suppliers
            </span>
            <motion.button
              whileHover={{ rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchData}
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100"
            >
              <FiRefreshCw size={16} />
            </motion.button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 font-semibold text-xs text-gray-500 uppercase tracking-wider p-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-5">Cab Details</div>
              <div className="col-span-3">Company / Contact</div>
              <div className="col-span-2">Destinations</div>
              <div className="col-span-2 text-right">Last Updated</div>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <SkeletonLoader key={i} />
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiSearch className="text-gray-400 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No suppliers found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterDestination || filterArchived
                    ? "Try adjusting your search or filters"
                    : "No suppliers available yet"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetFilters();
                    if (!searchTerm && !filterDestination && !filterArchived) {
                      navigate("/suppliers/new");
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition"
                >
                  {searchTerm || filterDestination || filterArchived
                    ? "Reset Filters"
                    : "Add First Supplier"}
                </motion.button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <motion.li
                    key={supplier._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="md:col-span-5">
                      {supplier.cabs && supplier.cabs.length > 0 ? (
                        <div className="space-y-2">
                          {supplier.cabs.map((cab, index) => (
                            <div key={index} className="flex items-start">
                              <div className="bg-blue-100 p-1.5 rounded-lg mr-3 mt-0.5">
                                <FaCarSide className="text-blue-600 text-sm" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800">{cab.cabName}</h3>
                                <p className="text-xs text-gray-500">
                                  {cab.cabType} • {cab.numberOfSeater} Seater
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-1.5 rounded-lg mr-3">
                            <FaCarSide className="text-gray-400 text-sm" />
                          </div>
                          <span className="font-medium text-gray-700 italic">
                            {supplier.companyName} (No cabs)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-3">
                      <div className="font-medium text-gray-800">{supplier.companyName}</div>
                      <div className="text-xs text-gray-500">
                        {supplier.contacts[0]?.contactName || "No contact"} • Created{" "}
                        {format(new Date(supplier.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {supplier.tripDestinations.slice(0, 3).map((dest, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                          >
                            {dest.name}
                          </span>
                        ))}
                        {supplier.tripDestinations.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            +{supplier.tripDestinations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-end">
                      <div className="text-sm text-gray-500 mr-3">
                        {formatDistanceToNow(new Date(supplier.updatedAt), {
                          addSuffix: true,
                        })}
                      </div>
                     <div className="relative group">
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
  >
    <FiMoreVertical />
  </motion.button>
  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
    <motion.button
      whileHover={{ x: 2 }}
      onClick={() => navigate(`/suppliers/edit/${supplier._id}`)}
      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
    >
      <FiEdit className="mr-2 text-blue-500" /> Edit Supplier
    </motion.button>
    <motion.button
      whileHover={{ x: 2 }}
      onClick={() => setEditingDestinations(supplier)}
      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
    >
      <FiMapPin className="mr-2 text-purple-500" /> Edit Destinations
    </motion.button>
  </div>
</div>

                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </main>

        {/* Filter Sidebar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 border-l border-gray-200"
            >
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="font-semibold text-lg text-gray-800">Advanced Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-5 space-y-6 h-[calc(100%-120px)] overflow-y-auto text-black">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Trip Destinations
                  </label>
                  <Select
                    options={destinationOptions}
                    value={filterDestination}
                    onChange={setFilterDestination}
                    isClearable
                    placeholder="Filter by destination..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '44px',
                        borderRadius: '10px',
                        borderColor: '#e2e8f0',
                        '&:hover': {
                          borderColor: '#cbd5e0'
                        }
                      }),
                      option: (base, { isFocused, isSelected }) => ({
                        ...base,
                        backgroundColor: isSelected
                          ? '#3b82f6'
                          : isFocused
                          ? '#f1f5f9'
                          : 'white',
                        color: isSelected ? 'white' : '#1e293b',
                        ':active': {
                          backgroundColor: '#3b82f6',
                          color: 'white'
                        }
                      })
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="archived"
                    type="checkbox"
                    checked={filterArchived}
                    onChange={(e) => setFilterArchived(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="archived"
                    className="ml-2 text-sm text-gray-600 flex items-center"
                  >
                    <FiArchive className="mr-2 text-gray-400" /> Show archived only
                  </label>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Reset All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuppliersPage;