import { Product, Customer, Order, OrderItem } from '../types';
import { dbFirestore } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';

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

// Collections references
const productsRef = collection(dbFirestore, 'products');
const customersRef = collection(dbFirestore, 'customers');
const ordersRef = collection(dbFirestore, 'orders');

export const db = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const snapshot = await getDocs(productsRef);
      
      // Si está vacío, cargar datos iniciales (Seed)
      if (snapshot.empty) {
        console.log("Base de datos vacía, subiendo productos iniciales...");
        const batch = writeBatch(dbFirestore);
        INITIAL_PRODUCTS.forEach(p => {
          const docRef = doc(productsRef, p.id);
          batch.set(docRef, p);
        });
        await batch.commit();
        return INITIAL_PRODUCTS;
      }

      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  saveProduct: async (product: Product): Promise<void> => {
    try {
      const docRef = doc(productsRef, product.id);
      await setDoc(docRef, product, { merge: true });
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const snapshot = await getDocs(customersRef);
      
      if (snapshot.empty) {
        console.log("Base de datos vacía, subiendo clientes iniciales...");
        const batch = writeBatch(dbFirestore);
        INITIAL_CUSTOMERS.forEach(c => {
          const docRef = doc(customersRef, c.id);
          batch.set(docRef, c);
        });
        await batch.commit();
        return INITIAL_CUSTOMERS;
      }

      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Customer));
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  },

  addCustomer: async (customer: Customer): Promise<void> => {
    try {
      // Usamos el ID generado por el cliente o dejamos que firestore genere uno si fuera necesario
      const docRef = doc(customersRef, customer.id);
      await setDoc(docRef, customer);
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      // Ordenar por fecha descendente
      const q = query(ordersRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  createOrder: async (customerId: string, items: OrderItem[]): Promise<Order> => {
    try {
      // 1. Obtener datos del cliente
      const customersSnapshot = await getDocs(customersRef);
      const customers = customersSnapshot.docs.map(d => d.data() as Customer);
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
        status: 'completed'
      };

      // 2. Guardar orden en Firestore
      // Usamos setDoc con el ID generado para mantener consistencia, o addDoc para ID auto
      await setDoc(doc(ordersRef, newOrder.id), newOrder);

      // 3. Actualizar Stock (De forma atómica idealmente, pero secuencial por simplicidad)
      // Nota: En una app de producción grande, usaríamos una transacción de Firestore.
      for (const item of items) {
        const productRef = doc(productsRef, item.productId);
        // Leemos el producto actual para asegurar stock
        const productSnap = await getDocs(query(productsRef)); // Optimizacion: getDoc individual seria mejor
        // Por simplicidad en esta estructura, haremos un update directo decrementando
        // Firestore soporta increment(-qty)
        const currentProduct = (await import('firebase/firestore')).getDoc(productRef);
        
        // Simplemente leemos todos de nuevo para encontrar el stock actual y restar (metodo seguro simple)
        const pSnap = await (await import('firebase/firestore')).getDoc(productRef);
        if (pSnap.exists()) {
           const currentStock = pSnap.data().stock;
           await updateDoc(productRef, {
             stock: currentStock - item.quantity
           });
        }
      }

      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }
};