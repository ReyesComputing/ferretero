-- Esquema base para Ferretero
-- Manejo de roles: Comprador y Vendedor

-- 1. Perfiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('buyer', 'vendor')) DEFAULT 'buyer',
  nit TEXT,
  address TEXT,
  phone TEXT,
  billing_email TEXT,
  rut_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Función auxiliar para RLS
CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'vendor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Vendors can see other profiles" ON public.profiles
  FOR SELECT USING (is_vendor());

-- 4. Trigger para creación automática de perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Nuevo Usuario'),
    COALESCE(new.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Tiendas
CREATE TABLE public.stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Tiendas
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores are viewable by everyone" ON public.stores
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own store" ON public.stores
  FOR ALL USING (auth.uid() = vendor_id);

-- 6. Productos
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  unit_measure TEXT DEFAULT 'unidad',
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Productos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can manage their own products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_id AND s.vendor_id = auth.uid()
    )
  );

-- 7. Cotizaciones
CREATE TABLE public.quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_nit TEXT,
  delivery_address TEXT,
  billing_email TEXT,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Ítems de la Cotización
CREATE TABLE public.quotation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL
);

-- Seguridad (RLS)
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- El comprador ve sus cotizaciones
CREATE POLICY "Buyers can see their own quotations" ON public.quotations
  FOR SELECT USING (auth.uid() = buyer_id);

-- El vendedor ve las cotizaciones donde hay productos suyos
CREATE POLICY "Vendors can see related quotations" ON public.quotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quotation_items qi
      JOIN public.products p ON qi.product_id = p.id
      JOIN public.stores s ON p.store_id = s.id
      WHERE qi.quotation_id = public.quotations.id 
      AND s.vendor_id = auth.uid()
    )
  );

-- Los ítems son visibles si la cotización es visible
CREATE POLICY "Quotation items visibility" ON public.quotation_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = public.quotation_items.quotation_id
    )
  );

-- 9. Pedidos (Orders)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('pse', 'transfer', 'cash')),
  payment_id TEXT,
  cus_code TEXT,
  payment_evidence_url TEXT,
  delivery_address TEXT,
  delivery_evidence_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Ítems del Pedido
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL
);

-- RLS para Pedidos
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can see their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Vendors can see related orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      JOIN public.stores s ON p.store_id = s.id
      WHERE oi.order_id = public.orders.id AND s.vendor_id = auth.uid()
    )
  );

CREATE POLICY "Order items visibility" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = public.order_items.order_id
    )
  );

-- 11. Categorías
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT
);

-- Categorías base de ferretería
INSERT INTO public.categories (name) VALUES 
('Construcción'), ('Herramientas'), ('Pinturas'), ('Eléctricos'), ('Plomería')
ON CONFLICT (name) DO NOTHING;

-- 12. Reseñas (Reviews)
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating_vendor INTEGER CHECK (rating_vendor BETWEEN 1 AND 5),
  rating_products INTEGER CHECK (rating_products BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

-- RLS para Reseñas
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 13. Documentos (PDFs generados)
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('quotation', 'invoice', 'receipt')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Documentos
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = owner_id);

