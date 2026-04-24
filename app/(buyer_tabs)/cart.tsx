import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Trash2, CreditCard, MapPin, Building, Mail, ShoppingCart, Minus, Plus, FileText, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../lib/supabase';
import { decode } from 'base-64';
import * as FileSystem from 'expo-file-system';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    nit: profile?.nit || '',
    address: profile?.address || '',
    billingEmail: profile?.billing_email || profile?.email || '',
    rutUrl: profile?.rut_url || '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const pickRUT = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true
    });

    if (!result.canceled) {
      uploadRUT(result.assets[0].uri, result.assets[0].name);
    }
  };

  const uploadRUT = async (uri: string, name: string) => {
    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `rut-documents/${profile?.id}/${Date.now()}_${name}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { 
          contentType: name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' 
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      setBillingInfo({ ...billingInfo, rutUrl: publicUrl });
      Alert.alert('Éxito', 'Documento RUT cargado correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!billingInfo.nit || !billingInfo.address || !billingInfo.rutUrl) {
      Alert.alert('Datos de Facturación', 'Por favor llena el NIT, la dirección y carga el RUT para procesar el pedido.');
      return;
    }

    setLoading(true);
    // Simulación de proceso de pago PSE
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Pedido Procesado', 'Tu pedido ha sido enviado al vendedor y el pago PSE fue exitoso.');
      clearCart();
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-8">
        <View className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingCart size={64} color="#94a3b8" />
        </View>
        <Text className="text-2xl font-black text-secondary uppercase tracking-tighter mb-2">Tu Carrito está vacío</Text>
        <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Añade materiales para tu obra</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 40 }}
    >
      <View className="p-6">
        <Text className="text-3xl font-black text-secondary uppercase tracking-tighter mb-8">Mi Pedido</Text>

        {/* Lista de Items */}
        <View className="space-y-4 mb-10">
          {items.map((item) => (
            <View key={item.product.id} className="bg-white p-4 rounded-ferretero border border-gray-100 flex-row items-center shadow-sm">
              <Image source={{ uri: item.product.image_url }} className="w-16 h-16 rounded-ferretero bg-gray-50" />
              <View className="ml-4 flex-1">
                <Text className="text-secondary font-black text-xs uppercase tracking-tight" numberOfLines={1}>{item.product.name}</Text>
                <Text className="text-primary font-black text-sm mt-1">{formatPrice(item.product.price)}</Text>
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity onPress={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="bg-gray-50 p-1 rounded-ferretero border border-gray-200">
                    <Minus size={14} color="#1E293B" />
                  </TouchableOpacity>
                  <Text className="mx-4 font-black text-secondary">{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity + 1)} className="bg-gray-50 p-1 rounded-ferretero border border-gray-200">
                    <Plus size={14} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.product.id)} className="p-2 ml-2">
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Formulario Fiscal Industrial */}
        <View className="bg-secondary p-6 rounded-ferretero mb-8 shadow-lg">
          <Text className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Información para Facturación</Text>
          
          <View className="space-y-5">
            <View>
              <Text className="text-blue-300 font-black uppercase text-[9px] tracking-widest mb-2 ml-1">NIT / Cédula *</Text>
              <View className="bg-white/10 flex-row items-center px-4 h-[52px] rounded-ferretero border border-white/20">
                <Building size={18} color="white" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-white" 
                  placeholder="Ej: 900.123.456-7"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={billingInfo.nit}
                  onChangeText={(t) => setBillingInfo({...billingInfo, nit: t})}
                />
              </View>
            </View>

            <View>
              <Text className="text-blue-300 font-black uppercase text-[9px] tracking-widest mb-2 ml-1">Dirección de Despacho *</Text>
              <View className="bg-white/10 flex-row items-center px-4 h-[52px] rounded-ferretero border border-white/20">
                <MapPin size={18} color="white" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-white" 
                  placeholder="Calle 123 # 45-67, Obra Central"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={billingInfo.address}
                  onChangeText={(t) => setBillingInfo({...billingInfo, address: t})}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={pickRUT}
              disabled={loading}
              className={`h-[52px] rounded-ferretero border-2 border-dashed items-center justify-center flex-row ${billingInfo.rutUrl ? 'border-success bg-success/10' : 'border-white/30 bg-white/5'}`}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  {billingInfo.rutUrl ? <FileText size={18} color="#10B981" /> : <Upload size={18} color="white" />}
                  <Text className={`font-black uppercase text-[10px] ml-3 tracking-widest ${billingInfo.rutUrl ? 'text-success' : 'text-white'}`}>
                    {billingInfo.rutUrl ? 'RUT CARGADO CORRECTAMENTE' : 'CARGAR PDF DEL RUT / CC'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumen y Pago */}
        <View className="bg-white p-6 rounded-ferretero border border-gray-200 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-gray-400 font-black uppercase text-xs">Total del Pedido</Text>
            <Text className="text-primary font-black text-3xl tracking-tighter">{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity 
            onPress={handleCheckout}
            disabled={loading}
            className="bg-primary h-[64px] rounded-ferretero flex-row justify-center items-center shadow-xl shadow-orange-500/30"
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <CreditCard size={24} color="white" />
                <Text className="text-white font-black text-lg ml-4 uppercase tracking-tighter">Pagar con PSE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
