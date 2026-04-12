import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Quotation, QuotationItem, Product } from '../../types/database';
import { FileText, Share2, ArrowLeft } from 'lucide-react-native';

export default function QuotationDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [items, setItems] = useState<(QuotationItem & { products: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (quoteError) throw quoteError;
      setQuotation(quoteData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*, products(*)')
        .eq('quotation_id', id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!quotation) return;
    try {
      const message = `Cotización Ferretero #${quotation.id.slice(0, 8)}\nTotal: $${quotation.total_amount}\n\nÍtems:\n${items
        .map((item) => `- ${item.products.name}: ${item.quantity} ${item.unit_measure} x $${item.unit_price}`)
        .join('\n')}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center"><Text>Cargando cotización...</Text></View>;
  if (!quotation) return <View className="flex-1 items-center justify-center"><Text>Cotización no encontrada.</Text></View>;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Detalle de Cotización', headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} className="ml-4">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
      )}} />

      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-8">
          <View className="bg-blue-100 p-4 rounded-full mb-4">
            <FileText size={40} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">Cotización</Text>
          <Text className="text-gray-500">ID: {quotation.id.slice(0, 8)}</Text>
          <Text className="text-gray-400 text-sm">Fecha: {new Date(quotation.created_at).toLocaleDateString()}</Text>
          <Text className="text-red-500 text-xs mt-1">Vence: {new Date(quotation.expires_at).toLocaleDateString()}</Text>
        </View>

        <View className="border-t border-b border-gray-100 py-4 mb-6">
          <Text className="font-bold text-lg mb-4">Productos</Text>
          {items.map((item) => (
            <View key={item.id} className="flex-row justify-between mb-3">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{item.products.name}</Text>
                <Text className="text-gray-500 text-sm">{item.quantity} {item.unit_measure} x ${item.unit_price}</Text>
              </View>
              <Text className="font-bold text-gray-800">${(item.quantity * item.unit_price).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row justify-between items-center mb-10">
          <Text className="text-xl font-bold text-gray-800">Total Cotizado</Text>
          <Text className="text-2xl font-black text-blue-600">${quotation.total_amount.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          className="bg-blue-600 flex-row items-center justify-center py-4 rounded-xl mb-4"
        >
          <Share2 size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold text-lg ml-2">Compartir Cotización</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs italic">
          Esta cotización es informativa y está sujeta a disponibilidad de inventario al momento de la compra.
        </Text>
      </ScrollView>
    </View>
  );
}
