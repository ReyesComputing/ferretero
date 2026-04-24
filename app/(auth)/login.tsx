import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Hammer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Datos incompletos', 'Por favor ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Error de acceso', error.message);
      setLoading(false);
    } else {
      router.replace('/');
    }
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
        <View className="flex-1 justify-center py-10">
          {/* Logo y Título Industrial */}
          <View className="items-center mb-12">
            <View className="bg-primary p-4 rounded-ferretero shadow-lg shadow-orange-500/40">
              <Hammer size={48} color="white" />
            </View>
            <Text className="text-4xl font-black text-secondary mt-6 uppercase tracking-tighter">Ferretero</Text>
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Suministros Industriales</Text>
          </View>

          {/* Formulario Sólido */}
          <View className="space-y-5">
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
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary h-[64px] rounded-ferretero items-center justify-center shadow-xl shadow-orange-500/30 mt-4"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-lg uppercase tracking-tighter">Entrar al Sistema</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500 font-bold">¿Nuevo en el gremio? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-primary font-black uppercase">Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
