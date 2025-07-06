import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, handleAPIError } from '../api';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      console.error('Failed to fetch users:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      setError(null);
      
      await userAPI.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      // Show success message (optional)
      console.log('User role updated successfully');
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to update user role: ${errorInfo.message}`);
      console.error('Failed to update user role:', errorInfo);
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const deleteUser = async (userId) => {
    const userToDelete = users.find(user => user._id === userId);
    const confirmMessage = `Are you sure you want to delete user "${userToDelete?.name || 'Unknown'}"? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setDeleting(prev => ({ ...prev, [userId]: true }));
      setError(null);
      
      await userAPI.deleteUser(userId);
      
      // Update local state
      setUsers(users.filter(user => user._id !== userId));
      
      // Show success message (optional)
      console.log('User deleted successfully');
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to delete user: ${errorInfo.message}`);
      console.error('Failed to delete user:', errorInfo);
    } finally {
      setDeleting(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      setError(null);
      
      const response = await userAPI.toggleUserStatus(userId);
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: response.data.isActive } : user
      ));
      
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to toggle user status: ${errorInfo.message}`);
      console.error('Failed to toggle user status:', errorInfo);
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={refreshUsers}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {currentUser._id === user._id && (
                            <span className="ml-2 text-xs text-blue-600 font-normal">(You)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentUser._id === user._id ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        disabled={updating[user._id]}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {currentUser._id !== user._id && (
                        <>
                          <button
                            onClick={() => toggleUserStatus(user._id)}
                            disabled={updating[user._id]}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          >
                            {updating[user._id] ? '...' : (user.isActive !== false ? 'Deactivate' : 'Activate')}
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            disabled={deleting[user._id]}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting[user._id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;