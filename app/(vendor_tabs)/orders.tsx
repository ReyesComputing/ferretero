import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';
import { ClipboardList, ChevronRight, Package } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VendorOrders() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    if (!profile) return;
    
    // Obtenemos los IDs de productos del vendedor para filtrar órdenes
    const { data: myProducts } = await supabase.from('products').select('id').eq('vendor_id', profile.id);
    const productIds = myProducts?.map(p => p.id) || [];

    if (productIds.length === 0) {
      setLoading(false);
      return;
    }

    // Obtenemos los items de esos productos
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id')
      .in('product_id', productIds);
    
    const orderIds = Array.from(new Set(items?.map(i => i.order_id) || []));

    if (orderIds.length > 0) {
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(name)')
        .in('id', orderIds)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#F59E0B'; // Ámbar (Pendiente)
      case 'shipped': return '#1D4ED8'; // Azul (En Camino)
      case 'delivered': return '#10B981'; // Verde (Entregado)
      default: return '#94a3b8';
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
    <View className="flex-1 bg-vendorBackground">
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className="bg-vendorSecondary px-6 pb-6 shadow-md border-b-2 border-vendorPrimary"
      >
        <Text className="text-white font-black text-2xl uppercase tracking-tighter">Control de Ventas</Text>
        <Text className="text-blue-300 font-black uppercase text-[10px] tracking-widest mt-1">Órdenes de Despacho</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#1D4ED8" className="mt-20" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          className="px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D4ED8" />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push(`/(vendor_tabs)/order/${item.id}` as any)}
              className="bg-white p-4 rounded-ferretero mb-2 border border-gray-100 flex-row items-center shadow-sm"
            >
              <View style={{ backgroundColor: getStatusColor(item.status) + '20' }} className="w-1.5 h-12 rounded-full mr-4" />
              <View className="flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-vendorSecondary font-black text-sm uppercase tracking-tighter">#{item.id.slice(0, 8)}</Text>
                  <Text className="text-vendorPrimary font-black text-sm">{formatPrice(item.total_amount)}</Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-400 font-bold uppercase text-[9px]">{item.profiles?.name}</Text>
                  <View style={{ backgroundColor: getStatusColor(item.status) }} className="ml-auto px-2 py-0.5 rounded-ferretero">
                    <Text className="text-white text-[8px] font-black uppercase">{item.status}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <ClipboardList size={48} color="#cbd5e1" />
              <Text className="text-gray-400 mt-4 font-black uppercase text-xs tracking-widest">Sin ventas por ahora</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
