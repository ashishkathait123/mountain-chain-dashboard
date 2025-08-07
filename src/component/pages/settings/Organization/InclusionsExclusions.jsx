import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, X, ChevronRight, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "https://mountain-chain.onrender.com/mountainchain/api/enex";

const OrganizationInclusionsExclusions = () => {
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [activeTab, setActiveTab] = useState("inclusions");

  useEffect(() => {
    const fetchPresets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/presets`);
        if (!response.ok) {
          throw new Error('Failed to fetch presets');
        }
        const data = await response.json();
        setPresets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const handleOpenCreateModal = () => {
    setNewPresetName("");
    setCreateModalOpen(true);
  };

  const handleCreatePreset = async (e) => {
    e.preventDefault();
    if (!newPresetName.trim()) {
      setError("Preset name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ presetName: newPresetName, inclusions: [], exclusions: [] }),
      });

      if (!response.ok) {
        throw new Error('Failed to create preset');
      }

      const newPreset = await response.json();
      setPresets(prev => [...prev, newPreset]);
      setCreateModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePreset = async (id) => {
    if (window.confirm("Are you sure you want to delete this preset? This action cannot be undone.")) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/presets/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete preset');
        }
        setPresets((prev) => prev.filter((p) => p._id !== id));
        if (selectedPreset?._id === id) {
          setSelectedPreset(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddInclusion = () => {
    if (newInclusion.trim() && selectedPreset) {
      setSelectedPreset((prev) => ({
        ...prev,
        inclusions: [...prev.inclusions, newInclusion.trim()],
      }));
      setNewInclusion("");
    }
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim() && selectedPreset) {
      setSelectedPreset((prev) => ({
        ...prev,
        exclusions: [...prev.exclusions, newExclusion.trim()],
      }));
      setNewExclusion("");
    }
  };

  const handleRemoveInclusion = (item) => {
    setSelectedPreset((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((i) => i !== item),
    }));
  };

  const handleRemoveExclusion = (item) => {
    setSelectedPreset((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((e) => e !== item),
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedPreset) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/presets/${selectedPreset._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedPreset),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
      const updatedPreset = await response.json();
      setPresets((prev) =>
        prev.map((p) => (p._id === updatedPreset._id ? updatedPreset : p))
      );
      setSelectedPreset(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !selectedPreset && !isCreateModalOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading presets...</h2>
          <p className="text-gray-500 mt-2">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  if (error && !selectedPreset && !isCreateModalOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-black">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Error Loading Data</h2>
          <p className="text-red-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Inclusion & Exclusion Presets
            </h1>
            <p className="text-gray-600">
              Manage your organization's inclusion and exclusion criteria
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenCreateModal}
            className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all mt-4 md:mt-0 "
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Preset
          </motion.button>
        </div>

        {/* Preset Cards Grid */}
        {presets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Presets Found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first inclusion/exclusion preset
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow"
            >
              Create First Preset
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((preset) => (
              <motion.div
                key={preset._id}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-gray-800">{preset.presetName}</h3>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedPreset(preset)}
                      className="text-gray-500 hover:text-blue-600 transition"
                      aria-label="Edit preset"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeletePreset(preset._id)}
                      className="text-gray-500 hover:text-red-600 transition"
                      aria-label="Delete preset"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex space-x-4 mb-4">
                  <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">
                      {preset.inclusions.length}
                    </span>
                    <span className="text-blue-800 text-sm">Inclusions</span>
                  </div>
                  <div className="bg-purple-50 px-3 py-1 rounded-full flex items-center">
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">
                      {preset.exclusions.length}
                    </span>
                    <span className="text-purple-800 text-sm">Exclusions</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created by: {preset.createdBy || 'System'}</span>
                  <button
                    onClick={() => setSelectedPreset(preset)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition"
                  >
                    Edit <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Preset Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Create New Preset</h3>
                  <button
                    onClick={() => setCreateModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreatePreset}>
                  <div className="mb-6 text-black">
                    <label htmlFor="presetName" className="block text-sm font-medium text-gray-700 mb-2">
                      Preset Name
                    </label>
                    <input
                      id="presetName"
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      className="border border-gray-300 px-4 py-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="e.g. Standard Package"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300 transition"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl shadow hover:shadow-md disabled:opacity-70 transition flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Preset
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Preset Modal */}
        <AnimatePresence>
          {selectedPreset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-black"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Editing: {selectedPreset.presetName}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Add or remove inclusions and exclusions
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPreset(null)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab("inclusions")}
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "inclusions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Inclusions
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
{(selectedPreset?.inclusions || []).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("exclusions")}
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "exclusions" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Exclusions
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
{(selectedPreset?.exclusions || []).length}
                    </span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Inclusions Tab */}
                  {activeTab === "inclusions" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="font-medium text-lg mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-800 p-1.5 rounded-full mr-2">
                          <Check className="w-4 h-4" />
                        </span>
                        Inclusions
                      </h4>
                      {selectedPreset.inclusions.length > 0 ? (
                        <ul className="space-y-2 mb-4">
{(selectedPreset?.inclusions || []).map((item, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-between items-center bg-blue-50 p-3 rounded-lg"
                            >
                              <span className="text-blue-800">{item}</span>
                              <button
                                onClick={() => handleRemoveInclusion(item)}
                                className="text-red-500 hover:text-red-700 transition"
                                aria-label="Remove inclusion"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-4">
                          No inclusions added yet
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newInclusion}
                          onChange={(e) => setNewInclusion(e.target.value)}
                          className="border border-gray-300 px-4 py-2 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="Add new inclusion..."
                          onKeyPress={(e) => e.key === 'Enter' && handleAddInclusion()}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAddInclusion}
                          disabled={!newInclusion.trim()}
                          className="bg-blue-600 text-white p-2 rounded-xl disabled:bg-blue-300 transition"
                          aria-label="Add inclusion"
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Exclusions Tab */}
                  {activeTab === "exclusions" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="font-medium text-lg mb-4 flex items-center">
                        <span className="bg-purple-100 text-purple-800 p-1.5 rounded-full mr-2">
                          <X className="w-4 h-4" />
                        </span>
                        Exclusions
                      </h4>
                      {selectedPreset.exclusions.length > 0 ? (
                        <ul className="space-y-2 mb-4">
                          {selectedPreset.exclusions.map((item, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-between items-center bg-purple-50 p-3 rounded-lg"
                            >
                              <span className="text-purple-800">{item}</span>
                              <button
                                onClick={() => handleRemoveExclusion(item)}
                                className="text-red-500 hover:text-red-700 transition"
                                aria-label="Remove exclusion"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-purple-50 text-purple-800 p-4 rounded-lg mb-4">
                          No exclusions added yet
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExclusion}
                          onChange={(e) => setNewExclusion(e.target.value)}
                          className="border border-gray-300 px-4 py-2 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="Add new exclusion..."
                          onKeyPress={(e) => e.key === 'Enter' && handleAddExclusion()}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAddExclusion}
                          disabled={!newExclusion.trim()}
                          className="bg-purple-600 text-white p-2 rounded-xl disabled:bg-purple-300 transition"
                          aria-label="Add exclusion"
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveChanges}
                    disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrganizationInclusionsExclusions;