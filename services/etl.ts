import { supabase } from '../lib/supabase';

/**
 * Servicio Placeholder para el proceso ETL (Extract, Transform, Load)
 * Este servicio está diseñado para manejar la carga masiva de datos desde:
 * 1. Mensajes de WhatsApp (Texto, Fotos de listas)
 * 2. Archivos de Excel / CSV
 * 3. Integración con ERPs externos
 */

interface RawProductData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  unit_measure?: string;
  category?: string;
}

export const ETLService = {
  /**
   * Procesa un texto extraído de WhatsApp para identificar productos y precios.
   * En una implementación real, esto usaría una API de LLM (como OpenAI) para parsear el lenguaje natural.
   */
  async parseWhatsAppMessage(message: string, vendorId: string): Promise<RawProductData[]> {
    console.log(`Procesando mensaje de WhatsApp para el vendedor ${vendorId}`);

    // Implementación básica con Regex para extraer "Nombre - Precio" o "Nombre: Precio"
    // Ejemplo: "Cemento Argos - 35000"
    const lines = message.split('\n');
    const products: RawProductData[] = [];

    const regex = /(.+?)[-:]\s*(\d+)/;

    lines.forEach(line => {
      const match = line.match(regex);
      if (match) {
        products.push({
          name: match[1].trim(),
          price: parseFloat(match[2]),
          stock: 0,
          unit_measure: 'unid',
          category: 'otros'
        });
      }
    });

    return products;
  },

  /**
   * Procesa una imagen de una lista de precios enviada por WhatsApp.
   * Usaría OCR (como Google Cloud Vision) y luego un LLM para estructurar los datos.
   */
  async processListImage(imageUrl: string, vendorId: string): Promise<RawProductData[]> {
    console.log(`Procesando imagen de lista ${imageUrl}`);
    return [];
  },

  /**
   * Carga masiva de productos a la base de datos de Supabase.
   */
  async bulkLoadProducts(products: RawProductData[], storeId: string) {
    const formattedProducts = products.map(p => ({
      ...p,
      store_id: storeId,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('products')
      .upsert(formattedProducts, { onConflict: 'store_id, name' });

    if (error) throw error;
    return data;
  },

  /**
   * Calcula el precio para un cliente específico basado en las políticas de descuento del vendedor.
   */
  async calculateCustomerPrice(productId: string, customerId: string, vendorId: string): Promise<number> {
    const { data: product } = await supabase.from('products').select('price, category').eq('id', productId).single();
    const { data: policy } = await supabase
      .from('vendor_discounts')
      .select('discount_percentage')
      .eq('vendor_id', vendorId)
      .eq('customer_id', customerId)
      .or(`category.eq.${product?.category},category.is.null`)
      .order('category', { ascending: false }) // Prioriza descuentos por categoría sobre globales
      .limit(1)
      .single();

    if (!product) return 0;
    if (!policy) return product.price;

    return product.price * (1 - (policy.discount_percentage / 100));
  }
};
