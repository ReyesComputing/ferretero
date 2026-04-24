import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types/database';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/product/${product.id}` as any)}
      className="bg-white rounded-ferretero border border-gray-200 mb-4 overflow-hidden shadow-sm"
    >
      <Image 
        source={{ uri: product.image_url || 'https://via.placeholder.com/300' }}
        className="w-full h-48 bg-gray-50"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-gray-400 font-black uppercase text-[9px] tracking-widest">{product.brand || 'Genérico'}</Text>
        <Text className="text-secondary font-black text-sm uppercase tracking-tight mt-1" numberOfLines={1}>
          {product.name}
        </Text>
        
        <View className="flex-row justify-between items-end mt-4">
          <View>
            <Text className="text-gray-400 font-bold text-[10px] uppercase">Precio Obra</Text>
            <Text className="text-primary font-black text-lg tracking-tighter">{formatPrice(product.price)}</Text>
          </View>
          <View className="bg-primary p-2 rounded-ferretero">
            <Plus size={20} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
