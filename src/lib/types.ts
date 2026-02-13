export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone: string;
  taxRate: number;
  pinCode: string;
  darkMode: boolean;
  currency: string;
}
