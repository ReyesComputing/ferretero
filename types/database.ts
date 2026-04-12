export type UserRole = 'buyer' | 'vendor';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Store {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  unit_measure: string;
  category: 'estructura' | 'acabados' | 'cubiertas' | 'hidrosanitarios' | 'electricos' | 'geotextiles' | 'drenes' | 'otros';
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Quotation {
  id: string;
  buyer_id: string;
  total_amount: number;
  expires_at: string;
  created_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_measure: string;
}

export interface VendorDiscount {
  id: string;
  vendor_id: string;
  customer_id: string;
  category?: string;
  discount_percentage: number;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  payment_evidence_url?: string;
  delivery_evidence_url?: string;
  delivery_notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
