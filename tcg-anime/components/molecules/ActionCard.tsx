import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Card } from '../atoms/Card';
import { IconText } from '../atoms/IconText';

const { width } = Dimensions.get('window');

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  highlighted?: boolean;
}

export const ActionCard = ({
                             icon,
                             title,
                             subtitle,
                             onPress,
                             highlighted = false
                           }: ActionCardProps) => (
    <Card
        onPress={onPress}
        variant={highlighted ? 'highlighted' : 'default'}
        style={styles.actionCard}
    >
      <IconText
          icon={icon}
          title={title}
          subtitle={subtitle}
      />
    </Card>
);

const styles = StyleSheet.create({
  actionCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
  },
});