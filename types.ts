export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  // VENTAS
  POS = 'POS',
  SALES_HISTORY = 'SALES_HISTORY',
  ORDERS = 'ORDERS',
  DISCOUNTS = 'DISCOUNTS',
  // GESTION
  CUSTOMERS = 'CUSTOMERS',
  PROVIDERS = 'PROVIDERS',
  PURCHASES = 'PURCHASES',
  // ADMIN
  USERS = 'USERS',
  BACKUP = 'BACKUP'
}

export interface Product {
  id: string;
  name: string;
  category: 'Potes' | 'Cucuruchos' | 'Servilletas' | 'Cucharitas' | 'Salsas' | 'Otros';
  price: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string; // ISO string
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface BusinessStats {
  totalSales: number;
  lowStockCount: number;
  orderCount: number;
  topProduct: string;
}

// Nuevas Interfaces
export interface Provider {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: string;
}

export interface Discount {
  id: string;
  name: string;
  description: string;
  value: string; // ej: "10%" o "$500"
  active: boolean;
  color: string;
}

export interface Purchase {
  id: string;
  date: string;
  providerName: string;
  status: 'Pendiente' | 'Recibida' | 'Cancelada';
  total: number;
}

export interface AppUser {
  id: string;
  username: string;
  role: 'Admin' | 'Empleado' | 'Vendedor';
  color: string;
}