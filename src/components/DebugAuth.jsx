import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-xs">
      <div><strong>Debug Auth:</strong></div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.name || user.email : 'None'}</div>
      <div>Role: {user?.role || 'None'}</div>
      <div>IsAdmin: {user?.isAdmin ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default DebugAuth;