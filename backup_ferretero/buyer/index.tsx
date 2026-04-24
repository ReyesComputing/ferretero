import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/database';
import { ProductCard } from '../../components/ProductCard';
import { CategoryCarousel } from '../../components/CategoryCarousel';
import { Search } from 'lucide-react-native';

export default function HomeFeed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      let query = supabase.from('products').select('*').eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con Buscador */}
      <View className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <Text className="text-3xl font-bold text-blue-600 mb-4">Ferretero</Text>
        <View className="bg-gray-100 flex-row items-center px-4 py-3 rounded-2xl">
          <Search size={20} color="#64748b" />
          <TextInput
            placeholder="¿Qué material buscas hoy?"
            className="flex-1 ml-3 text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <ProductCard product={item} />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <CategoryCarousel
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat === selectedCategory ? '' : cat)}
            />
            <View className="px-6 py-2">
              <Text className="text-xl font-bold text-gray-800 capitalize">
                {selectedCategory ? `Productos en ${selectedCategory}` : 'Todos los productos'}
              </Text>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
        }
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-gray-400">No hay productos en esta categoría.</Text>
          </View>
        }
      />
    </View>
  );
}
