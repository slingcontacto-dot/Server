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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold text-brand-600 mb-2">Sling</h1>
          <p className="text-slate-400 text-sm">Inicio de Sesión</p>
        </div>
        
        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Usuario</label>
              <div className="relative">
                <input 
                  type="text" 
                  disabled
                  value="admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                />
                <svg className="w-5 h-5 text-slate-600 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all placeholder-slate-600"
                  placeholder="••••"
                  autoFocus
                />
                <svg className="w-5 h-5 text-slate-600 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-sm rounded-lg flex items-center gap-2">
                <span>Credenciales inválidas. Intente "admin".</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-brand-900/50 flex justify-center items-center gap-2"
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          {/* Credenciales Demo Visual */}
          <div className="mt-8 pt-6 border-t border-slate-800">
             <div className="flex items-center justify-center gap-2 mb-4 text-slate-500 text-xs uppercase font-bold tracking-widest">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Credenciales Demo
             </div>
             <div className="grid gap-2">
                <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                        <p className="text-brand-400 font-bold text-sm">dueño</p>
                        <p className="text-slate-500 text-xs">Acceso Total (Admin)</p>
                    </div>
                    <code className="bg-slate-900 px-2 py-1 rounded text-slate-400 text-xs">🗝️ 123123</code>
                </div>
                 <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                        <p className="text-blue-400 font-bold text-sm">vendedor</p>
                        <p className="text-slate-500 text-xs">Ventas, Gestión, Inventario</p>
                    </div>
                    <code className="bg-slate-900 px-2 py-1 rounded text-slate-400 text-xs">🗝️ 123</code>
                </div>
                 <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                        <p className="text-orange-400 font-bold text-sm">taller</p>
                        <p className="text-slate-500 text-xs">Pedidos, Gestión, Inventario</p>
                    </div>
                    <code className="bg-slate-900 px-2 py-1 rounded text-slate-400 text-xs">🗝️ 123</code>
                </div>
             </div>
             
             <p className="text-center text-slate-600 text-xs mt-6">Sistema de Gestión Sling (Sistema completo)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;