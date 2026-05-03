import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const { setSession, setProfile, setLoading } = useAuthStore();

  const fetchProfile = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Fallback: si el trigger no creó el perfil, lo creamos desde el cliente
    // Requiere política RLS: INSERT WITH CHECK (auth.uid() = id)
    if (!data && user) {
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email ?? '',
          name: user.user_metadata?.name ?? 'Usuario',
          role: user.user_metadata?.role ?? 'buyer',
        })
        .select()
        .single();
      if (!insertError) data = created;
    }
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(buyer_tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(vendor_tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
