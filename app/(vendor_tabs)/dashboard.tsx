import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { TrendingUp, ShoppingBag, Clock, DollarSign, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VendorDashboard() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuthStore();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchStats = async () => {
    if (!profile) return;
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .select(`
          unit_price,
          quantity,
          orders (id, status),
          products!inner (store_id, stores!inner (vendor_id))
        `)
        .eq('products.stores.vendor_id', profile.id);

      if (itemError) throw itemError;

      const castData = itemData as any[];
      const totalSales = castData.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
      const uniqueOrderIds = new Set(castData.map(item => item.orders.id));
      const pendingOrdersCount = new Set(castData.filter(item => item.orders.status === 'paid').map(item => item.orders.id)).size;

      setStats({
        totalSales,
        totalOrders: uniqueOrderIds.size,
        pendingOrders: pendingOrdersCount,
      });

      if (uniqueOrderIds.size > 0) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, profiles(name)')
          .in('id', Array.from(uniqueOrderIds))
          .order('created_at', { ascending: false })
          .limit(5);
        setOrders(orderData || []);
      }
    } catch (e) {
      console.error(e);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-vendorBackground"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D4ED8" />}
    >
      <View className="p-4">
        {/* Header Administrativo */}
        <View className="flex-row justify-between items-center mb-6 bg-vendorSecondary p-5 rounded-ferretero shadow-lg">
          <View className="flex-row items-center">
            <View className="bg-vendorPrimary p-2 rounded-ferretero mr-3">
              <LayoutDashboard size={20} color="white" />
            </View>
            <View>
              <Text className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Panel de Control</Text>
              <Text className="text-xl font-black text-white uppercase tracking-tighter">{profile?.name}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => signOut()} className="bg-white/10 p-2 rounded-ferretero">
            <LogOut size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Estadísticas Densas */}
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-vendorPrimary p-4 rounded-ferretero mb-4 shadow-sm">
            <DollarSign size={20} color="white" />
            <Text className="text-white opacity-80 mt-1 text-[10px] font-bold uppercase">Ventas Totales</Text>
            <Text className="text-white text-base font-black tracking-tighter">{formatPrice(stats.totalSales)}</Text>
          </View>

          <View className="w-[48%] bg-white p-4 rounded-ferretero mb-4 shadow-sm border border-gray-200">
            <ShoppingBag size={20} color="#1D4ED8" />
            <Text className="text-gray-400 mt-1 text-[10px] font-bold uppercase">Total Pedidos</Text>
            <Text className="text-vendorSecondary text-xl font-black tracking-tighter">{stats.totalOrders}</Text>
          </View>

          <View className="w-full bg-white p-4 rounded-ferretero mb-4 shadow-sm border border-gray-200 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-warning/10 p-2 rounded-ferretero">
                <Clock size={20} color="#F59E0B" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-400 text-[10px] font-bold uppercase">Pendientes de Despacho</Text>
                <Text className="text-vendorSecondary text-lg font-black tracking-tighter">{stats.pendingOrders}</Text>
              </View>
            </View>
            <TrendingUp size={20} color="#10B981" />
          </View>
        </View>

        {/* Últimas Ventas - Estilo Lista Técnica */}
        <View className="mt-6 mb-10">
          <Text className="text-sm font-black text-vendorSecondary uppercase tracking-widest mb-3 ml-1">Últimos Movimientos</Text>
          {orders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              className="bg-white p-3 rounded-ferretero border border-gray-100 mb-2 flex-row items-center shadow-sm"
            >
              <View className={`w-1.5 h-10 rounded-full mr-3 ${order.status === 'delivered' ? 'bg-success' : 'bg-warning'}`} />
              <View className="flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className="font-black text-vendorSecondary text-sm uppercase tracking-tighter">#{order.id.slice(0, 8)}</Text>
                  <Text className="text-vendorPrimary font-black text-sm">{formatPrice(order.total_amount)}</Text>
                </View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase">{order.profiles?.name}</Text>
              </View>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
          {orders.length === 0 && !loading && (
            <View className="bg-white p-8 rounded-ferretero border border-dashed border-gray-300 items-center">
              <Text className="text-gray-400 font-black uppercase text-[10px]">Sin ventas registradas</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
