import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { TrendingUp, ShoppingBag, Clock, DollarSign, LogOut, ExternalLink, CheckCircle2, Truck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Linking, TextInput } from 'react-native';

export default function VendorDashboard() {
  const { profile, signOut } = useAuthStore();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{ [key: string]: { url: string; notes: string } }>({});
  const router = useRouter();

  const fetchStats = async () => {
    if (!profile) return;

    try {
      // Fetch stats
      const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .select(`
          unit_price,
          quantity,
          orders (id, status),
          products!inner (
            store_id,
            stores!inner (vendor_id)
          )
        `)
        .eq('products.stores.vendor_id', profile.id);

      if (itemError) throw itemError;

      const castData = itemData as any[];
      const totalSales = castData.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
      const uniqueOrderIdsSet = new Set(castData.map(item => item.orders.id));
      const uniqueOrderIdsArray = Array.from(uniqueOrderIdsSet);

      setStats({
        totalSales,
        totalOrders: uniqueOrderIdsSet.size,
        pendingOrders: new Set(castData.filter(item => item.orders.status === 'pending').map(item => item.orders.id)).size,
      });

      // Fetch actual orders for dispatching
      if (uniqueOrderIdsArray.length > 0) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, profiles(name, email)')
          .in('id', uniqueOrderIdsArray)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;
        setOrders(orderData || []);
      }
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleLogout = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const handleScheduleDispatch = async (orderId: string) => {
    const dispatchDate = new Date();
    dispatchDate.setDate(dispatchDate.getDate() + 1); // Despacho mañana

    const { error } = await supabase
      .from('orders')
      .update({
        dispatch_date: dispatchDate.toISOString(),
        status: 'shipped'
      })
      .eq('id', orderId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Despacho programado para mañana');
      fetchStats();
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    const info = deliveryInfo[orderId] || { url: '', notes: '' };

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivery_evidence_url: info.url,
        delivery_notes: info.notes
      })
      .eq('id', orderId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Pedido marcado como entregado');
      fetchStats();
    }
  };

  const openEvidence = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir la URL'));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
    >
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500">¡Hola!</Text>
            <Text className="text-2xl font-bold text-gray-800">{profile?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} className="bg-red-50 p-3 rounded-full">
            <LogOut size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-blue-600 p-6 rounded-3xl mb-4 shadow-sm">
            <DollarSign size={24} color="white" />
            <Text className="text-white opacity-80 mt-2 text-xs">Mis Ventas</Text>
            <Text className="text-white text-lg font-bold">{formatPrice(stats.totalSales)}</Text>
          </View>

          <View className="w-[48%] bg-white p-6 rounded-3xl mb-4 shadow-sm border border-gray-100">
            <ShoppingBag size={24} color="#2563eb" />
            <Text className="text-gray-500 mt-2 text-xs">Mis Pedidos</Text>
            <Text className="text-gray-800 text-2xl font-bold">{stats.totalOrders}</Text>
          </View>

          <View className="w-full bg-white p-6 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-3 rounded-full">
                <Clock size={24} color="#f97316" />
              </View>
              <View className="ml-4">
                <Text className="text-gray-500 text-xs">Pedidos Pendientes</Text>
                <Text className="text-gray-800 text-xl font-bold">{stats.pendingOrders}</Text>
              </View>
            </View>
            <TrendingUp size={24} color="#10b981" />
          </View>
        </View>

        <View className="mt-8 mb-10">
          <Text className="text-xl font-bold text-gray-800 mb-4">Gestión de Despachos</Text>
          {orders.length === 0 ? (
            <View className="bg-white p-10 rounded-3xl border border-dashed border-gray-300 items-center justify-center">
              <Text className="text-gray-400">No hay pedidos para gestionar.</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 mb-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-bold text-gray-800">#{order.id.slice(0, 8)}</Text>
                  <View className={`px-2 py-0.5 rounded ${order.status === 'shipped' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-[10px] font-bold ${order.status === 'shipped' ? 'text-green-600' : 'text-orange-600'}`}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 text-sm mb-1">{order.profiles?.name}</Text>
                <Text className="text-gray-400 text-xs mb-3">{new Date(order.created_at).toLocaleDateString()}</Text>

                {order.payment_evidence_url && (
                  <TouchableOpacity
                    onPress={() => openEvidence(order.payment_evidence_url)}
                    className="mb-2 flex-row items-center"
                  >
                    <ExternalLink size={14} color="#2563eb" />
                    <Text className="text-blue-600 text-xs ml-1 underline">Ver comprobante de pago</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'delivered' ? (
                  <View className="bg-green-50 p-2 rounded-lg flex-row items-center">
                    <CheckCircle2 size={14} color="#10b981" />
                    <Text className="text-green-600 text-xs font-bold ml-2">Entregado</Text>
                  </View>
                ) : order.status === 'shipped' ? (
                  <View className="space-y-2">
                    <View className="bg-blue-50 p-2 rounded-lg flex-row items-center">
                      <Truck size={14} color="#2563eb" />
                      <Text className="text-blue-600 text-xs font-bold ml-2">En camino</Text>
                    </View>

                    <View className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">Evidencia de Entrega</Text>
                      <TextInput
                        className="text-xs bg-white p-2 rounded border border-gray-200 mb-2"
                        placeholder="URL de imagen/recibo"
                        value={deliveryInfo[order.id]?.url || ''}
                        onChangeText={(t) => setDeliveryInfo({ ...deliveryInfo, [order.id]: { ...deliveryInfo[order.id], url: t } })}
                      />
                      <TextInput
                        className="text-xs bg-white p-2 rounded border border-gray-200 mb-2"
                        placeholder="Notas (ej: Recibió portería)"
                        value={deliveryInfo[order.id]?.notes || ''}
                        onChangeText={(t) => setDeliveryInfo({ ...deliveryInfo, [order.id]: { ...deliveryInfo[order.id], notes: t } })}
                      />
                      <TouchableOpacity
                        onPress={() => handleMarkAsDelivered(order.id)}
                        className="bg-green-600 py-2 rounded-lg items-center"
                      >
                        <Text className="text-white font-bold text-xs">Confirmar Entrega</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleScheduleDispatch(order.id)}
                    className="bg-blue-600 py-2 rounded-lg items-center"
                  >
                    <Text className="text-white font-bold text-sm">Programar Despacho</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
