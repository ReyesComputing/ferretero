import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Camera, ChevronLeft, Save } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base-64';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddProduct() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    stock: '',
    category: 'otros',
    image_url: '',
  });

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setForm({
        name: data.name,
        brand: data.brand || '',
        description: data.description || '',
        price: data.price.toString(),
        stock: data.stock.toString(),
        category: data.category,
        image_url: data.image_url || '',
      });
    }
    setFetching(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `products/${profile?.id}/${Date.now()}.jpg`;
      
      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      setForm({ ...form, image_url: publicUrl });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      Alert.alert('Datos Incompletos', 'Nombre, Precio y Stock son obligatorios.');
      return;
    }

    setLoading(true);
    const productData = {
      name: form.name,
      brand: form.brand,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category,
      image_url: form.image_url,
      vendor_id: profile?.id,
    };

    try {
      const { error } = id 
        ? await supabase.from('products').update(productData).eq('id', id)
        : await supabase.from('products').insert(productData);

      if (error) throw error;
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <View className="flex-1 justify-center bg-vendorBackground"><ActivityIndicator color="#1D4ED8" /></View>;

  return (
    <ScrollView 
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-vendorBackground"
    >
      <View className="p-6 pb-20">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center">
          <ChevronLeft size={20} color="#1D4ED8" />
          <Text className="text-vendorPrimary font-black uppercase text-xs ml-1">Volver al Inventario</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-black text-vendorSecondary uppercase tracking-tighter mb-8">
          {id ? 'Editar Material' : 'Nuevo Material'}
        </Text>

        <TouchableOpacity 
          onPress={pickImage}
          className="bg-white w-full h-56 rounded-ferretero border-2 border-dashed border-gray-300 items-center justify-center mb-8 overflow-hidden shadow-sm"
        >
          {form.image_url ? (
            <Image source={{ uri: form.image_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Camera size={40} color="#94a3b8" />
              <Text className="text-gray-400 font-black uppercase text-[10px] mt-2 tracking-widest">Añadir Foto Técnica</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="space-y-6">
          <View className="mb-4">
            <Text className="text-vendorSecondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Nombre Comercial *</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-bold text-vendorSecondary"
              placeholder="Ej: Cemento Gris 50kg"
              value={form.name}
              onChangeText={(t) => setForm({...form, name: t})}
            />
          </View>

          <View className="mb-4">
            <Text className="text-vendorSecondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Marca / Fabricante</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-bold text-vendorSecondary"
              placeholder="Ej: Argos, Holcim"
              value={form.brand}
              onChangeText={(t) => setForm({...form, brand: t})}
            />
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="w-[48%]">
              <Text className="text-vendorSecondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Precio Obra *</Text>
              <TextInput
                className="bg-white p-4 rounded-ferretero border border-gray-200 font-black text-vendorPrimary"
                placeholder="0"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(t) => setForm({...form, price: t})}
              />
            </View>
            <View className="w-[48%]">
              <Text className="text-vendorSecondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Stock Inicial *</Text>
              <TextInput
                className="bg-white p-4 rounded-ferretero border border-gray-200 font-black text-vendorSecondary"
                placeholder="0"
                keyboardType="numeric"
                value={form.stock}
                onChangeText={(t) => setForm({...form, stock: t})}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-vendorSecondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Especificaciones Técnicas</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-medium text-secondary h-32"
              placeholder="Detalles técnicos, usos, rendimiento..."
              multiline
              value={form.description}
              onChangeText={(t) => setForm({...form, description: t})}
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="bg-vendorPrimary h-[64px] rounded-ferretero items-center justify-center flex-row shadow-xl shadow-blue-500/30"
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Save size={20} color="white" />
                <Text className="text-white font-black text-xl ml-4 uppercase tracking-tighter">
                  {id ? 'Actualizar en Catálogo' : 'Publicar en Catálogo'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
