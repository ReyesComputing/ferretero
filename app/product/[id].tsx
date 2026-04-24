import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/database';
import { useCartStore } from '../../store/useCartStore';
import { ChevronLeft, ShoppingCart, ShieldCheck, Minus, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      Alert.alert('¡Excelente!', 'Material añadido al pedido correctamente.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <View className="flex-1 justify-center bg-background"><ActivityIndicator color="#FF6600" /></View>;
  if (!product) return <View className="flex-1 justify-center items-center"><Text>Material no encontrado</Text></View>;

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Imagen y Botón Volver */}
        <View className="relative">
          <Image 
            source={{ uri: product.image_url || 'https://via.placeholder.com/600' }}
            className="w-full h-96 bg-gray-100"
            resizeMode="cover"
          />
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ top: insets.top + 10 }}
            className="absolute left-6 bg-white/90 p-3 rounded-ferretero shadow-lg"
          >
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Información Industrial */}
        <View className="p-6">
          <Text className="text-primary font-black uppercase text-xs tracking-[4px] mb-2">{product.brand || 'Calidad Industrial'}</Text>
          <Text className="text-3xl font-black text-secondary uppercase tracking-tighter mb-4">{product.name}</Text>
          
          <View className="bg-gray-100 p-6 rounded-ferretero flex-row justify-between items-center mb-8 border border-gray-200">
            <View>
              <Text className="text-gray-400 font-bold text-[10px] uppercase">Precio Obra</Text>
              <Text className="text-primary font-black text-3xl tracking-tighter">{formatPrice(product.price)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 font-bold text-[10px] uppercase">Stock Disponible</Text>
              <Text className="text-secondary font-black text-lg">{product.stock} UND</Text>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-3">Ficha Técnica</Text>
            <Text className="text-gray-500 font-medium leading-6">{product.description || 'Sin especificaciones adicionales.'}</Text>
          </View>

          {/* Selector de Cantidad Sólido */}
          <View className="flex-row items-center justify-between bg-white border border-gray-200 p-4 rounded-ferretero">
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest">Cantidad</Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => quantity > 1 && setQuantity(q => q - 1)}
                className="bg-gray-100 p-2 rounded-ferretero border border-gray-200"
              >
                <Minus size={20} color="#1E293B" />
              </TouchableOpacity>
              <Text className="mx-6 text-xl font-black text-secondary">{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(q => q + 1)}
                className="bg-gray-100 p-2 rounded-ferretero border border-gray-200"
              >
                <Plus size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-8 flex-row items-center bg-success/5 p-4 rounded-ferretero border border-success/10">
            <ShieldCheck size={20} color="#10B981" />
            <Text className="text-success font-bold text-xs ml-3 uppercase">Garantía de suministro certificado</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón de Acción Protegido */}
      <View 
        style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 16 }}
        className="absolute bottom-0 left-0 right-0 px-6 bg-white/95 border-t-2 border-gray-100"
      >
        <TouchableOpacity 
          onPress={handleAddToCart}
          className="bg-primary h-[64px] rounded-ferretero flex-row justify-center items-center shadow-xl shadow-orange-500/30"
        >
          <ShoppingCart size={24} color="white" />
          <Text className="text-white font-black text-lg ml-4 uppercase tracking-tighter">Añadir al Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
