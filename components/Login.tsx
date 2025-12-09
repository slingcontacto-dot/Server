import React, { useState } from 'react';
import { auth } from '../services/auth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    const success = await auth.login(password);
    if (success) {
      onLogin();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-4xl font-black text-brand-600 mb-2 flex items-center justify-center gap-2">
            <span>⚡</span> Sling
          </h1>
          <p className="text-slate-500 text-sm font-medium">Inicio de Sesión</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Usuario</label>
              <div className="relative">
                <input 
                  type="text" 
                  disabled
                  value="admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-transparent rounded-lg text-slate-600 focus:outline-none font-medium"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
                  placeholder="••••"
                  autoFocus
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Credenciales inválidas. Intente "admin".</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-brand-200 flex justify-center items-center gap-2"
            >
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          {/* Credenciales Demo Visual */}
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-xs uppercase font-bold tracking-widest">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Credenciales Demo
             </div>
             <div className="grid gap-2">
                <div className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center">
                    <div>
                        <p className="text-brand-600 font-bold text-sm">dueño</p>
                        <p className="text-slate-500 text-xs">Acceso Total</p>
                    </div>
                    <code className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 text-xs font-mono">🗝️ 123123</code>
                </div>
             </div>
             
             <p className="text-center text-slate-400 text-xs mt-6">Sistema de Gestión Sling v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;