import React, { useState } from 'react';
import { Product, Customer, Order } from '../types';

// Componentes visuales para las secciones nuevas de Sling
// Estos componentes son funcionales visualmente pero limitados en lógica backend por ahora

export const SlingPlaceholders = {
  
  POS: ({ products, customers, onSale }: { products: Product[], customers: Customer[], onSale: () => void }) => {
     const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
     const [search, setSearch] = useState('');
     
     const addToCart = (p: Product) => {
        const exist = cart.find(x => x.product.id === p.id);
        if (exist) setCart(cart.map(x => x.product.id === p.id ? {...x, qty: x.qty + 1} : x));
        else setCart([...cart, {product: p, qty: 1}]);
     };

     const total = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

     return (
       <div className="grid grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          <div className="col-span-2 flex flex-col gap-4">
             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto para venta rápida..." className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-white focus:outline-none focus:border-brand-600" />
             <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                   <button key={p.id} onClick={() => addToCart(p)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left hover:border-brand-600 hover:bg-slate-800 transition-all group">
                      <p className="font-bold text-slate-200 group-hover:text-white">{p.name}</p>
                      <div className="flex justify-between mt-2">
                         <span className="text-brand-500 font-bold">${p.price}</span>
                         <span className="text-xs text-slate-500">Stock: {p.stock}</span>
                      </div>
                   </button>
                ))}
             </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg flex flex-col h-full border border-slate-200">
             <div className="p-4 bg-slate-50 border-b border-slate-200 rounded-t-xl">
                <h3 className="font-bold text-slate-800">Ticket Actual</h3>
                <p className="text-xs text-slate-500">Cliente: Consumidor Final</p>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 && <p className="text-center text-slate-400 mt-10">Carrito vacío</p>}
                {cart.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-sm">
                      <div>
                         <p className="font-medium text-slate-800">{item.product.name}</p>
                         <p className="text-xs text-slate-500">{item.qty} x ${item.product.price}</p>
                      </div>
                      <p className="font-bold text-slate-800">${item.qty * item.product.price}</p>
                   </div>
                ))}
             </div>
             <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                <div className="flex justify-between items-center text-2xl font-bold text-slate-800 mb-4">
                   <span>Total</span>
                   <span>${total.toLocaleString()}</span>
                </div>
                <button onClick={() => { setCart([]); onSale(); }} disabled={cart.length === 0} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-lg font-bold shadow-lg shadow-brand-200 disabled:opacity-50">
                   COBRAR
                </button>
             </div>
          </div>
       </div>
     );
  },

  SalesHistory: ({ orders }: { orders: Order[] }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
           <input placeholder="Buscar por N° Venta o Cliente..." className="bg-slate-950 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg w-96 text-sm" />
        </div>
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-500 font-medium border-b border-slate-800">
                <tr>
                    <th className="p-4">N°</th>
                    <th className="p-4">FECHA</th>
                    <th className="p-4">CLIENTE</th>
                    <th className="p-4 text-center">ITEMS</th>
                    <th className="p-4 text-center">TIPO</th>
                    <th className="p-4 text-right">TOTAL</th>
                    <th className="p-4 text-right">ACCIONES</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {orders.map((o, i) => (
                    <tr key={o.id} className="hover:bg-slate-800/50">
                        <td className="p-4 font-mono">{1000 + i}</td>
                        <td className="p-4 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {new Date(o.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-white flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                             {o.customerName}
                        </td>
                        <td className="p-4 text-center">{o.items.length}</td>
                        <td className="p-4 text-center"><span className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-300">A</span></td>
                        <td className="p-4 text-right font-mono text-brand-400 font-bold">$ {o.total.toLocaleString()},00</td>
                        <td className="p-4 text-right">
                             <button className="p-2 bg-slate-800 hover:bg-brand-900 text-brand-500 rounded border border-slate-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                             </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  ),

  Discounts: () => (
      <div className="grid grid-cols-3 gap-6">
          {[
              {name: 'Efectivo', desc: '10% OFF', active: true, color: 'emerald'},
              {name: 'Promo Verano', desc: '$5000 Descuento Fijo', active: true, color: 'brand'},
              {name: 'Cliente VIP', desc: '20% OFF', active: false, color: 'slate'}
          ].map((d, i) => (
              <div key={i} className={`bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-700`}>
                  <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20`}>
                      <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{d.name}</h3>
                      <div className="flex gap-2">
                        <button className="text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button className="text-slate-500 hover:text-red-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                  </div>
                  <p className="text-slate-400 mb-6">{d.desc}</p>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${d.active ? 'bg-green-900 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                      {d.active ? 'Activo' : 'Inactivo'}
                  </span>
              </div>
          ))}
          <button className="border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-brand-600 transition-all h-40">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nuevo Descuento
          </button>
      </div>
  ),

  Providers: () => (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <h3 className="text-xl font-bold text-white mb-2">Directorio de Proveedores</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Gestiona la información de contacto, cuentas corrientes y entregas de tus proveedores.</p>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg">Agregar Primer Proveedor</button>
      </div>
  ),

  Purchases: () => (
      <div className="space-y-4">
          <div className="flex justify-end">
              <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Nueva Orden
              </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-slate-500 font-medium border-b border-slate-800">
                    <tr><th className="p-4">ID</th><th className="p-4">FECHA</th><th className="p-4">PROVEEDOR</th><th className="p-4">ESTADO</th><th className="p-4 text-right">TOTAL</th><th className="p-4 text-right">ACCIONES</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    <tr>
                        <td className="p-4">OC-1710002</td>
                        <td className="p-4">07/12/2025</td>
                        <td className="p-4 font-bold text-white">ElectroGlobal SA</td>
                        <td className="p-4"><span className="bg-yellow-900 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-800">Pendiente</span></td>
                        <td className="p-4 text-right font-mono text-brand-400">$ 45.000,00</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                            <span className="text-xs text-blue-400 underline cursor-pointer">Ver Detalle</span>
                            <svg className="w-5 h-5 text-green-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <svg className="w-5 h-5 text-red-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </td>
                    </tr>
                     <tr>
                        <td className="p-4">OC-1710001</td>
                        <td className="p-4">03/12/2025</td>
                        <td className="p-4 font-bold text-white">Maderas del Sur</td>
                        <td className="p-4"><span className="bg-green-900 text-green-500 px-2 py-1 rounded text-xs border border-green-800">Recibida</span></td>
                        <td className="p-4 text-right font-mono text-brand-400">$ 440.000,00</td>
                        <td className="p-4 text-right text-xs text-blue-400 underline cursor-pointer">Ver Detalle</td>
                    </tr>
                </tbody>
            </table>
          </div>
      </div>
  ),

  Users: () => (
      <div className="grid grid-cols-3 gap-6">
           <div className="bg-slate-900 border border-brand-900/50 p-6 rounded-xl flex items-center gap-4 relative overflow-hidden">
               <div className="w-12 h-12 rounded-full bg-brand-900 flex items-center justify-center text-brand-400 text-xl font-bold border border-brand-700">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
               </div>
               <div>
                   <h4 className="font-bold text-white">dueño</h4>
                   <p className="text-xs text-slate-500 uppercase">Administrador</p>
               </div>
               <button className="absolute top-4 right-4 text-slate-600 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               </button>
           </div>
           
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 relative">
               <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 text-xl font-bold">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               </div>
               <div>
                   <h4 className="font-bold text-white">vendedor</h4>
                   <p className="text-xs text-slate-500 uppercase">Empleado</p>
               </div>
               <div className="absolute top-4 right-4 flex gap-2">
                 <button className="text-slate-600 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                 <button className="text-slate-600 hover:text-red-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
               </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 relative">
               <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 text-xl font-bold">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               </div>
               <div>
                   <h4 className="font-bold text-white">taller</h4>
                   <p className="text-xs text-slate-500 uppercase">Empleado</p>
               </div>
               <div className="absolute top-4 right-4 flex gap-2">
                 <button className="text-slate-600 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                 <button className="text-slate-600 hover:text-red-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
               </div>
           </div>
      </div>
  ),

  Backup: ({ data }: { data: any }) => {
     const downloadBackup = () => {
         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `backup_sling_${new Date().toISOString().split('T')[0]}.json`;
         a.click();
     };

     return (
        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center hover:border-brand-600 transition-colors cursor-pointer group" onClick={downloadBackup}>
                <div className="w-20 h-20 bg-brand-900/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-600 transition-colors">
                     <svg className="w-10 h-10 text-brand-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Exportar Datos</h3>
                <p className="text-slate-400">Descarga una copia completa de la base de datos (Inventario, Ventas, Clientes, etc.) en formato JSON.</p>
                <button className="mt-6 bg-brand-600 text-white px-6 py-2 rounded-lg font-bold">Descargar Backup</button>
            </div>

             <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center hover:border-yellow-600 transition-colors group">
                <div className="w-20 h-20 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-600 transition-colors">
                     <svg className="w-10 h-10 text-yellow-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Restaurar Datos</h3>
                <p className="text-slate-400">Sube un archivo de respaldo (.json) para restaurar el sistema a un estado anterior.</p>
                
                <div className="mt-6 bg-yellow-900/20 border border-yellow-900 p-3 rounded text-xs text-yellow-500 mb-4">
                    ⚠️ Advertencia: Esta acción eliminará los datos actuales y los reemplazará con los del archivo.
                </div>
                <button className="bg-slate-800 text-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-700">Seleccionar Archivo</button>
            </div>
        </div>
     );
  }
};