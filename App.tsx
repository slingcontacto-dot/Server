import React, { useEffect, useState } from 'react';
import { View, Product, Customer, Order } from './types';
import { db } from './services/db';
import { auth } from './services/auth';
import { supabase } from './services/supabase';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Login from './components/Login';

// Icons as simple SVG components
const IconDashboard = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconBox = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconCart = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconLogout = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const isAuth = auth.isAuthenticated();
    setIsAuthenticated(isAuth);
  }, []);

  // Función auxiliar para mostrar notificaciones temporales
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Carga inicial y Suscripción Granular
  useEffect(() => {
    if (isAuthenticated) {
      // 1. Carga inicial completa
      fetchData();

      // 2. Suscripción a Realtime con lógica granular para velocidad instantánea
      const channel = supabase
        .channel('heladosupply-realtime')
        
        // --- PRODUCTOS ---
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
            const newProduct = payload.new as Product;
            setProducts((current) => current.map((p) => (p.id === newProduct.id ? newProduct : p)));
            showToast(`Stock actualizado: ${newProduct.name}`);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
            setProducts((current) => [...current, payload.new as Product]);
            showToast('Nuevo producto agregado remotamente');
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, (payload) => {
            setProducts((current) => current.filter(p => p.id !== payload.old.id));
        })
        
        // --- PEDIDOS ---
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
            const newOrder = payload.new as Order;
            setOrders((current) => [newOrder, ...current]);
            showToast(`Nuevo pedido recibido: $${newOrder.total}`);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
            const updatedOrder = payload.new as Order;
            setOrders((current) => current.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        })
        
        // --- CLIENTES (Optimizado) ---
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'customers' }, (payload) => {
             setCustomers((current) => [...current, payload.new as Customer]);
             showToast('Nuevo cliente registrado');
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'customers' }, (payload) => {
             const updated = payload.new as Customer;
             setCustomers((current) => current.map(c => c.id === updated.id ? updated : c));
             showToast('Datos de cliente actualizados');
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'customers' }, (payload) => {
             setCustomers((current) => current.filter(c => c.id !== payload.old.id));
        })
        
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
            console.log('Sincronización en tiempo real activa.');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionStatus('error');
            console.error('Error de conexión Realtime:', status);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    if (products.length === 0) setLoading(true);
    try {
      const [p, c, o] = await Promise.all([
        db.getProducts(),
        db.getCustomers(),
        db.getOrders()
      ]);
      setProducts(p);
      setCustomers(c);
      setOrders(o);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const NavItem = ({ view, label, icon: Icon }: { view: View; label: string; icon: any }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-brand-50 text-brand-700 font-medium' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium text-sm">{notification}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-600">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">HeladoSupply</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          <NavItem view={View.DASHBOARD} label="Panel Principal" icon={IconDashboard} />
          <NavItem view={View.INVENTORY} label="Inventario" icon={IconBox} />
          <NavItem view={View.CUSTOMERS} label="Clientes" icon={IconUsers} />
          <NavItem view={View.ORDERS} label="Pedidos" icon={IconCart} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <IconLogout />
            <span>Cerrar Sesión</span>
          </button>
          
          <div className="mt-4 bg-slate-50 p-3 rounded-lg text-xs flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-slate-500">
              {connectionStatus === 'connected' ? 'En vivo (Realtime)' : 'Desconectado'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="font-bold text-lg text-brand-600">HeladoSupply</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 bg-slate-100 rounded">
              <IconDashboard />
            </button>
            <button onClick={() => setCurrentView(View.ORDERS)} className="p-2 bg-slate-100 rounded">
              <IconCart />
            </button>
            <button onClick={handleLogout} className="p-2 bg-slate-100 rounded text-red-500">
              <IconLogout />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[80vh] flex-col gap-4 text-slate-400">
             <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
             <p>Sincronizando datos...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto animate-fade-in">
            {currentView === View.DASHBOARD && <Dashboard products={products} orders={orders} />}
            {currentView === View.INVENTORY && <Inventory products={products} onUpdate={fetchData} />}
            {currentView === View.CUSTOMERS && <Customers customers={customers} onUpdate={fetchData} />}
            {currentView === View.ORDERS && <Orders orders={orders} customers={customers} products={products} onUpdate={fetchData} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;