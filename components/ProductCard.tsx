import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types/database';
import { useCartStore } from '../store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
      <Image
        source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
          {product.name}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-blue-600 font-bold text-lg">
            {formatPrice(product.price)}
          </Text>
          <Text className="text-gray-500 text-sm italic">
            por {product.unit_measure || 'unid'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => addItem(product)}
          className="bg-blue-600 py-2 rounded-lg mt-3 items-center"
        >
          <Text className="text-white font-bold">Añadir al carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
