export type UserRole = 'buyer' | 'vendor';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  address?: string;
  nit?: string;
  rut_url?: string;
  billing_email?: string;
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
  brand?: string;
  description?: string;
  price: number;
  stock: number;
  unit_measure?: string;
  category: 'estructura' | 'acabados' | 'cubiertas' | 'hidrosanitarios' | 'electricos' | 'geotextiles' | 'drenes' | 'otros' | 'herramientas' | 'materiales' | 'pintura' | 'seguridad';
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Quotation {
  id: string;
  buyer_id: string;
  customer_nit?: string;
  delivery_address?: string;
  billing_email?: string;
  total_amount: number;
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
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: 'pse' | 'transfer' | 'cash';
  payment_id?: string;
  cus_code?: string;
  payment_evidence_url?: string;
  delivery_address?: string;
  delivery_evidence_url?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
