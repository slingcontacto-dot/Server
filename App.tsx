import React, { useEffect, useState } from 'react';
import { View, Product, Customer, Order, Provider, Discount, Purchase } from './types';
import { db } from './services/db';
import { supabase } from './services/supabase';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Orders from './components/Orders';
import { SlingComponents } from './components/SlingComponents';

// Icons
const IconDashboard = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconBox = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconPOS = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconHistory = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconTag = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const IconTruck = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-3a1 1 0 00-1-1H9z" /></svg>;
const IconBriefcase = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconBackup = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;

function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Supabase Realtime Setup
  useEffect(() => {
      fetchData();
      
      const channel = supabase.channel('sling-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
             fetchData();
        })
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    if (products.length === 0) setLoading(true);
    try {
      const [p, c, o, prov, disc, pur] = await Promise.all([
          db.getProducts(), 
          db.getCustomers(), 
          db.getOrders(),
          db.getProviders(),
          db.getDiscounts(),
          db.getPurchases()
      ]);
      setProducts(p); setCustomers(c); setOrders(o);
      setProviders(prov); setDiscounts(disc); setPurchases(pur);
    } catch (error) { 
        console.error("Error fetching data", error); 
    } finally { 
        setLoading(false); 
    }
  };

  const NavItem = ({ view, label, icon: Icon }: { view: View; label: string; icon: any }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all ${
        currentView === view 
          ? 'bg-brand-50 text-brand-600 font-bold shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-1">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="font-medium text-sm">{notification}</span>
          </div>
        </div>
      )}

      {/* Sidebar - Tema Claro */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-10">
        <div className="p-6 pb-4">
          <h1 className="text-3xl font-black text-brand-600 tracking-tight flex items-center gap-2">
            <span className="text-3xl">⚡</span> Sling
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1 ml-1">Sistema Multiplataforma</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
          <div className="space-y-1">
            <NavItem view={View.DASHBOARD} label="Panel de Control" icon={IconDashboard} />
            <NavItem view={View.INVENTORY} label="Inventario" icon={IconBox} />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ventas</p>
            <NavItem view={View.POS} label="TPV (Caja)" icon={IconPOS} />
            <NavItem view={View.SALES_HISTORY} label="Historial Ventas" icon={IconHistory} />
            <NavItem view={View.ORDERS} label="Pedidos" icon={IconTruck} />
            <NavItem view={View.DISCOUNTS} label="Descuentos" icon={IconTag} />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gestión</p>
            <NavItem view={View.CUSTOMERS} label="Clientes" icon={IconUsers} />
            <NavItem view={View.PROVIDERS} label="Proveedores" icon={IconTruck} />
            <NavItem view={View.PURCHASES} label="Compras" icon={IconBriefcase} />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sistema</p>
            <NavItem view={View.BACKUP} label="Backup" icon={IconBackup} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2">
             <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
                S
             </div>
             <div>
               <p className="text-sm text-slate-800 font-bold">Sling System</p>
               <p className="text-xs text-slate-500">v2.0.1</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        {/* Header Light */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
           <h2 className="text-slate-800 font-bold text-xl hidden md:block">
              {currentView === View.DASHBOARD && 'Panel de Control'}
              {currentView === View.INVENTORY && 'Inventario'}
              {currentView === View.ORDERS && 'Pedidos Especiales'}
              {currentView === View.CUSTOMERS && 'Administración de Clientes'}
              {currentView === View.POS && 'Terminal Punto de Venta'}
              {currentView === View.SALES_HISTORY && 'Historial de Ventas'}
              {currentView === View.DISCOUNTS && 'Descuentos y Promociones'}
              {currentView === View.PROVIDERS && 'Lista de Proveedores'}
              {currentView === View.PURCHASES && 'Órdenes de Compra'}
              {currentView === View.BACKUP && 'Respaldo y Restauración'}
           </h2>

           <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="relative w-full max-w-md">
                 <input 
                   type="text" 
                   placeholder={currentView === View.INVENTORY ? "Buscar producto..." : "Búsqueda global..."}
                   className="w-full bg-slate-100 border border-transparent text-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                   value={globalSearch}
                   onChange={(e) => setGlobalSearch(e.target.value)}
                 />
                 <div className="absolute left-3 top-2.5 text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer relative transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
           {loading ? (
             <div className="flex items-center justify-center h-full flex-col gap-4 text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="font-medium text-slate-500">Cargando datos...</p>
             </div>
           ) : (
             <div className="max-w-7xl mx-auto space-y-6">
               {/* Core Views */}
               {currentView === View.DASHBOARD && <Dashboard products={products} orders={orders} />}
               {currentView === View.INVENTORY && <Inventory products={products.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase()))} onUpdate={fetchData} />}
               {currentView === View.CUSTOMERS && <Customers customers={customers.filter(c => c.name.toLowerCase().includes(globalSearch.toLowerCase()))} onUpdate={fetchData} />}
               {currentView === View.ORDERS && <Orders orders={orders} customers={customers} products={products} onUpdate={fetchData} />}
               
               {/* New Sling Views - Now Fully Functional */}
               {currentView === View.POS && <SlingComponents.POS products={products} customers={customers} onSale={() => { fetchData(); showToast('Venta realizada con éxito'); }} />}
               {currentView === View.SALES_HISTORY && <SlingComponents.SalesHistory orders={orders} />}
               {currentView === View.DISCOUNTS && <SlingComponents.Discounts discounts={discounts} onUpdate={fetchData} />}
               {currentView === View.PROVIDERS && <SlingComponents.Providers providers={providers} onUpdate={fetchData} />}
               {currentView === View.PURCHASES && <SlingComponents.Purchases purchases={purchases} providers={providers} onUpdate={fetchData} />}
               {currentView === View.BACKUP && <SlingComponents.Backup data={{products, customers, orders, providers, discounts, purchases}} />}
             </div>
           )}
        </main>
      </div>
    </div>
  );
}

export default App;