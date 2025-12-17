import { Product, Customer, Order, OrderItem, Provider, Discount, Purchase } from '../types';
import { supabase } from './supabase';

export const db = {
  // --- PRODUCTOS ---
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data as Product[];
    } catch (e) { return []; }
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
    } catch (e) { return []; }
  },

  saveCustomer: async (customer: Customer): Promise<void> => {
    try { await supabase.from('customers').upsert(customer); } catch (e) { console.error(e); }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try { await supabase.from('customers').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- PEDIDOS ---
  getOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data as Order[];
    } catch (e) { return []; }
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
      await supabase.from('orders').insert(newOrder);
      for (const item of items) {
         const { data: p } = await supabase.from('products').select('stock').eq('id', item.productId).single();
         if (p) await supabase.from('products').update({stock: p.stock - item.quantity}).eq('id', item.productId);
      }
      return newOrder;
    } catch (error) { throw error; }
  },

  deleteOrder: async (id: string): Promise<void> => {
    try { await supabase.from('orders').delete().eq('id', id); } catch (e) { console.error(e); }
  },

  // --- PROVEEDORES ---
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

  // --- DESCUENTOS ---
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

  // --- COMPRAS ---
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

  // --- RESTAURAR DATOS ---
  restoreLocalState: async (data: any): Promise<void> => {
      try {
          if (data.products && data.products.length > 0) await supabase.from('products').upsert(data.products);
          if (data.customers && data.customers.length > 0) await supabase.from('customers').upsert(data.customers);
          if (data.providers && data.providers.length > 0) await supabase.from('providers').upsert(data.providers);
          if (data.discounts && data.discounts.length > 0) await supabase.from('discounts').upsert(data.discounts);
          if (data.orders && data.orders.length > 0) await supabase.from('orders').upsert(data.orders);
          if (data.purchases && data.purchases.length > 0) await supabase.from('purchases').upsert(data.purchases);
      } catch (error) {
          console.error("Error en restauración:", error);
          throw error;
      }
  }
};