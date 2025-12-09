import React, { useState } from 'react';
import { Customer } from '../types';
import { db } from '../services/db';

interface CustomersProps {
  customers: Customer[];
  onUpdate: () => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({ name: '', address: '', phone: '', email: '' });

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData(customer);
    } else {
      setEditingId(null);
      setFormData({ name: '', address: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveCustomer({
      id: editingId || Date.now().toString(),
      name: formData.name!,
      address: formData.address!,
      phone: formData.phone!,
      email: formData.email!
    });
    setIsModalOpen(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este cliente? Se mantendrá el historial de pedidos pero no podrás crear nuevos.")) {
      await db.deleteCustomer(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clientes (Heladerías)</h2>
        <button onClick={() => handleOpenModal()} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm">
          + Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-brand-300 transition-colors group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenModal(c)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-brand-100 hover:text-brand-600"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button 
                onClick={() => handleDelete(c.id)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 pr-12">{c.name}</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="font-semibold w-16">Dirección:</span>
                <span className="truncate">{c.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold w-16">Teléfono:</span>
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold w-16">Email:</span>
                <span className="truncate">{c.email}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">ID: {c.id.slice(0, 8)}...</span>
              <button className="text-brand-600 text-sm font-medium hover:underline">Ver Historial</button>
            </div>
          </div>
        ))}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Heladería' : 'Registrar Nueva Heladería'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Negocio</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-lg">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;