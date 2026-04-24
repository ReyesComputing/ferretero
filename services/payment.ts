import { supabase } from '../lib/supabase';

interface PurchaseData {
  buyer_id: string;
  items: any[];
  total: number;
  address: string;
  method: 'pse' | 'transfer';
}

/**
 * Procesa la compra completa: Crea el pedido y prepara la transacción
 */
export const processPurchase = async (data: PurchaseData) => {
  try {
    // 1. Crear la cabecera del pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: data.buyer_id,
        total_amount: data.total,
        status: 'pending',
        payment_method: data.method,
        delivery_address: data.address,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insertar los ítems del pedido
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Simulación de obtención de link de pago (PSE)
    // Aquí es donde se conectaría con la API de Wompi/PayU en el futuro
    const paymentUrl = `https://checkout.pasarela.com/pay?orderId=${order.id}&amount=${data.total}`;

    return {
      success: true,
      orderId: order.id,
      paymentUrl
    };

  } catch (error: any) {
    console.error('Error en processPurchase:', error.message);
    throw error;
  }
};
