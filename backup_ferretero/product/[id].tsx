import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/database';
import { useCartStore } from '../../store/useCartStore';
import { ChevronLeft, ShoppingCart, Plus, Minus, ShieldCheck } from 'lucide-react-native';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    Alert.alert('¡Listo!', `${quantity} unidad(es) de "${product.name}" añadidas al carrito.`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  if (!product) return <View className="flex-1 justify-center items-center"><Text>Producto no encontrado</Text></View>;

  return (
    <View className="flex-1 bg-white">
      {/* Header Personalizado */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4 absolute top-0 left-0 right-0 z-10">
        <TouchableOpacity onPress={() => router.back()} className="bg-white/80 p-2 rounded-full">
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(buyer_tabs)/cart')} className="bg-white/80 p-2 rounded-full">
          <ShoppingCart size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/400' }}
          className="w-full h-96"
          resizeMode="cover"
        />

        <View className="px-6 py-6 bg-white rounded-t-3xl -mt-8">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{product.brand || 'Genérico'}</Text>
              <Text className="text-3xl font-bold text-gray-800 mt-1">{product.name}</Text>
            </View>
          </View>

          <View className="flex-row items-center mt-4">
            <Text className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</Text>
            <Text className="text-gray-400 ml-2">por {product.unit_measure || 'unid'}</Text>
          </View>

          <View className="h-[1px] bg-gray-100 my-6" />

          <Text className="text-gray-600 leading-6 text-base">
            {product.description || 'Este producto no tiene descripción técnica disponible en este momento.'}
          </Text>

          <View className="bg-blue-50 p-4 rounded-2xl mt-6 flex-row items-center">
            <ShieldCheck size={20} color="#2563eb" />
            <Text className="text-blue-700 text-sm ml-3 font-medium">Producto verificado y disponible en stock</Text>
          </View>

          {/* Selector de Cantidad */}
          <View className="mt-8 mb-32">
            <Text className="text-gray-800 font-bold mb-4">Seleccionar Cantidad</Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-gray-100 p-4 rounded-2xl"
              >
                <Minus size={20} color="#1e293b" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold mx-8">{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(q => q + 1)}
                className="bg-gray-100 p-4 rounded-2xl"
              >
                <Plus size={20} color="#1e293b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón Flotante */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleAddToCart}
          className="bg-blue-600 py-5 rounded-2xl items-center flex-row justify-center"
        >
          <ShoppingCart size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-3">Añadir al Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
