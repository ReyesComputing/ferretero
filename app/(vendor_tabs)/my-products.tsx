import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Product } from '../../types/database';
import { useRouter } from 'expo-router';
import { Plus, Edit2, Trash2, Package, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyProducts() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar Material',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await supabase.from('products').delete().eq('id', id);
          fetchProducts();
        }}
      ]
    );
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
      {/* Header Industrial */}
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className="bg-vendorSecondary px-6 pb-6 shadow-md border-b-2 border-vendorPrimary"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-black text-2xl uppercase tracking-tighter">Mi Inventario</Text>
            <Text className="text-blue-300 font-black uppercase text-[10px] tracking-widest mt-1">Control de Stock</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(vendor_tabs)/add-product')}
            className="bg-vendorPrimary p-3 rounded-ferretero shadow-lg shadow-blue-500/30"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#1D4ED8" className="mt-20" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          className="px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D4ED8" />}
          renderItem={({ item }) => (
            <View className={`bg-white p-3 rounded-ferretero mb-2 border border-gray-200 flex-row items-center shadow-sm ${!item.is_active ? 'opacity-60' : ''}`}>
              <Image 
                source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
                className="w-16 h-16 rounded-ferretero border border-gray-100"
                resizeMode="cover"
              />
              <View className="ml-4 flex-1">
                <Text className="text-vendorSecondary font-black text-sm uppercase tracking-tight" numberOfLines={1}>{item.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-vendorPrimary font-black text-sm">{formatPrice(item.price)}</Text>
                  <View className={`ml-3 px-2 py-0.5 rounded-ferretero ${item.stock < 10 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Text className={`text-[9px] font-black uppercase ${item.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                      Stock: {item.stock} {item.stock < 10 ? '¡CRÍTICO!' : ''}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => router.push(`/(vendor_tabs)/add-product?id=${item.id}`)} className="p-2 mr-1">
                  <Edit2 size={18} color="#1D4ED8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Package size={48} color="#cbd5e1" />
              <Text className="text-gray-400 mt-4 font-black uppercase text-xs">Catálogo vacío</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
