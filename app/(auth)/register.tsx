import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { User, Truck, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'vendor'>('buyer');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Datos incompletos', 'Por favor llena todos los campos obligatorios');
      return;
    }
    setLoading(true);
    
    const { data: { session }, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { name, role } }
    });

    if (signUpError) {
      Alert.alert('Error', signUpError.message);
      setLoading(false);
      return;
    }

    // El trigger handle_new_user debería crear el perfil automáticamente
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
        className="px-8"
      >
        <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-6 flex-row items-center">
          <ChevronLeft size={20} color="#FF6600" />
          <Text className="text-primary font-black uppercase text-xs ml-1 tracking-widest">Volver</Text>
        </TouchableOpacity>

        <Text className="text-4xl font-black text-secondary uppercase tracking-tighter mb-2">Crear Cuenta</Text>
        <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10">Únete a la red de suministros</Text>

        <View className="space-y-5">
          {/* Selector de Rol Industrial */}
          <View className="mb-6">
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-3 ml-1">Tipo de Usuario</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                onPress={() => setRole('buyer')}
                className={`flex-1 p-4 rounded-ferretero border-2 items-center ${role === 'buyer' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}`}
              >
                <User size={24} color={role === 'buyer' ? '#FF6600' : '#94a3b8'} />
                <Text className={`font-black uppercase text-[10px] mt-2 ${role === 'buyer' ? 'text-primary' : 'text-gray-400'}`}>Comprador</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setRole('vendor')}
                className={`flex-1 p-4 rounded-ferretero border-2 items-center ${role === 'vendor' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <Truck size={24} color={role === 'vendor' ? '#1D4ED8' : '#94a3b8'} />
                <Text className={`font-black uppercase text-[10px] mt-2 ${role === 'vendor' ? 'text-blue-600' : 'text-gray-400'}`}>Vendedor</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Nombre Completo</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-bold text-secondary"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Correo Electrónico</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-bold text-secondary"
              placeholder="usuario@obra.com"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-secondary font-black uppercase text-[10px] tracking-widest mb-2 ml-1">Contraseña</Text>
            <TextInput
              className="bg-white p-4 rounded-ferretero border border-gray-200 font-bold text-secondary"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            className={`h-[64px] rounded-ferretero items-center justify-center shadow-xl mt-6 ${role === 'buyer' ? 'bg-primary shadow-orange-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-lg uppercase tracking-tighter">Registrarme en Ferretero</Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="py-10" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
