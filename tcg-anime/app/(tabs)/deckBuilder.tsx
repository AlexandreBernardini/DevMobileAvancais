
import Icons from '@/components/atoms/Icons';
import Switch from '@/components/atoms/Switch';
import SearchBar from '@/components/molecules/SearchBar';
import { DeckBuilder } from '@/components/pages/deckBuilder';
import React, { useState } from 'react';
import { View, Text } from 'react-native';

export default function DeckBuilderScreen() {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = (value: boolean) => {
    setIsEnabled(value);
  };

  return (
    <View>
      <DeckBuilder />
    </View>
  );
}