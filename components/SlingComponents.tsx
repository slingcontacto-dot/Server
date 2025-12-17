import React, { useState, useRef } from 'react';
import { Product, Customer, Order, Provider, Discount, Purchase } from '../types';
import { db } from '../services/db';

export const SlingComponents = {
  
  POS: ({ products, customers, onSale }: { products: Product[], customers: Customer[], onSale: () => void }) => {
     const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
     const [search, setSearch] = useState('');
     const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CF');
     
     const addToCart = (p: Product) => {
        const exist = cart.find(x => x.product.id === p.id);
        if (exist) {
            if (exist.qty < p.stock) setCart(cart.map(x => x.product.id === p.id ? {...x, qty: x.qty + 1} : x));
        } else {
            if (p.stock > 0) setCart([...cart, {product: p, qty: 1}]);
        }
     };

     const total = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

     const handleCheckout = async () => {
         const items = cart.map(c => ({
             productId: c.product.id,
             productName: c.product.name,
             quantity: c.qty,
             priceAtSale: c.product.price
         }));
         await db.createOrder(selectedCustomerId, items);
         setCart([]);
         onSale();
     };

     return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
          <div className="lg:col-span-2 flex flex-col gap-4">
             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 max-h-[600px]">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                   <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0} className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-brand-500 hover:shadow-md transition-all group disabled:opacity-50 relative overflow-hidden">
                      {p.stock === 0 && <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center font-bold text-slate-400 rotate-45">AGOTADO</div>}
                      <p className="font-bold text-slate-800 text-sm mb-2">{p.name}</p>
                      <div className="flex justify-between items-end">
                         <span className="text-brand-600 font-bold text-lg">${p.price}</span>
                         <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Stock: {p.stock}</span>
                      </div>
                   </button>
                ))}
             </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg flex flex-col h-full border border-slate-200">
             <div className="p-4 bg-slate-50 border-b border-slate-200 rounded-t-xl">
                <h3 className="font-bold text-slate-800 mb-2">Ticket Actual</h3>
                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="CF">👤 Consumidor Final</option>
                    {customers.map(c => (<option key={c.id} value={c.id}>🏢 {c.name}</option>))}
                </select>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                {cart.length === 0 && <p className="text-center text-slate-400 mt-10">Seleccione productos</p>}
                {cart.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100">
                      <div>
                         <p className="font-medium text-slate-800">{item.product.name}</p>
                         <p className="text-xs text-slate-500">{item.qty} x ${item.product.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-800">${item.qty * item.product.price}</p>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">×</button>
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                <div className="flex justify-between items-center text-2xl font-black text-slate-800 mb-6">
                   <span>Total</span>
                   <span>${total.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-200 disabled:opacity-50 transition-all">
                   COBRAR
                </button>
             </div>
          </div>
       </div>
     );
  },

  SalesHistory: ({ orders }: { orders: Order[] }) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
           <h3 className="font-bold text-slate-700">Registro de Ventas</h3>
        </div>
        <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr><th className="p-4">N°</th><th className="p-4">FECHA</th><th className="p-4">CLIENTE</th><th className="p-4 text-center">ITEMS</th><th className="p-4 text-right">TOTAL</th><th className="p-4 text-center">ESTADO</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                        <td className="p-4 font-mono text-xs text-slate-400">#{o.id.slice(-6)}</td>
                        <td className="p-4">{new Date(o.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">{o.customerName}</td>
                        <td className="p-4 text-center">{o.items.length}</td>
                        <td className="p-4 text-right font-bold text-slate-900">$ {o.total.toLocaleString()}</td>
                        <td className="p-4 text-center">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">OK</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  ),

  Providers: ({ providers, onUpdate }: { providers: Provider[], onUpdate: () => void }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<Partial<Provider>>({});

    const save = async () => {
        await db.saveProvider({
            id: form.id || Date.now().toString(),
            name: form.name || 'Sin nombre',
            contact: form.contact || '',
            phone: form.phone || '',
            email: form.email || '',
            category: form.category || 'General'
        });
        setModalOpen(false);
        onUpdate();
    };

    return (
      <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-slate-800">Proveedores</h3>
             <button onClick={() => { setForm({}); setModalOpen(true); }} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700">+ Nuevo Proveedor</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                      <button onClick={async () => { if(window.confirm('Eliminar?')) { await db.deleteProvider(p.id); onUpdate(); }}} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{p.name.charAt(0)}</div>
                          <div><h4 className="font-bold text-slate-800">{p.name}</h4><p className="text-xs text-slate-500">{p.category}</p></div>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600"><p>👤 {p.contact}</p><p>📞 {p.phone}</p><p>✉️ {p.email}</p></div>
                  </div>
              ))}
          </div>

          {modalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-xl w-full max-w-md">
                      <h3 className="text-lg font-bold mb-4">Guardar Proveedor</h3>
                      <div className="space-y-3">
                          <input placeholder="Empresa" className="w-full border p-2 rounded" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                          <input placeholder="Contacto" className="w-full border p-2 rounded" value={form.contact || ''} onChange={e => setForm({...form, contact: e.target.value})} />
                          <input placeholder="Teléfono" className="w-full border p-2 rounded" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                          <input placeholder="Email" className="w-full border p-2 rounded" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                          <input placeholder="Categoría" className="w-full border p-2 rounded" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} />
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                          <button onClick={() => setModalOpen(false)} className="px-4 py-2">Cancelar</button>
                          <button onClick={save} className="bg-brand-600 text-white px-4 py-2 rounded">Guardar</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
    );
  },

  Discounts: ({ discounts, onUpdate }: { discounts: Discount[], onUpdate: () => void }) => {
    const [form, setForm] = useState<Partial<Discount> | null>(null);

    const save = async () => {
        if(!form) return;
        await db.saveDiscount({
            id: form.id || Date.now().toString(),
            name: form.name || 'Promo',
            description: form.description || '',
            value: form.value || '',
            active: form.active ?? true,
            color: form.color || 'brand'
        });
        setForm(null);
        onUpdate();
    };

    return (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {discounts.map(d => (
                   <div key={d.id} className={`bg-white border p-6 rounded-xl relative group shadow-sm ${d.active ? 'border-l-4 border-l-brand-500' : 'border-l-4 border-l-slate-300'}`}>
                       <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold text-slate-800">{d.name}</h3>
                           <button onClick={async () => { if(window.confirm('Borrar?')) { await db.deleteDiscount(d.id); onUpdate(); }}} className="text-slate-300 hover:text-red-500">×</button>
                       </div>
                       <p className="text-slate-500 mb-4">{d.description}</p>
                       <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded text-xs font-bold">{d.value}</span>
                   </div>
               ))}
               <button onClick={() => setForm({})} className="border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center h-40 bg-slate-50 text-slate-400 hover:text-brand-600 transition-all">+ Nuevo Descuento</button>
           </div>
           
           {form && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white p-6 rounded-xl w-full max-w-sm">
                     <h3 className="font-bold mb-4">Configurar Descuento</h3>
                     <div className="space-y-3">
                         <input placeholder="Nombre" className="w-full border p-2 rounded" onChange={e => setForm({...form, name: e.target.value})} />
                         <input placeholder="Descripción" className="w-full border p-2 rounded" onChange={e => setForm({...form, description: e.target.value})} />
                         <input placeholder="Valor (ej: 10%)" type="text" className="w-full border p-2 rounded" onChange={e => setForm({...form, value: e.target.value})} />
                     </div>
                     <div className="flex justify-end gap-2 mt-4">
                         <button onClick={() => setForm(null)} className="px-4 py-2">Cancelar</button>
                         <button onClick={save} className="bg-brand-600 text-white px-4 py-2 rounded">Crear</button>
                     </div>
                 </div>
             </div>
           )}
        </div>
    );
  },

  Purchases: ({ purchases, providers, onUpdate }: { purchases: Purchase[], providers: Provider[], onUpdate: () => void }) => {
     const [form, setForm] = useState<Partial<Purchase> | null>(null);

     const save = async () => {
         if(!form || !form.providerName || !form.total) return;
         await db.savePurchase({
             id: `OC-${Date.now()}`,
             date: new Date().toISOString().split('T')[0],
             providerName: form.providerName,
             status: 'Pendiente',
             total: Number(form.total)
         });
         setForm(null);
         onUpdate();
     };

     return (
        <div className="space-y-4">
             <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Órdenes de Compra</h3><button onClick={() => setForm({})} className="bg-brand-600 text-white px-4 py-2 rounded-lg">+ Nueva Orden</button></div>
             <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
               <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b"><tr><th className="p-4">ID</th><th className="p-4">FECHA</th><th className="p-4">PROVEEDOR</th><th className="p-4">ESTADO</th><th className="p-4 text-right">TOTAL</th></tr></thead>
                   <tbody>
                       {purchases.map(p => (
                           <tr key={p.id} className="border-b last:border-0"><td className="p-4 font-mono text-xs">{p.id}</td><td className="p-4">{p.date}</td><td className="p-4 font-medium">{p.providerName}</td><td className="p-4"><span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">{p.status}</span></td><td className="p-4 text-right font-bold text-brand-600">${p.total.toLocaleString()}</td></tr>
                       ))}
                   </tbody>
               </table>
             </div>
             {form && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                     <div className="bg-white p-6 rounded-xl w-full max-w-sm">
                         <h3 className="font-bold mb-4">Nueva Compra</h3>
                         <div className="space-y-3">
                             <select className="w-full border p-2 rounded" onChange={e => setForm({...form, providerName: e.target.value})}>
                                 <option value="">Proveedor...</option>
                                 {providers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                             </select>
                             <input type="text" inputMode="decimal" placeholder="Monto Total" className="w-full border p-2 rounded" onChange={e => setForm({...form, total: e.target.value as any})} />
                         </div>
                         <div className="flex justify-end gap-2 mt-6"><button onClick={() => setForm(null)} className="px-4 py-2">Cancelar</button><button onClick={save} className="bg-brand-600 text-white px-4 py-2 rounded">Generar Orden</button></div>
                     </div>
                 </div>
             )}
        </div>
     );
  },

  Backup: ({ data }: { data: any }) => {
     const fileInputRef = useRef<HTMLInputElement>(null);

     const downloadBackup = () => {
         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `backup_sling_${new Date().toISOString().split('T')[0]}.json`;
         a.click();
     };

     const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                await db.restoreLocalState(json);
                alert('¡Datos restaurados con éxito! El sistema se actualizará.');
                window.location.reload();
            } catch (error) {
                alert('Error: Archivo inválido.');
            }
        };
        reader.readAsText(file);
     };

     return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
            <div className="bg-white border p-8 rounded-2xl text-center cursor-pointer shadow-sm hover:shadow-lg transition-all" onClick={downloadBackup}>
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">⬇️</div>
                <h3 className="text-xl font-bold mb-2">Exportar Datos</h3>
                <p className="text-slate-500 text-sm">Descarga el JSON completo de la base de datos.</p>
                <button className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-lg font-bold">Descargar</button>
            </div>
             <div className="bg-white border p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">⬆️</div>
                <h3 className="text-xl font-bold mb-2">Restaurar Datos</h3>
                <p className="text-slate-500 text-sm">Sube un JSON para reemplazar la base de datos actual.</p>
                <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">Seleccionar JSON</button>
            </div>
        </div>
     );
  }
};