export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  CUSTOMERS = 'CUSTOMERS',
  ORDERS = 'ORDERS',
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