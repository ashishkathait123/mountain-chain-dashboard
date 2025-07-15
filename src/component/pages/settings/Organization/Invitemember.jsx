import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiMail, FiArrowLeft, FiPhone, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

const InviteMember = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumbers: [""],   
    role: "Sales Person",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const bubbles = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 10 + 10,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    console.log(`Field ${name} updated to:`, value);
  };

  const handlePhoneNumberChange = (index, value) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = value;
    setFormData((prev) => ({ ...prev, phoneNumbers: newPhoneNumbers }));
    console.log(`Phone number at index ${index} updated to:`, value);
  };

  const addPhoneNumberField = () => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, ""],
    }));
    console.log("Added new phone number field");
  };

  const removePhoneNumber = (index) => {
    const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, phoneNumbers: newPhoneNumbers }));
    console.log(`Removed phone number at index ${index}`);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Valid email is required");
      return false;
    }
    if (formData.phoneNumbers.every((num) => !num.trim())) {
      setError("At least one phone number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = sessionStorage.getItem("token");
    console.log("Token from sessionStorage:", token);

    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    const requestBody = {
      name: formData.name,
      email: formData.email,
      
      phoneNumbers: formData.phoneNumbers.filter((num) => num.trim() !== ""),
      role: formData.role,
    };
    console.log("Payload being sent:", requestBody);

    try {
      const response = await axios.post(
        "https://mountain-chain.onrender.com/mountainchain/api/create-user",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Request config:", response.config);
      console.log("Response data:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create user and send invitation");
      }

      setSuccess(true);
      setTimeout(() => navigate("/organization/users"), 1500);
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        responseData: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
        request: err.request,
      });
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while creating the user. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-blue-200 opacity-20"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
          initial={{ y: 0 }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 40 - 20, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex items-center justify-center min-h-screen p-4"
      >
        <div className="relative w-full max-w-md">
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate("/organization/users")}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FiArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-center flex-1">Invite New Member</h2>
                <button
                  onClick={() => navigate("/organization/users")}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-100 text-green-700 rounded-md"
                >
                  Member invited successfully! Redirecting...
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-100 text-red-700 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Numbers
                  </label>
                  {formData.phoneNumbers.map((phone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center mb-2"
                    >
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                          placeholder="+1 (123) 456-7890"
                          className="w-full pl-10 p-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removePhoneNumber(index)}
                          className="ml-2 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                  <motion.button
                    type="button"
                    onClick={addPhoneNumberField}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <FiPlus className="mr-2" /> Add another phone number
                  </motion.button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Sales Person">Sales Person</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center p-4 rounded-lg text-white shadow-sm mt-6 ${
                    loading
                      ? "bg-blue-400"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <FiMail className="mr-2" /> Send Invitation
                    </>
                  )}
                </motion.button>
              </motion.form>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm text-center text-gray-600"
          >
            The member will receive an email invitation to join your organization.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteMember;