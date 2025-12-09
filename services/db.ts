import { Product, Customer, Order, OrderItem } from '../types';
import { supabase } from './supabase';

// Initial Seed Data (Solo se usará si la base de datos está vacía)
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

export const db = {
  getProducts: async (): Promise<Product[]> => {
    try {
      // Ordenar por nombre para estabilidad en UI
      const { data, error } = await supabase.from('products').select('*').order('name');
      
      if (error) throw error;

      // Si está vacío, cargar datos iniciales (Seed)
      if (!data || data.length === 0) {
        console.log("Base de datos vacía, subiendo productos iniciales...");
        const { error: seedError } = await supabase.from('products').insert(INITIAL_PRODUCTS);
        if (seedError) console.error("Error seeding products:", seedError);
        return INITIAL_PRODUCTS;
      }

      return data as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  saveProduct: async (product: Product): Promise<void> => {
    try {
      // Upsert: Actualiza si existe id, crea si no
      const { error } = await supabase.from('products').upsert(product);
      if (error) throw error;
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase.from('customers').select('*');
      
      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("Base de datos vacía, subiendo clientes iniciales...");
        const { error: seedError } = await supabase.from('customers').insert(INITIAL_CUSTOMERS);
        if (seedError) console.error("Error seeding customers:", seedError);
        return INITIAL_CUSTOMERS;
      }

      return data as Customer[];
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  },

  addCustomer: async (customer: Customer): Promise<void> => {
    try {
      const { error } = await supabase.from('customers').insert(customer);
      if (error) throw error;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  createOrder: async (customerId: string, items: OrderItem[]): Promise<Order> => {
    try {
      // 1. Validación estricta de Stock antes de procesar
      // Recorremos los items y chequeamos el stock ACTUAL en la BD (no el local)
      for (const item of items) {
        const { data: currentProduct, error } = await supabase
          .from('products')
          .select('stock, name')
          .eq('id', item.productId)
          .single();

        if (error || !currentProduct) {
          throw new Error(`Error verificando producto: ${item.productName}`);
        }

        if (currentProduct.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${currentProduct.name}. Disponible: ${currentProduct.stock}, Solicitado: ${item.quantity}`);
        }
      }

      // 2. Obtener datos del cliente
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (!customer) throw new Error("Cliente no encontrado");

      const total = items.reduce((acc, item) => acc + (item.priceAtSale * item.quantity), 0);
      
      const newOrder: Order = {
        id: Date.now().toString(),
        customerId,
        customerName: customer.name,
        date: new Date().toISOString(),
        items, 
        total,
        status: 'completed'
      };

      // 3. Guardar orden
      const { error: orderError } = await supabase.from('orders').insert(newOrder);
      if (orderError) throw orderError;

      // 4. Actualizar Stock
      // Lo hacemos uno por uno. En una app enterprise usaríamos RPC (Stored Procedure) para atomicidad total.
      for (const item of items) {
        // Obtenemos el producto de nuevo para restar de manera segura
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single();
          
        if (product) {
          const newStock = product.stock - item.quantity;
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);
        }
      }

      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }
};