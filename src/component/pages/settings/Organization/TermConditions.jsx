import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiType, FiBold, FiItalic, FiDollarSign, FiList, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrganizationTermsConditions = () => {
  const [name, setName] = useState('');
  const [termsText, setTermsText] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingTerms, setExistingTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
  const navigate = useNavigate();

  const token = sessionStorage.getItem('token');

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch existing terms when component mounts
  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await axios.get('http://localhost:5500/mountainchain/api/terms-and-conditions', getAuthHeaders());
      const terms = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setExistingTerms(terms);
    } catch (error) {
      toast.error('Failed to fetch existing terms');
      console.error('Error fetching terms:', error);
    }
  };

  // Load selected term data
  useEffect(() => {
    if (selectedTerm && viewMode === 'edit') {
      const term = existingTerms.find(t => t._id === selectedTerm);
      if (term) {
        setName(term.name);
        setTermsText(term.termsAndConditionsText);
      }
    } else {
      setName('');
      setTermsText('');
    }
  }, [selectedTerm, existingTerms, viewMode]);

  const handleSave = async () => {
    if (!name.trim() || !termsText.trim()) {
      toast.error('Name and Terms text are required');
      return;
    }

    setLoading(true);
    try {
      if (selectedTerm) {
        // Update existing term
        await axios.put(
          `http://localhost:5500/mountainchain/api/terms-and-conditions/${selectedTerm}`,
          {
            name,
            termsAndConditionsText: termsText,
          },
          getAuthHeaders()
        );
        toast.success('Terms updated successfully');
      } else {
        // Create new term
        await axios.post(
          'http://localhost:5500/mountainchain/api/terms-and-conditions',
          {
            name,
            termsAndConditionsText: termsText,
          },
          getAuthHeaders()
        );
        toast.success('Terms created successfully');
      }

      // Refresh the list
      await fetchTerms();
      setSelectedTerm(null);
      setViewMode('list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save terms');
      console.error('Error saving terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await axios.delete(
          `http://localhost:5500/mountainchain/api/terms-and-conditions/${id}`,
          getAuthHeaders()
        );
        toast.success('Term deleted successfully');
        await fetchTerms();
        if (selectedTerm === id) {
          setSelectedTerm(null);
          setViewMode('list');
        }
      } catch (error) {
        toast.error('Failed to delete term');
        console.error('Error deleting term:', error);
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setTermsText('');
    setSelectedTerm(null);
    setIsPreview(false);
    setViewMode('list');
  };

  const applyFormatting = (format) => {
    const textarea = document.getElementById('termsText');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = termsText.substring(start, end);
    let newText = termsText;

    switch (format) {
      case 'header':
        newText = termsText.substring(0, start) + `## ${selectedText} ##` + termsText.substring(end);
        break;
      case 'bold':
        newText = termsText.substring(0, start) + `**${selectedText}**` + termsText.substring(end);
        break;
      case 'italic':
        newText = termsText.substring(0, start) + `_${selectedText}_` + termsText.substring(end);
        break;
      case 'bullet':
        newText = termsText.substring(0, start) + `\n- ${selectedText}\n` + termsText.substring(end);
        break;
      case 'currency':
        newText = termsText.substring(0, start) + `$${selectedText}` + termsText.substring(end);
        break;
      default:
        break;
    }

    setTermsText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 3, end + 3);
    }, 0);
  };

  // Filter terms based on search
  const filteredTerms = existingTerms.filter(term =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.termsAndConditionsText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTerms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderList = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden text-black">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Terms & Conditions List</h2>
        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            setViewMode('edit');
            setSelectedTerm(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create New
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((term) => (
                <tr key={term._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{term.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {term.termsAndConditionsText.substring(0, 100)}
                    {term.termsAndConditionsText.length > 100 && '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedTerm(term._id);
                        setViewMode('edit');
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(term._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No matching terms found' : 'No terms available. Create one!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTerms.length > itemsPerPage && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredTerms.length)}
                </span>{' '}
                of <span className="font-medium">{filteredTerms.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditor = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden text-black">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {selectedTerm ? 'Edit Terms and Conditions' : 'Create New Terms and Conditions'}
        </h1>

        {/* Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination/Region Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter destination/region name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Editor Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-md ${!isPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Write
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-md ${isPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Preview
          </button>
          <div className="border-l border-gray-300 h-6 mx-2"></div>
          <button onClick={() => applyFormatting('header')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Header">
            <FiType />
          </button>
          <button onClick={() => applyFormatting('bold')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Bold">
            <FiBold />
          </button>
          <button onClick={() => applyFormatting('italic')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Italic">
            <FiItalic />
          </button>
          <button onClick={() => applyFormatting('bullet')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Bullet List">
            <FiList />
          </button>
          <button onClick={() => applyFormatting('currency')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Currency">
            <FiDollarSign />
          </button>
        </div>

        {/* Editor / Preview */}
        <div className="mb-6">
          {isPreview ? (
            <div className="min-h-48 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              <div className="prose max-w-none">
                {termsText ? (
                  termsText.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">
                      {paragraph.startsWith('## ') && paragraph.endsWith(' ##') ? (
                        <strong className="text-lg block my-2">{paragraph.slice(3, -3)}</strong>
                      ) : paragraph.startsWith('- ') ? (
                        <li>{paragraph.slice(2)}</li>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No content to preview</p>
                )}
              </div>
            </div>
          ) : (
            <textarea
              id="termsText"
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              placeholder="Type terms and conditions here"
              className="w-full min-h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mb-6 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p>
            Please avoid using your business name in Terms and Conditions. Business signature along with 
            contact details will be automatically added to the itinerary. This also allows easy sharing 
            of Terms between businesses when sharing packages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <FiX className="inline mr-2" />
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="inline mr-2" />
                Save Details
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {viewMode === 'list' ? renderList() : renderEditor()}
      </div>
    </div>
  );
};

export default OrganizationTermsConditions;