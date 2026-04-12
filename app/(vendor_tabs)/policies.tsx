import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Percent, User, Tag, Plus, Trash2 } from 'lucide-react-native';

export default function DiscountPoliciesScreen() {
  const { profile } = useAuthStore();
  const [policies, setPolicies] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_email: '',
    category: 'Todas',
    discount: '',
  });

  useEffect(() => {
    fetchPolicies();
    fetchCategories();
  }, [profile]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data) setCategories(['Todas', ...data.map(c => c.name)]);
  };

  const fetchPolicies = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('vendor_discounts')
      .select('*, profiles!vendor_discounts_customer_id_fkey(email, name)')
      .eq('vendor_id', profile.id);

    if (error) console.error(error);
    else setPolicies(data || []);
  };

  const handleAddPolicy = async () => {
    if (!profile) return;
    if (!form.customer_email || !form.discount) {
      Alert.alert('Error', 'Completa el email y el porcentaje');
      return;
    }

    const discountValue = parseFloat(form.discount);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      Alert.alert('Error', 'El porcentaje debe ser un número entre 0 y 100');
      return;
    }

    setLoading(true);
    try {
      // Find customer by email
      const { data: customer, error: custError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', form.customer_email)
        .single();

      if (custError) throw new Error('Cliente no encontrado');

      const { error } = await supabase.from('vendor_discounts').upsert({
        vendor_id: profile.id,
        customer_id: customer.id,
        category: form.category === 'Todas' ? null : form.category,
        discount_percentage: discountValue,
      });

      if (error) throw error;

      Alert.alert('Éxito', 'Política de descuento guardada');
      setForm({ customer_email: '', category: 'Todas', discount: '' });
      fetchPolicies();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    const { error } = await supabase.from('vendor_discounts').delete().eq('id', id);
    if (error) Alert.alert('Error', error.message);
    else fetchPolicies();
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Políticas de Descuento</Text>

      <View className="bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-100">
        <Text className="font-bold text-gray-700 mb-4 text-lg">Nueva Política</Text>

        <View className="flex-row items-center bg-gray-50 p-3 rounded-xl mb-3 border border-gray-100">
          <User size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Email del cliente"
            value={form.customer_email}
            onChangeText={(t) => setForm({ ...form, customer_email: t })}
            autoCapitalize="none"
          />
        </View>

        <View className="flex-row space-x-2 mb-4">
          <View className="flex-1 flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Tag size={20} color="#64748b" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-2">
              <View className="flex-row">
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setForm({...form, category: cat})}
                    className={`mr-2 px-3 py-1 rounded-lg ${form.category === cat ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <Text className={`text-xs ${form.category === cat ? 'text-white' : 'text-gray-600'}`}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="w-24 flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100 ml-2">
            <Percent size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-1 text-gray-800 font-bold"
              placeholder="%"
              keyboardType="numeric"
              value={form.discount}
              onChangeText={(t) => setForm({ ...form, discount: t })}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddPolicy}
          disabled={loading}
          className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-bold ml-2">Guardar Política</Text>
        </TouchableOpacity>
      </View>

      <Text className="font-bold text-gray-700 mb-4 text-lg">Políticas Activas</Text>
      <FlatList
        data={policies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl border border-gray-100 mb-3 flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-bold text-gray-800">{item.profiles?.name || 'Cliente'}</Text>
              <Text className="text-gray-500 text-xs">{item.profiles?.email}</Text>
              <View className="flex-row mt-1">
                <View className="bg-blue-50 px-2 py-0.5 rounded mr-2">
                  <Text className="text-blue-600 text-[10px] font-bold uppercase">{item.category || 'Global'}</Text>
                </View>
                <View className="bg-green-50 px-2 py-0.5 rounded">
                  <Text className="text-green-600 text-[10px] font-bold">-{item.discount_percentage}%</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeletePolicy(item.id)} className="p-2">
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay políticas definidas</Text>}
      />
    </View>
  );
}
