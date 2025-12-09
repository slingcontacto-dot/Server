import { Product, Customer, Order, OrderItem, Provider, Discount, Purchase, AppUser } from '../types';
import { supabase } from './supabase';

// --- DATA INICIAL / SEED DATA ---
// Se usa si la BD está vacía o si falla la conexión a tablas nuevas
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Pote Térmico 1kg', category: 'Potes', price: 150, stock: 500, minStock: 100, unit: 'unidades' },
  { id: '2', name: 'Pote Térmico 1/2kg', category: 'Potes', price: 90, stock: 1200, minStock: 200, unit: 'unidades' },
  { id: '3', name: 'Pote Térmico 1/4kg', category: 'Potes', price: 60, stock: 80, minStock: 300, unit: 'unidades' },
  { id: '4', name: 'Cucharitas Color Surtido', category: 'Cucharitas', price: 500, stock: 50, minStock: 10, unit: 'bolsa x1000' },
  { id: '5', name: 'Servilletas Blancas', category: 'Servilletas', price: 800, stock: 30, minStock: 15, unit: 'caja x2000' },
  { id: '6', name: 'Cucurucho Crocante Grande', category: 'Cucuruchos', price: 1200, stock: 20, minStock: 10, unit: 'caja x300' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Heladería Delizia', address: 'Av. Libertador 1234', phone: '555-0101', email: 'contacto@delizia.com' },
  { id: '2', name: 'Ice Cream Joy', address: 'Calle 50 Nro 400', phone: '555-0202', email: 'manager@joy.com' },
  { id: '3', name: 'Gelato Artesanal', address: 'Plaza Mayor 5', phone: '555-0303', email: 'pedidos@gelato.com' },
];

// Datos Mock para funcionalidades nuevas (fallback en memoria)
let MOCK_PROVIDERS: Provider[] = [
    { id: '1', name: 'Plásticos del Norte', contact: 'Juan Pérez', phone: '11-4455-6677', email: 'ventas@plasticos.com', category: 'Envases' },
    { id: '2', name: 'Importadora Dulce', contact: 'María Ruiz', phone: '11-9988-7766', email: 'info@dulce.com', category: 'Materia Prima' },
];

let MOCK_DISCOUNTS: Discount[] = [
    { id: '1', name: 'Efectivo', description: '10% OFF', value: '10%', active: true, color: 'emerald' },
    { id: '2', name: 'Promo Verano', description: '$5000 Descuento Fijo', value: '$5000', active: true, color: 'brand' },
    { id: '3', name: 'Cliente VIP', description: '20% OFF', value: '20%', active: false, color: 'slate' }
];

let MOCK_PURCHASES: Purchase[] = [
    { id: 'OC-1710002', date: '2025-12-07', providerName: 'Plásticos del Norte', status: 'Pendiente', total: 45000 },
    { id: 'OC-1710001', date: '2025-12-03', providerName: 'Importadora Dulce', status: 'Recibida', total: 440000 },
];

let MOCK_USERS: AppUser[] = [
    { id: '1', username: 'dueño', role: 'Admin', color: 'brand' },
    { id: '2', username: 'vendedor', role: 'Vendedor', color: 'blue' },
    { id: '3', username: 'taller', role: 'Empleado', color: 'orange' },
];

// Helper para simular delay de red en mocks
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // --- PRODUCTOS ---
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error || !data || data.length === 0) return INITIAL_PRODUCTS;
      return data as Product[];
    } catch { return INITIAL_PRODUCTS; }
  },

  saveProduct: async (product: Product): Promise<void> => {
    try { await supabase.from('products').upsert(product); } catch {}
  },

  deleteProduct: async (id: string): Promise<void> => {
    try { await supabase.from('products').delete().eq('id', id); } catch {}
  },

  // --- CLIENTES ---
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase.from('customers').select('*');
      if (error || !data || data.length === 0) return INITIAL_CUSTOMERS;
      return data as Customer[];
    } catch { return INITIAL_CUSTOMERS; }
  },

  saveCustomer: async (customer: Customer): Promise<void> => {
    try { await supabase.from('customers').upsert(customer); } catch {}
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try { await supabase.from('customers').delete().eq('id', id); } catch {}
  },

  // --- PEDIDOS ---
  getOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data as Order[];
    } catch { return []; }
  },

  createOrder: async (customerId: string, items: OrderItem[]): Promise<Order> => {
    try {
      const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).single();
      const customerName = customer ? customer.name : 'Cliente';

      const total = items.reduce((acc, item) => acc + (item.priceAtSale * item.quantity), 0);
      
      const newOrder: Order = {
        id: Date.now().toString(),
        customerId,
        customerName,
        date: new Date().toISOString(),
        items, 
        total,
        status: 'completed'
      };

      const { error } = await supabase.from('orders').insert(newOrder);
      if (error) throw error;

      // Descontar stock (simple)
      for (const item of items) {
         const { data: p } = await supabase.from('products').select('stock').eq('id', item.productId).single();
         if (p) {
             await supabase.from('products').update({stock: p.stock - item.quantity}).eq('id', item.productId);
         }
      }

      return newOrder;
    } catch (error) {
      console.error("Error creating order", error);
      throw error;
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    try { await supabase.from('orders').delete().eq('id', id); } catch {}
  },

  // --- NUEVAS FUNCIONALIDADES (MOCK / HYBRID) ---
  // Usamos arrays en memoria para estas porque el usuario probablemente no ha corrido el SQL en Supabase
  // Esto garantiza que la app "ande" inmediatamente.
  
  getProviders: async (): Promise<Provider[]> => {
     await delay(200); return MOCK_PROVIDERS;
  },
  saveProvider: async (provider: Provider): Promise<void> => {
     await delay(200);
     const idx = MOCK_PROVIDERS.findIndex(p => p.id === provider.id);
     if (idx >= 0) MOCK_PROVIDERS[idx] = provider;
     else MOCK_PROVIDERS.push(provider);
  },
  deleteProvider: async (id: string): Promise<void> => {
     await delay(200); MOCK_PROVIDERS = MOCK_PROVIDERS.filter(p => p.id !== id);
  },

  getDiscounts: async (): Promise<Discount[]> => {
    await delay(200); return MOCK_DISCOUNTS;
  },
  saveDiscount: async (discount: Discount): Promise<void> => {
    await delay(200);
    const idx = MOCK_DISCOUNTS.findIndex(d => d.id === discount.id);
    if (idx >= 0) MOCK_DISCOUNTS[idx] = discount;
    else MOCK_DISCOUNTS.push(discount);
  },
  deleteDiscount: async (id: string): Promise<void> => {
     await delay(200); MOCK_DISCOUNTS = MOCK_DISCOUNTS.filter(d => d.id !== id);
  },

  getPurchases: async (): Promise<Purchase[]> => {
      await delay(200); return MOCK_PURCHASES;
  },
  savePurchase: async (purchase: Purchase): Promise<void> => {
      await delay(200);
      MOCK_PURCHASES = [purchase, ...MOCK_PURCHASES];
  },

  getUsers: async (): Promise<AppUser[]> => {
      await delay(200); return MOCK_USERS;
  },
  saveUser: async (user: AppUser): Promise<void> => {
      await delay(200);
      const idx = MOCK_USERS.findIndex(u => u.id === user.id);
      if (idx >= 0) MOCK_USERS[idx] = user;
      else MOCK_USERS.push(user);
  },
  deleteUser: async (id: string): Promise<void> => {
      await delay(200); MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
  }
};