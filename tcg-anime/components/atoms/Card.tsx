import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'highlighted';
}

export const Card = ({
                       children,
                       onPress,
                       style,
                       variant = 'default'
                     }: CardProps) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
      <Component
          style={[
            styles.card,
            variant === 'highlighted' && styles.cardHighlighted,
            style
          ]}
          onPress={onPress}
      >
        {children}
      </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a5c',
  },
  cardHighlighted: {
    backgroundColor: 'rgba(224, 180, 34, 0.1)',
    borderColor: 'rgba(224, 180, 34, 0.3)',
  },
});