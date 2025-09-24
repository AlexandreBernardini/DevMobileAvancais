
import { DeckBuilder } from '../../components/pages/DeckBuilder';
import React from 'react';
import { View } from 'react-native';

export default function DeckBuilderScreen() {
  return (
    <View style={{ flex:1 }}>
      <DeckBuilder />
    </View>
  );
}