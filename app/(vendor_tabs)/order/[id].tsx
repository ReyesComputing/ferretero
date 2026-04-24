import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Camera, Truck, CheckCircle2, User, MapPin, Building, FileText, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base-64';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VendorOrderDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (id, name, email, nit, address, phone, billing_email, rut_url),
        order_items (
          id, quantity, unit_price,
          products (name, brand)
        )
      `)
      .eq('id', id)
      .single();

    if (data) setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const takeEvidence = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.canceled) {
      uploadEvidence(result.assets[0].uri);
    }
  };

  const uploadEvidence = async (uri: string) => {
    setUpdating(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `delivery-evidence/${id}/${Date.now()}.jpg`;
      
      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      await supabase
        .from('orders')
        .update({ delivery_evidence_url: publicUrl, status: 'delivered' })
        .eq('id', id);

      Alert.alert('Éxito', 'Evidencia subida y pedido entregado.');
      fetchOrder();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <View className="flex-1 justify-center bg-vendorBackground"><ActivityIndicator color="#1D4ED8" /></View>;
  if (!order) return <View className="flex-1 justify-center items-center"><Text>Pedido no encontrado</Text></View>;

  return (
    <ScrollView 
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-vendorBackground"
    >
      <View className="p-4 pb-20">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center">
          <ChevronLeft size={20} color="#1D4ED8" />
          <Text className="text-vendorPrimary font-black uppercase text-xs ml-1">Volver a Ventas</Text>
        </TouchableOpacity>

        <View className="bg-vendorSecondary p-6 rounded-ferretero shadow-lg border-b-4 border-vendorPrimary mb-6">
          <Text className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">Orden de Despacho</Text>
          <Text className="text-3xl font-black text-white uppercase tracking-tighter">#{order.id.slice(0, 8)}</Text>
          <View className={`mt-4 self-start px-3 py-1 rounded-ferretero ${order.status === 'delivered' ? 'bg-success' : 'bg-warning'}`}>
            <Text className="text-white text-[10px] font-black uppercase">{order.status}</Text>
          </View>
        </View>

        <Text className="text-xs font-black text-vendorSecondary uppercase tracking-widest mb-3 ml-1">Datos del Cliente</Text>
        <View className="bg-white p-5 rounded-ferretero border border-gray-200 shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <User size={18} color="#1D4ED8" />
            <Text className="text-vendorSecondary font-black ml-3 text-lg uppercase tracking-tight">{order.profiles?.name}</Text>
          </View>
          <View className="bg-gray-50 p-4 rounded-ferretero border border-gray-100 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-[10px] font-bold uppercase">NIT</Text>
              <Text className="text-vendorSecondary font-black text-xs">{order.profiles?.nit || 'No Registrado'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-[10px] font-bold uppercase">Dirección</Text>
              <Text className="text-vendorSecondary font-black text-xs text-right flex-1 ml-4">{order.profiles?.address}</Text>
            </View>
          </View>
          {order.profiles?.rut_url && (
            <TouchableOpacity 
              onPress={() => Linking.openURL(order.profiles.rut_url)}
              className="mt-4 bg-blue-50 p-3 rounded-ferretero border border-blue-100 flex-row items-center justify-center"
            >
              <FileText size={16} color="#1D4ED8" />
              <Text className="text-vendorPrimary font-black text-xs ml-3 uppercase">Ver Documento RUT</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-xs font-black text-vendorSecondary uppercase tracking-widest mb-3 ml-1">Lista de Materiales</Text>
        <View className="bg-white p-5 rounded-ferretero border border-gray-200 shadow-sm mb-6">
          {order.order_items.map((item: any) => (
            <View key={item.id} className="flex-row justify-between items-center mb-3 border-b border-gray-50 pb-2">
              <View className="flex-1">
                <Text className="font-black text-vendorSecondary uppercase text-xs">{item.products?.name}</Text>
                <Text className="text-gray-400 text-[9px] uppercase">{item.products?.brand}</Text>
              </View>
              <Text className="font-black text-vendorPrimary text-sm">x{item.quantity}</Text>
            </View>
          ))}
          <View className="flex-row justify-between items-center bg-vendorSecondary p-4 rounded-ferretero mt-2">
            <Text className="text-white/60 font-bold uppercase text-[10px]">Total Pedido</Text>
            <Text className="text-white font-black text-xl">{formatPrice(order.total_amount)}</Text>
          </View>
        </View>

        {order.status !== 'delivered' && (
          <TouchableOpacity 
            onPress={takeEvidence}
            disabled={updating}
            className="bg-vendorPrimary h-[64px] rounded-ferretero flex-row justify-center items-center shadow-xl shadow-blue-500/30"
          >
            {updating ? <ActivityIndicator color="white" /> : (
              <>
                <Camera size={24} color="white" />
                <Text className="text-white font-black text-lg ml-4 uppercase tracking-tighter">Tomar Evidencia y Entregar</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {order.status === 'delivered' && (
          <View className="bg-success/10 p-5 rounded-ferretero border border-success/20 items-center">
            <CheckCircle2 size={32} color="#10B981" />
            <Text className="text-success font-black mt-2 uppercase">Pedido Entregado</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
