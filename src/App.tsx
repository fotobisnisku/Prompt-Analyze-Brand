import React, { useEffect, useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  // Jika URL adalah /dashboard, tampilkan Dashboard, jika tidak tampilkan Login
  return currentPath === '/dashboard' ? <Dashboard /> : <Login />;
}