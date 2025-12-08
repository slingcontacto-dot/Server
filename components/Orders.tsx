import React, { useState } from 'react';
import { Customer, Product, Order, OrderItem } from '../types';
import { db } from '../services/db';

interface OrdersProps {
  orders: Order[];
  customers: Customer[];
  products: Product[];
  onUpdate: () => void;
}

const Orders: React.FC<OrdersProps> = ({ orders, customers, products, onUpdate }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  
  // Create Order State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.stock) {
      alert(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProductId);
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        alert("No puedes agregar más de lo disponible en stock.");
        return;
      }
      setCart(cart.map(item => 
        item.productId === selectedProductId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity,
        priceAtSale: product.price
      }]);
    }
    setQuantity(1);
    setSelectedProductId('');
  };

  const handleRemoveFromCart = (idx: number) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  const handleFinalizeOrder = async () => {
    if (!selectedCustomerId || cart.length === 0) return;
    try {
      await db.createOrder(selectedCustomerId, cart);
      onUpdate();
      setView('list');
      setCart([]);
      setSelectedCustomerId('');
    } catch (error) {
      console.error(error);
      alert("Error al crear el pedido");
    }
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.priceAtSale * item.quantity), 0);

  if (view === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-700">← Volver</button>
          <h2 className="text-2xl font-bold text-slate-800">Nuevo Pedido</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Cliente</label>
              <select 
                className="w-full border rounded-lg p-3 bg-slate-50"
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Product Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold mb-4">Agregar Productos</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">Buscar producto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock === 0}>
                        {p.name} - ${p.price} ({p.stock} disp.)
                      </option>
                    ))}
                  </select>
                </div>
                <input 
                  type="number" 
                  min="1" 
                  className="w-20 border rounded-lg p-2" 
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedProductId}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Resumen del Pedido</h3>
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 mb-4">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-8">El carrito está vacío</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-slate-500">{item.quantity} x ${item.priceAtSale}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${item.quantity * item.priceAtSale}</span>
                      <button onClick={() => handleRemoveFromCart(idx)} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-xl font-bold mb-4">
                <span>Total:</span>
                <span className="text-brand-600">${calculateTotal().toLocaleString()}</span>
              </div>
              <button 
                onClick={handleFinalizeOrder}
                disabled={!selectedCustomerId || cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Historial de Pedidos</h2>
        <button onClick={() => setView('create')} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg">
          + Crear Nuevo Pedido
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-xs text-slate-500">#{o.id}</td>
                <td className="p-4 font-medium text-slate-800">{o.customerName}</td>
                <td className="p-4 text-sm text-slate-600">{new Date(o.date).toLocaleDateString()}</td>
                <td className="p-4 text-right font-bold text-slate-800">${o.total.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 capitalize">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;