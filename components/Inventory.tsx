import React, { useState } from 'react';
import { Product } from '../types';
import { db } from '../services/db';

interface InventoryProps {
  products: Product[];
  onUpdate: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: 'Otros', price: 0, stock: 0, minStock: 0, unit: ''
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'Otros', price: 0, stock: 0, minStock: 10, unit: 'unidades' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productToSave: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name!,
      category: formData.category as any,
      price: Number(formData.price),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      unit: formData.unit!
    };
    
    await db.saveProduct(productToSave);
    setIsModalOpen(false);
    onUpdate(); // Trigger refresh (aunque realtime lo hará también)
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      await db.deleteProduct(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Producto</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Categoría</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Precio</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">Stock</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">Estado</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.unit}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {p.category}
                  </span>
                </td>
                <td className="p-4 text-right font-medium text-slate-700">
                  ${p.price.toLocaleString()}
                </td>
                <td className="p-4 text-center font-mono text-sm">{p.stock}</td>
                <td className="p-4 text-center">
                  {p.stock <= p.minStock ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                      Bajo Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      OK
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleOpenModal(p)}
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="Potes">Potes</option>
                    <option value="Cucuruchos">Cucuruchos</option>
                    <option value="Servilletas">Servilletas</option>
                    <option value="Cucharitas">Cucharitas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                  <input required type="text" placeholder="ej. caja x100" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Min.</label>
                  <input required type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;