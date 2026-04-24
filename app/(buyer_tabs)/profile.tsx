import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Building, MapPin, Phone, Mail, User, LogOut, Save, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, setProfile, signOut } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    nit: profile?.nit || '',
    address: profile?.address || '',
    phone: profile?.phone || '',
  });

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile?.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProfile({ ...profile, ...form } as any);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    }
    setLoading(false);
  };

  return (
    <ScrollView 
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-background"
    >
      <View className="p-6 pb-20">
        <Text className="text-3xl font-black text-secondary uppercase tracking-tighter mb-8">Mi Perfil</Text>

        {/* Tarjeta de Identidad Industrial */}
        <View className="bg-secondary p-6 rounded-ferretero shadow-lg mb-8">
          <View className="flex-row items-center mb-4">
            <View className="bg-primary p-4 rounded-ferretero">
              <User size={32} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-xl uppercase tracking-tighter">{profile?.name}</Text>
              <Text className="text-blue-300 font-bold uppercase text-[10px] tracking-widest">{profile?.role}</Text>
            </View>
          </View>
          <View className="flex-row items-center bg-white/5 p-3 rounded-ferretero">
            <Mail size={16} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/60 ml-3 font-bold text-xs">{profile?.email}</Text>
          </View>
        </View>

        {/* Formulario de Datos */}
        <View className="space-y-6">
          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Nombre Público</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-bold text-secondary"
              value={form.name}
              onChangeText={(t) => setForm({...form, name: t})}
            />
          </View>

          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">NIT / Cédula Fiscal</Text>
            <View className="bg-white flex-row items-center px-4 h-[52px] rounded-ferretero border border-gray-200">
              <Building size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 font-bold text-secondary" 
                value={form.nit}
                onChangeText={(t) => setForm({...form, nit: t})}
              />
            </View>
          </View>

          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Dirección de Obra</Text>
            <View className="bg-white flex-row items-center px-4 h-[52px] rounded-ferretero border border-gray-200">
              <MapPin size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 font-bold text-secondary" 
                value={form.address}
                onChangeText={(t) => setForm({...form, address: t})}
              />
            </View>
          </View>

          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Teléfono de Contacto</Text>
            <View className="bg-white flex-row items-center px-4 h-[52px] rounded-ferretero border border-gray-200">
              <Phone size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 font-bold text-secondary" 
                value={form.phone}
                onChangeText={(t) => setForm({...form, phone: t})}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading}
            className="bg-primary h-[64px] rounded-ferretero items-center justify-center flex-row shadow-xl shadow-orange-500/30 mt-4"
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Save size={20} color="white" />
                <Text className="text-white font-black text-lg ml-4 uppercase tracking-tighter">Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signOut()}
            className="bg-white border-2 border-red-500 h-[54px] rounded-ferretero items-center justify-center flex-row mt-4"
          >
            <LogOut size={20} color="#EF4444" />
            <Text className="text-red-500 font-black text-sm ml-4 uppercase tracking-tighter">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-10 flex-row items-center bg-gray-100 p-4 rounded-ferretero border border-gray-200">
          <ShieldCheck size={20} color="#94a3b8" />
          <Text className="text-gray-400 font-bold text-[9px] ml-3 uppercase tracking-widest">Protección de datos industriales cifrada</Text>
        </View>
      </View>
    </ScrollView>
  );
}
