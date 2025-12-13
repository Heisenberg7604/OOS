import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://spares.jpel.in/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    customerName: '',
    companyName: '',
    phoneNumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Get auth token for admin authentication
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in as admin to create users');
        setLoading(false);
        return;
      }

      // Call the registration API
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'user' // Always create as regular user (not admin)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different error statuses
        if (response.status === 409) {
          setError('A user with this email already exists');
        } else if (response.status === 401 || response.status === 403) {
          setError('You must be logged in as admin to create users');
        } else if (result.errors && result.errors.length > 0) {
          setError(result.errors[0].msg || 'Validation failed');
        } else {
          setError(result.message || 'Failed to create user account');
        }
        setLoading(false);
        return;
      }

      if (result.success) {
        setSuccess('User account created successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          customerName: '',
          companyName: '',
          phoneNumber: '',
          address: ''
        });
        
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } else {
        setError(result.message || 'Failed to create user account');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(`Failed to create user account: ${err.message || 'Network error. Please check if backend is running.'}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Customer Account</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Customer Information Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="customerName">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Customer's full name"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="companyName">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company name (optional)"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone number (optional)"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Customer address (optional)"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Customer Account'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={loading}
            >
              ← Back to Dashboard
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            This form is for creating customer accounts. Only administrators can create new accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;