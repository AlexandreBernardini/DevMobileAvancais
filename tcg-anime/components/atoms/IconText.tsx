import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IconTextProps {
  icon: string;
  title: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
}

export const IconText = ({
                           icon,
                           title,
                           subtitle,
                           size = 'medium'
                         }: IconTextProps) => {
  const iconSize = size === 'small' ? 20 : size === 'large' ? 48 : 32;
  const titleSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
      <View style={styles.container}>
        <Text style={[styles.icon, { fontSize: iconSize }]}>
          {icon}
        </Text>
        <Text style={[styles.title, { fontSize: titleSize }]}>
          {title}
        </Text>
        {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#b0b0c0',
    textAlign: 'center',
  },
});