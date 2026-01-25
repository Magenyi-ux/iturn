import React, { useState } from 'react';
import { api } from '../services/api';

const Auth: React.FC<{ onAuthSuccess: (user: any) => void }> = ({ onAuthSuccess }) => {
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
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await api.post(endpoint, { email, password });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      onAuthSuccess(response.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase tracking-widest text-stone-400 font-bold border-b border-transparent hover:border-stone-400 hover:text-stone-900 transition-all"
            >
              {isLogin ? "Don't have a studio? Create one" : 'Already have a studio? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
