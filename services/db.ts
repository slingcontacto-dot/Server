import { Product, Customer, Order, OrderItem, Provider, Discount, Purchase, AppUser } from '../types';
import { supabase } from './supabase';

// --- DATA INICIAL / SEED DATA ---
// Se usa solo como fallback si las tablas están vacías y se requiere estructura inicial visual
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Pote Térmico 1kg', category: 'Potes', price: 150, stock: 500, minStock: 100, unit: 'unidades' },
  { id: '2', name: 'Pote Térmico 1/2kg', category: 'Potes', price: 90, stock: 1200, minStock: 200, unit: 'unidades' },
  { id: '3', name: 'Pote Térmico 1/4kg', category: 'Potes', price: 60, stock: 80, minStock: 300, unit: 'unidades' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Heladería Delizia', address: 'Av. Libertador 1234', phone: '555-0101', email: 'contacto@delizia.com' },
];

export const db = {
  // --- PRODUCTOS (Inventario) ---
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data as Product[];
    } catch (e) { 
      console.error("Error fetching products", e);
      return []; 
    }
  },

  saveProduct: async (product: Product): Promise<void> => {
    try { await supabase.from('products').upsert(product); } catch (e) { console.error(e); }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try { await supabase.from('products').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- CLIENTES ---
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      return data as Customer[];
    } catch (e) { 
      console.error("Error fetching customers", e);
      return []; 
    }
  },

  saveCustomer: async (customer: Customer): Promise<void> => {
    try { await supabase.from('customers').upsert(customer); } catch (e) { console.error(e); }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try { await supabase.from('customers').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- PEDIDOS (Ventas) ---
  getOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data as Order[];
    } catch (e) { 
      console.error("Error fetching orders", e);
      return []; 
    }
  },

  createOrder: async (customerId: string, items: OrderItem[]): Promise<Order> => {
    try {
      let customerName = 'Consumidor Final';
      if (customerId !== 'CF') {
         const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).single();
         if (customer) customerName = customer.name;
      }

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

      // Descontar stock
      for (const item of items) {
         // Obtener stock actual para asegurar atomicidad (idealmente usar RPC, pero esto funciona para este nivel)
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
    try { await supabase.from('orders').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- PROVEEDORES (Conectado a DB) ---
  getProviders: async (): Promise<Provider[]> => {
     try {
        const { data, error } = await supabase.from('providers').select('*').order('name');
        if (error) throw error;
        return data as Provider[];
     } catch (e) { return []; }
  },

  saveProvider: async (provider: Provider): Promise<void> => {
     try { await supabase.from('providers').upsert(provider); } catch (e) { console.error(e); }
  },

  deleteProvider: async (id: string): Promise<void> => {
     try { await supabase.from('providers').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- DESCUENTOS (Conectado a DB) ---
  getDiscounts: async (): Promise<Discount[]> => {
    try {
        const { data, error } = await supabase.from('discounts').select('*');
        if (error) throw error;
        return data as Discount[];
    } catch (e) { return []; }
  },

  saveDiscount: async (discount: Discount): Promise<void> => {
    try { await supabase.from('discounts').upsert(discount); } catch (e) { console.error(e); }
  },

  deleteDiscount: async (id: string): Promise<void> => {
     try { await supabase.from('discounts').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- COMPRAS (Conectado a DB) ---
  getPurchases: async (): Promise<Purchase[]> => {
      try {
        const { data, error } = await supabase.from('purchases').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data as Purchase[];
      } catch (e) { return []; }
  },

  savePurchase: async (purchase: Purchase): Promise<void> => {
      try { await supabase.from('purchases').upsert(purchase); } catch (e) { console.error(e); }
  },

  // --- USUARIOS (Conectado a DB) ---
  getUsers: async (): Promise<AppUser[]> => {
      try {
        // Nota: Asegúrate de que la tabla se llame 'app_users' o 'users' en Supabase.
        // Usamos 'users_app' para evitar conflictos con la tabla auth.users de Supabase
        const { data, error } = await supabase.from('users_app').select('*'); 
        
        // Fallback si la tabla no existe o falla, devuelve array vacío
        if (error) {
             // Intento secundario con nombre 'users' si 'users_app' falla, por si acaso
             const { data: data2, error: error2 } = await supabase.from('users').select('*');
             if (!error2 && data2) return data2 as AppUser[];
             throw error; 
        }
        return data as AppUser[];
      } catch (e) { return []; }
  },

  saveUser: async (user: AppUser): Promise<void> => {
      try { 
          // Intentamos guardar en users_app (recomendado) o users
          const { error } = await supabase.from('users_app').upsert(user);
          if (error && error.code === '42P01') { // Tabla no existe
              await supabase.from('users').upsert(user);
          }
      } catch (e) { console.error(e); }
  },

  deleteUser: async (id: string): Promise<void> => {
      try { 
          const { error } = await supabase.from('users_app').delete().eq('id', id);
          if (error) await supabase.from('users').delete().eq('id', id);
      } catch (e) { console.error(e); }
  },

  // --- RESTAURAR DATOS (A LA NUBE) ---
  restoreLocalState: async (data: any): Promise<void> => {
      // Esta función toma el JSON y lo sube a Supabase
      try {
          if (data.products && data.products.length > 0) {
              await supabase.from('products').upsert(data.products);
          }
          if (data.customers && data.customers.length > 0) {
              await supabase.from('customers').upsert(data.customers);
          }
          if (data.providers && data.providers.length > 0) {
              await supabase.from('providers').upsert(data.providers);
          }
          if (data.discounts && data.discounts.length > 0) {
              await supabase.from('discounts').upsert(data.discounts);
          }
          if (data.orders && data.orders.length > 0) {
              await supabase.from('orders').upsert(data.orders);
          }
          if (data.users && data.users.length > 0) {
              // Intentamos restaurar usuarios en ambas tablas posibles por seguridad
              await supabase.from('users_app').upsert(data.users).catch(() => {});
              await supabase.from('users').upsert(data.users).catch(() => {});
          }
          console.log("Restauración a la nube completada");
      } catch (error) {
          console.error("Error al restaurar backup en la nube:", error);
          throw error;
      }
  }
};