import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Package, Construction, PaintBucket, Droplets, Zap, Layers, Map, Grid } from 'lucide-react-native';

const CATEGORIES = [
  { id: '', name: 'Todo', icon: Package },
  { id: 'estructura', name: 'Estructura', icon: Construction },
  { id: 'acabados', name: 'Acabados', icon: PaintBucket },
  { id: 'cubiertas', name: 'Cubiertas', icon: Layers },
  { id: 'hidrosanitarios', name: 'Plomería', icon: Droplets },
  { id: 'electricos', name: 'Eléctricos', icon: Zap },
  { id: 'geotextiles', name: 'Geosintéticos', icon: Map },
  { id: 'drenes', name: 'Drenaje', icon: Grid },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryCarousel = ({ selected, onSelect }: Props) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="py-4"
      contentContainerStyle={{ paddingHorizontal: 24 }}
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = selected === cat.id;
        
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            className={`mr-3 px-5 py-3 rounded-ferretero border-2 flex-row items-center ${
              isActive ? 'bg-secondary border-secondary' : 'bg-white border-gray-100'
            }`}
          >
            <Icon size={16} color={isActive ? '#FF6600' : '#94a3b8'} />
            <Text 
              className={`ml-2 font-black uppercase text-[10px] tracking-widest ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
