import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();

  const API_URL_LOGIN = 'https://mountain-chain.onrender.com/mountainchain/api/login';

  const handleLoginChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Please fill all required fields!');
      setLoading(false);
      return;
    }

    console.log('Login request payload:', credentials);
    try {
      const response = await axios.post(API_URL_LOGIN, credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('API response:', response.data);

      const { token, user } = response.data; // Adjust based on actual API response structure
      if (token && user?.role) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('role', user.role);
        sessionStorage.setItem('userData', JSON.stringify(user));
        console.log('Logged in user:', user);

        alert('Login successful!');
        const targetPath = {
          admin: '/admin/dashboard',
          'sales head': '/sales-head/dashboard',
          'sales person': '/sales-person/dashboard',
          'operation head': '/operation-head/dashboard',
          reservation: '/reservation/dashboard',
          operation: '/operation/dashboard',
          accountant: '/accountant/dashboard',
          'data operator': '/data-operator/dashboard',
          'reservation head': '/reservation-head/dashboard',
        }[user.role.toLowerCase()] || '/dashboard';

        navigate(targetPath);
      } else {
        throw new Error('Login failed: No token or role received.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong. Please check the server logs.';
      setError(errorMessage);
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: 'beforeChildren',
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-gray-50 rounded-xl shadow-xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-600 text-white text-center">
          <h3 className="text-xl font-semibold flex items-center justify-center">
            <FaSignInAlt className="mr-2" /> Welcome Back
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <motion.div
                className="p-3 bg-red-100 text-red-800 rounded-md text-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <motion.div className="flex flex-col gap-2" variants={itemVariants}>
              <label className="text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <span className="p-2 text-gray-600">
                  <FaEnvelope className="text-sm" />
                </span>
                <input
                  type="email"
                  className="flex-1 p-2 border-none outline-none text-sm"
                  name="email"
                  value={credentials.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="example@domain.com"
                />
              </div>
            </motion.div>

            <motion.div className="flex flex-col gap-2" variants={itemVariants}>
              <label className="text-sm font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <span className="p-2 text-gray-600">
                  <FaLock className="text-sm" />
                </span>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="flex-1 p-2 border-none outline-none text-sm"
                  name="password"
                  value={credentials.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="p-2 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </motion.div>

            <motion.div className="mt-4" variants={itemVariants}>
              <button
                type="submit"
                className={`w-full py-2 px-4 bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded-md text-sm font-semibold flex items-center justify-center transition-all duration-300 ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" /> Login
                  </>
                )}
              </button>
            </motion.div>

            <motion.div className="text-center mt-2" variants={itemVariants}>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-gray-800 font-semibold hover:underline">
                  Register
                </a>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;