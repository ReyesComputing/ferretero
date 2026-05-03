import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  const { session, profile, loading, signOut } = useAuthStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (session && !profile) {
      const timer = setTimeout(() => setTimedOut(true), 8000);
      return () => clearTimeout(timer);
    }
    setTimedOut(false);
  }, [session, profile]);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile) {
    if (timedOut) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B', textAlign: 'center', marginBottom: 8 }}>
            No se pudo cargar tu perfil
          </Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>
            Es posible que tu cuenta no se haya configurado correctamente.
          </Text>
          <TouchableOpacity
            onPress={signOut}
            style={{ backgroundColor: '#FF6600', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: '900', textTransform: 'uppercase' }}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  if (profile.role === 'vendor') {
    return <Redirect href="/(vendor_tabs)/dashboard" />;
  }

  return <Redirect href="/(buyer_tabs)" />;
}
