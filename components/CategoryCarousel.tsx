import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
}

interface CategoryCarouselProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export function CategoryCarousel({ onSelectCategory, selectedCategory }: CategoryCarouselProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  return (
    <View className="py-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category.name)}
            className={`mr-3 px-6 py-2 rounded-full border ${
              selectedCategory === category.name
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`font-semibold ${
                selectedCategory === category.name ? 'text-white' : 'text-gray-600'
              }`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
