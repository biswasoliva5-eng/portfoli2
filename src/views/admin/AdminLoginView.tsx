import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Shield, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api/client.js';

export const AdminLoginView: React.FC = () => {
  const { loginAdmin, navigate } = usePortfolio();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login(username.trim(), password);
      if (res.token && res.username) {
        loginAdmin(res.token, res.username);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-view"
      className="min-h-screen bg-[#0e0e0e] text-neutral-200 flex flex-col justify-center items-center p-6"
    >
      <div className="max-w-md w-full space-y-8 bg-[#161616] p-8 sm:p-10 border border-neutral-800 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 block font-medium">
            Oliva Biswas Studio
          </span>
          <h1 className="font-serif text-3xl tracking-wide uppercase text-white font-normal">
            Admin Login
          </h1>
          <p className="text-xs text-neutral-400 font-light">
            Authorized access only. Enter your private credentials to continue.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 pl-10 pr-10 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors font-mono"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white hover:bg-neutral-200 text-black text-xs uppercase tracking-[0.25em] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to public site */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-neutral-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            &larr; Return to public portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
