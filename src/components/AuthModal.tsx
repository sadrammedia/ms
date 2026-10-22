import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { loginWithCredentials, AuthState } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auth: AuthState) => void;
  initialRole?: 'admin' | 'client';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'admin'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'admin' | 'client'>(initialRole);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithCredentials(email, password);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'client') => {
    if (role === 'admin') {
      setEmail('admin@msundangan.com');
      setPassword('admin123');
    } else {
      setEmail('raka.sinta@gmail.com');
      setPassword('raka123');
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-100 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1F362D] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6 text-[#DFBF7A]" />
          </div>
          <h3 className="text-2xl font-serif text-slate-900 font-semibold">Portal Akses</h3>
          <p className="text-xs text-slate-500 mt-1">Masuk untuk mengelola undangan pernikahan Anda</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Administrator
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('client'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'client' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
            Klien Mempelai
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 pl-1">
              {activeTab === 'admin' ? 'Email Administrator' : 'Email Akun Mempelai'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin@msundangan.com' : 'raka.sinta@gmail.com'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 pl-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1F362D] hover:bg-[#15251f] text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : `Masuk sebagai ${activeTab === 'admin' ? 'Admin' : 'Klien'}`}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for effortless review */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Akses Cepat Pengujian Mode Preview:</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
            >
              Demo Admin (Otomatis)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('client')}
              className="text-[11px] font-medium text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
            >
              Demo Klien (Raka & Sinta)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
