import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Package, Clock, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyOrders() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#FF6600'; // Naranja (Pagado)
      case 'shipped': return '#1D4ED8'; // Azul (Despachado)
      case 'delivered': return '#10B981'; // Verde (Entregado)
      default: return '#94a3b8';
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header Industrial */}
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className="bg-secondary px-6 pb-8 shadow-md"
      >
        <Text className="text-2xl font-black text-white uppercase tracking-tighter">Seguimiento de Pedidos</Text>
        <Text className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">Control de mis materiales</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF6600" className="mt-20" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          className="px-6 pt-6"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6600" />}
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-ferretero mb-4 border border-gray-200 shadow-sm flex-row items-center">
              <View style={{ backgroundColor: getStatusColor(item.status) + '20' }} className="w-12 h-12 rounded-ferretero items-center justify-center">
                <Package size={24} color={getStatusColor(item.status)} />
              </View>
              
              <View className="ml-4 flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-secondary font-black text-sm uppercase tracking-tighter">#{item.id.slice(0, 8)}</Text>
                  <Text className="text-primary font-black text-sm">{formatPrice(item.total_amount)}</Text>
                </View>
                <View className="flex-row items-center mt-2">
                  <Clock size={12} color="#94a3b8" />
                  <Text className="text-gray-400 text-[10px] font-bold uppercase ml-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <View style={{ backgroundColor: getStatusColor(item.status) }} className="ml-auto px-3 py-1 rounded-ferretero">
                    <Text className="text-white text-[9px] font-black uppercase">{item.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <ShoppingBag size={64} color="#cbd5e1" />
              <Text className="text-gray-400 mt-6 text-lg font-black uppercase tracking-tighter">Sin pedidos registrados</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
