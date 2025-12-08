import { Product, Customer, Order, OrderItem } from '../types';

// Initial Seed Data
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

const INITIAL_ORDERS: Order[] = [
  { 
    id: '1001', 
    customerId: '1', 
    customerName: 'Heladería Delizia', 
    date: new Date(Date.now() - 86400000 * 2).toISOString(), 
    status: 'completed', 
    total: 15000,
    items: [{ productId: '1', productName: 'Pote Térmico 1kg', quantity: 100, priceAtSale: 150 }]
  }
];

// Helper to delay simulation of network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  getProducts: async (): Promise<Product[]> => {
    await delay(300);
    const stored = localStorage.getItem('hs_products');
    if (!stored) {
      localStorage.setItem('hs_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  saveProduct: async (product: Product): Promise<void> => {
    await delay(300);
    const products = await db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem('hs_products', JSON.stringify(products));
  },

  getCustomers: async (): Promise<Customer[]> => {
    await delay(300);
    const stored = localStorage.getItem('hs_customers');
    if (!stored) {
      localStorage.setItem('hs_customers', JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(stored);
  },

  addCustomer: async (customer: Customer): Promise<void> => {
    await delay(300);
    const customers = await db.getCustomers();
    customers.push(customer);
    localStorage.setItem('hs_customers', JSON.stringify(customers));
  },

  getOrders: async (): Promise<Order[]> => {
    await delay(300);
    const stored = localStorage.getItem('hs_orders');
    if (!stored) {
      localStorage.setItem('hs_orders', JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(stored);
  },

  createOrder: async (customerId: string, items: OrderItem[]): Promise<Order> => {
    await delay(500);
    const customers = await db.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error("Cliente no encontrado");

    const total = items.reduce((acc, item) => acc + (item.priceAtSale * item.quantity), 0);
    
    const newOrder: Order = {
      id: Date.now().toString(),
      customerId,
      customerName: customer.name,
      date: new Date().toISOString(),
      items,
      total,
      status: 'completed' // Auto complete for simplicity
    };

    // Save Order
    const orders = await db.getOrders();
    orders.unshift(newOrder); // Newest first
    localStorage.setItem('hs_orders', JSON.stringify(orders));

    // Update Stock
    const products = await db.getProducts();
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    });
    localStorage.setItem('hs_products', JSON.stringify(products));

    return newOrder;
  }
};