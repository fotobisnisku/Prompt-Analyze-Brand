import React, { useEffect, useState } from 'react';
import Login from './login-analyze';
import Dashboard from './Dashboard';
import { supabase } from './supabase';

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Jika Supabase belum dikonfigurasi,
      // jangan memberikan akses ke Dashboard.
      if (!supabase) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAuthenticated(!!session);
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Pantau perubahan login/logout secara realtime.
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener(
      'popstate',
      onLocationChange
    );

    return () => {
      window.removeEventListener(
        'popstate',
        onLocationChange
      );
    };
  }, []);

  // Saat Supabase masih mengecek session,
  // jangan render Dashboard.
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="text-xs tracking-widest uppercase text-zinc-500">
          Checking access...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PROTECTED DASHBOARD
  // --------------------------------------------------

  if (currentPath === '/dashboard') {
    if (!isAuthenticated) {
      // User mencoba membuka /dashboard tanpa login.
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
      return <Login />;
    }

    return <Dashboard />;
  }

  // --------------------------------------------------
  // LOGIN PAGE
  // --------------------------------------------------

  // Jika user sudah login lalu membuka "/",
  // langsung arahkan ke Dashboard.
  if (isAuthenticated) {
    window.history.replaceState(
      {},
      '',
      '/dashboard'
    );

    setCurrentPath('/dashboard');

    return <Dashboard />;
  }

  return <Login />;
}
