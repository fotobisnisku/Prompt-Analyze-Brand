import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabase';

export default function FonceLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });
  const cursorPos = useRef({ x: -1000, y: -1000 });
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorPos.current = { x: e.clientX, y: e.clientY };
    };

    const animateGlow = () => {
      setSmoothPos((prev) => {
        const factor = 0.12;
        return {
          x: prev.x + (cursorPos.current.x - prev.x) * factor,
          y: prev.y + (cursorPos.current.y - prev.y) * factor,
        };
      });
      requestRef.current = requestAnimationFrame(animateGlow);
    };

    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animateGlow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!supabase) {
      setError('Supabase Environment Variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) belum diset di Vercel.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess('Access granted. Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col antialiased selection:bg-white selection:text-black overflow-hidden"
      style={{
        backgroundColor: '#050505',
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        backgroundPosition: 'center top'
      }}
    >
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 will-change-transform"
        style={{ background: `radial-gradient(600px circle at ${smoothPos.x}px ${smoothPos.y}px, rgba(255, 255, 255, 0.085), transparent 80%)` }}
      />
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 will-change-transform"
        style={{ background: `radial-gradient(350px circle at ${smoothPos.x}px ${smoothPos.y}px, rgba(255, 255, 255, 0.05), transparent 70%)` }}
      />

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 md:px-6 w-full max-w-md mx-auto relative z-10">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-widest uppercase mb-4 shadow-sm">
            <span>FOTOBISNISKU</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-zinc-400 text-sm mt-3 font-medium">
            Sign in to access the visual analysis system
          </p>
        </div>

        <div className="w-full bg-white/10 backdrop-blur-xl p-6 md:p-9 rounded-[32px] border border-white/20 relative shadow-2xl">
          {(error || success) && (
            <div className="mb-6">
              {error && (
                <div className="bg-red-500/20 text-red-200 p-3.5 rounded-2xl flex items-center gap-3 border border-red-400/30 text-xs font-semibold backdrop-blur-md">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/20 text-emerald-200 p-3.5 rounded-2xl flex items-center gap-3 border border-emerald-400/30 text-xs font-semibold backdrop-blur-md">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-white tracking-wide uppercase mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-zinc-400 group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fonce.com"
                  className="w-full bg-black/40 border border-white/20 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/60 transition-all font-medium shadow-inner"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-white tracking-wide uppercase">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-zinc-400 group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/20 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/60 transition-all font-medium shadow-inner tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300
                  ${isLoading ? 'bg-white/10 text-zinc-400 cursor-not-allowed border border-white/10' : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin text-zinc-400" size={16} />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
