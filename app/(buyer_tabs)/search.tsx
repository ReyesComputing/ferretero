import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/database';
import { ProductCard } from '../../components/ProductCard';
import { Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${text}%,brand.ilike.%${text}%,description.ilike.%${text}%`)
      .order('name', { ascending: true })
      .limit(50);
    setResults(data ?? []);
    setLoading(false);
    setSearched(true);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 10 }} className="bg-secondary px-6 pb-6 shadow-md">
        <Text className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Buscar</Text>
        <View className="flex-row items-center bg-white rounded-ferretero px-4 h-12">
          <Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 font-bold text-secondary"
            placeholder="Buscar productos, marcas..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6600" />
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-2xl font-black text-secondary uppercase tracking-tighter mb-2">Sin resultados</Text>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center">
            No encontramos productos para "{query}"
          </Text>
        </View>
      )}

      {!loading && !searched && (
        <View className="flex-1 justify-center items-center px-8">
          <Search size={64} color="#e2e8f0" />
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center mt-4">
            Escribe al menos 2 caracteres para buscar
          </Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
