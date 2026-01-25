import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    window.dispatchEvent(new CustomEvent('auth:guest'));
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-serif font-bold text-3xl">A</span>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Atelier AI</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mt-1">Digital Tailoring Studio</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif font-semibold text-center text-stone-800">
            {isLogin ? 'Welcome Back' : 'Create Your Studio'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-stone-400 font-black px-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-900 transition-all text-sm"
                placeholder="couture@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-stone-400 font-black px-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-900 transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Enter Studio' : 'Begin Journey')}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-stone-100"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-stone-300 font-bold">or</span>
            <div className="flex-grow border-t border-stone-100"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-white border border-stone-100 text-stone-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleGuestEntry}
            disabled={loading}
            className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-200 transition-all shadow-sm"
          >
            Enter as Guest
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase tracking-widest text-stone-400 font-bold border-b border-transparent hover:border-stone-400 hover:text-stone-900 transition-all"
            >
              {isLogin ? "Don't have a studio? Create one" : 'Already have a studio? Sign in'}
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Setup Required
              </p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Cloud database is not connected. Sign in will be disabled.
                Use <strong>Guest Mode</strong> or see <code>DATABASE_SETUP.md</code> to connect your Supabase account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
