import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, Loader2, X } from 'lucide-react';
import { storeCsrfToken } from '../lib/adminApi';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, informe a senha de acesso.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        storeCsrfToken(data.csrfToken || '');
        setPassword('');
        onSuccess();
      } else {
        setError(data.error || 'Senha incorreta. Acesso negado.');
      }
    } catch {
      setError('Não foi possível validar a sessão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#2A3A4A] border border-slate-700/80 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#349885]/10 border border-[#349885]/30 flex items-center justify-center text-[#349885]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Área Administrativa</h3>
            <p className="text-xs text-slate-300">Acesso restrito para consultores e analistas</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Senha de Consultor
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Digite a senha de acesso..."
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-[#349885] focus:ring-1 focus:ring-[#349885] text-white pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition"
                autoFocus
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#349885] hover:bg-[#2c8271] active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciais...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Desbloquear Painel de Relatórios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
