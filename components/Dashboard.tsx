import React, { useState, useEffect } from 'react';
import { Product, Order } from '../types';
import { analyzeBusinessData } from '../services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  products: Product[];
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, orders }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Calculated Stats
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  // Prepare Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(dateStr => {
    const dayTotal = orders
      .filter(o => o.date.startsWith(dateStr))
      .reduce((acc, o) => acc + o.total, 0);
    return { date: dateStr.slice(5), total: dayTotal };
  });

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await analyzeBusinessData(products, orders);
    setAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
          <p className="text-sm text-slate-500">Bienvenido de nuevo, Admin.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Sincronizado con la nube
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Ventas Totales</p>
          <p className="text-3xl font-bold text-brand-600">${totalSales.toLocaleString()}</p>
        </div>
        <div className={`bg-white p-6 rounded-xl shadow-sm border ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}>
          <p className="text-sm font-medium text-slate-500">Alertas de Stock</p>
          <p className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {lowStockCount} <span className="text-base font-normal text-slate-400">productos</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Valor de Inventario</p>
          <p className="text-3xl font-bold text-emerald-600">${totalStockValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Ventas de la Semana</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Gemini Business Intelligence
            </h3>
            <button 
              onClick={handleAiAnalysis}
              disabled={loadingAi}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loadingAi ? 'Analizando...' : 'Analizar Negocio'}
            </button>
          </div>
          
          <div className="prose prose-sm prose-indigo h-64 overflow-y-auto bg-white/50 p-4 rounded-lg border border-indigo-100">
            {analysis ? (
              <div className="whitespace-pre-wrap">{analysis}</div>
            ) : (
              <p className="text-slate-500 italic text-center mt-10">
                Haz clic en "Analizar Negocio" para obtener un reporte inteligente sobre tu inventario y ventas generado por Google Gemini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;