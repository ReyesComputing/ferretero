import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, profile } = useAuthStore();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile) {
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
