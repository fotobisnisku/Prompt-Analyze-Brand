import React, { useEffect, useRef, useState } from 'react';
import Login from './login-analyze';
import Dashboard from './Dashboard';
import { supabase } from './supabase';

// ============================================
// SESSION / IDLE SETTINGS
// ============================================

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 menit
const WARNING_TIME = 60 * 1000;      // warning 1 menit sebelum logout

// ============================================
// APP
// ============================================

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const [sessionReady, setSessionReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = (path: string, replace = false) => {
    if (window.location.pathname === path) {
      setCurrentPath(path);
      return;
    }

    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }

    setCurrentPath(path);
  };

  // Listen browser back / forward
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // ==========================================
  // SUPABASE SESSION
  // ==========================================

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase is not configured.');

      setIsAuthenticated(false);
      setSessionReady(true);

      return;
    }

    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Session check error:', error);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(Boolean(session));
      }

      setSessionReady(true);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setIsAuthenticated(Boolean(session));

      // User logged out
      if (event === 'SIGNED_OUT') {
        setShowIdleWarning(false);

        if (window.location.pathname === '/dashboard') {
          navigate('/', true);
        }
      }

      // User successfully logged in
      if (event === 'SIGNED_IN') {
        if (window.location.pathname === '/') {
          navigate('/dashboard', true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // AUTO REDIRECT BASED ON AUTH STATE
  // ==========================================

  useEffect(() => {
    if (!sessionReady) return;

    // Belum login → tidak boleh masuk dashboard
    if (currentPath === '/dashboard' && !isAuthenticated) {
      navigate('/', true);
      return;
    }

    // Sudah login → langsung ke dashboard
    if (currentPath === '/' && isAuthenticated) {
      navigate('/dashboard', true);
    }
  }, [sessionReady, isAuthenticated, currentPath]);

  // ==========================================
  // IDLE TIMER
  // ==========================================

  useEffect(() => {
    if (
      !isAuthenticated ||
      currentPath !== '/dashboard' ||
      !supabase
    ) {
      return;
    }

    const clearTimers = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };

    const logoutUser = async () => {
      clearTimers();
      setShowIdleWarning(false);

      try {
        await supabase.auth.signOut({
          scope: 'local',
        });
      } catch (error) {
        console.error('Logout error:', error);
      }

      navigate('/', true);
    };

    const resetIdleTimer = () => {
      clearTimers();

      setShowIdleWarning(false);

      // Warning 1 menit sebelum logout
      warningTimerRef.current = setTimeout(() => {
        setShowIdleWarning(true);
      }, IDLE_TIMEOUT - WARNING_TIME);

      // Logout setelah 30 menit tidak ada aktivitas
      idleTimerRef.current = setTimeout(() => {
        logoutUser();
      }, IDLE_TIMEOUT);
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Start timer ketika dashboard dibuka
    resetIdleTimer();

    return () => {
      clearTimers();

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [isAuthenticated, currentPath]);

  // ==========================================
  // LOADING / SESSION CHECK
  // ==========================================

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />

          <p className="text-xs text-zinc-500 tracking-[0.2em] uppercase">
            Checking access
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  if (currentPath === '/dashboard' && isAuthenticated) {
    return (
      <>
        <Dashboard />

        {/* =====================================
            IDLE WARNING
        ====================================== */}

        {showIdleWarning && (
          <div className="fixed bottom-6 right-6 z-[9999] w-[320px]">
            <div className="bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Session hampir berakhir
                  </p>

                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Tidak ada aktivitas terdeteksi.
                    Anda akan otomatis logout dalam 1 menit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // LOGIN
  // ==========================================

  return <Login />;
}
