// src/pages/SuppliersPage.jsx

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
} from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// --- Reusable UI Components ---

const SkeletonLoader = () => (
  <div className="flex items-center justify-between p-4 animate-pulse">
    <div className="w-1/4 h-5 bg-slate-200 rounded"></div>
    <div className="w-1/3 h-5 bg-slate-200 rounded"></div>
    <div className="w-1/4 h-5 bg-slate-200 rounded"></div>
    <div className="w-8 h-5 bg-slate-200 rounded"></div>
  </div>
);

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">
            Edit Destinations for{" "}
            <span className="text-blue-600">{supplier.companyName}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <FiX />
          </button>
        </div>
        <div className="p-4 ">
          <label className="text-sm font-medium text-slate-600 mb-2 block">
            Trip Destinations
          </label>
          <Select
            isMulti
            options={allDestinations}
            value={selectedDestinations}
            onChange={setSelectedDestinations}
            placeholder="Select destination(s)..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
        <div className="p-4 bg-slate-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-white border rounded-md hover:bg-slate-100 text-black"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-black bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDestination, setFilterDestination] = useState(null);
  const [filterArchived, setFilterArchived] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, destinationsRes] = await Promise.all([
        axios.get(
          "https://mountain-chain.onrender.com/mountainchain/api/suppliers"
        ),
        axios.get(
          "https://mountain-chain.onrender.com/mountainchain/api/destination/destinationlist"
        ),
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

  const handleUpdateSupplierInList = (supplierId, updatedDestinations) => {
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
    <div className="bg-slate-50 min-h-screen font-sans">
      <Toaster position="top-right" />
      {editingSupplier && (
        <EditTripDestinationPopup
          supplier={editingSupplier}
          allDestinations={destinationOptions}
          onClose={() => setEditingSupplier(null)}
          onSave={handleUpdateSupplierInList}
        />
      )}

      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Cab Types</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64 text-black">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="p-2.5 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50"
            >
              <FiFilter />
            </button>
            <button
              onClick={() => navigate("/suppliers/new")}
              className="p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiPlus />
            </button>
          </div>
        </header>

        <main className="flex gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
              <span>
                Showing {filteredSuppliers.length} of {suppliers.length} items
              </span>
              <button
                onClick={fetchData}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <FiRefreshCw size={14} />
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="hidden md:grid grid-cols-10 gap-4 font-semibold text-xs text-slate-600 uppercase p-4 border-b border-slate-200">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Company / Contact</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {loading ? (
                <div className="divide-y divide-slate-200">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonLoader key={i} />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {filteredSuppliers.map((supplier) => (
                    <li
                      key={supplier._id}
                      className="grid grid-cols-1 md:grid-cols-10 gap-x-4 gap-y-2 p-4 items-center"
                    >
                      {/* UPDATED: Cab Name Display Logic */}
                      <div className="md:col-span-4 text-sm">
                        {supplier.cabs && supplier.cabs.length > 0 ? (
                          <div className="space-y-1">
                            {supplier.cabs.map((cab, index) => (
                              <div key={index} className="flex items-center">
                                <FaCarSide className="mr-2 text-slate-400" />
                                <span className="font-semibold text-slate-800">
                                  {cab.cabName}
                                </span>
                                <span className="text-slate-500 ml-2">
                                  ({cab.cabType} - {cab.numberOfSeater} Seater)
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-700 italic">
                            {supplier.companyName} (No Cabs Added)
                          </span>
                        )}
                      </div>
                      {/* UPDATED: Created By Display */}
                      <div className="md:col-span-3 text-sm text-slate-600">
                        <div className="font-medium text-slate-800">
                          {supplier.companyName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {supplier.contacts[0]?.contactName || "N/A"} - on{" "}
                          {format(new Date(supplier.createdAt), "dd MMM, yyyy")}
                        </div>
                      </div>
                      <div className="md:col-span-2 text-sm text-slate-500">
                        {formatDistanceToNow(new Date(supplier.updatedAt), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <div className="relative group">
                          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                            <FiMoreVertical />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10 hidden group-hover:block">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/suppliers/edit/${supplier._id}`);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <FiEdit className="mr-2" /> Edit Supplier
                            </a>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingSupplier(supplier);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <FiMapPin className="mr-2" /> Edit Destinations
                            </a>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Filter Sidebar */}
          <aside
            className={`w-72 bg-white border-l border-slate-200 shadow-lg fixed top-0 right-0 h-full z-40 transform transition-transform duration-300 ease-in-out text-slate-900 ${
              isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX />
              </button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">
                  Trip Destinations
                </label>
                <Select
                  options={destinationOptions}
                  value={filterDestination}
                  onChange={setFilterDestination}
                  isClearable
                  placeholder="Select destination(s)..."
                />
              </div>
              <div className="flex items-center">
                <input
                  id="archived"
                  type="checkbox"
                  checked={filterArchived}
                  onChange={(e) => setFilterArchived(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="archived"
                  className="ml-2 text-sm text-slate-600 flex items-center"
                >
                  <FiArchive className="mr-2 opacity-60" /> Archived only
                </label>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-white border rounded-md hover:bg-slate-100"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-balck bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default SuppliersPage;
