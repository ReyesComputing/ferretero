import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * Webhook para procesar pagos automáticos de PSE
 * Este endpoint recibe las notificaciones de la pasarela de pagos
 */

serve(async (req) => {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    
    // Extraemos los datos comunes de una transacción (ajustar según pasarela específica)
    // Supongamos un formato estándar de respuesta
    const { 
      order_id, 
      status, // 'APPROVED', 'DECLINED', 'PENDING'
      cus_code, 
      transaction_id 
    } = payload

    // Si el pago fue aprobado, actualizamos el estado en la base de datos
    if (status === 'APPROVED' || status === 'SUCCESS') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'paid',
          cus_code: cus_code,
          payment_id: transaction_id
        })
        .eq('id', order_id)
        .select()

      if (error) throw error

      console.log(`Pago procesado automáticamente para el pedido: ${order_id}`)
      
      return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'Order updated to paid' 
      }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      })
    }

    return new Response(JSON.stringify({ message: "Notification received but not approved status" }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error('Error processing payment webhook:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 400 
    })
  }
})
