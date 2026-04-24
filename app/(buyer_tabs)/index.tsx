import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/database';
import { ProductCard } from '../../components/ProductCard';
import { CategoryCarousel } from '../../components/CategoryCarousel';
import { Search, Hammer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeFeed() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (data) setProducts(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header Industrial con Safe Area */}
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className="bg-secondary px-6 pb-8 shadow-md"
      >
        <View className="flex-row items-center mb-5">
          <View className="bg-primary p-2 rounded-ferretero mr-3">
            <Hammer size={20} color="white" />
          </View>
          <Text className="text-3xl font-black text-white uppercase tracking-tighter">Ferretero</Text>
        </View>

        <View className="bg-white flex-row items-center px-4 h-[52px] rounded-ferretero border border-gray-300">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 font-bold text-secondary"
            placeholder="Buscar materiales, herramientas..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <CategoryCarousel 
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        }
        renderItem={({ item }) => (
          <View className="px-6">
            <ProductCard product={item} />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6600" />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#FF6600" className="mt-20" />
          ) : (
            <View className="py-20 items-center">
              <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No se encontraron materiales</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
