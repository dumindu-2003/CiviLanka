import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { portal } from '../theme/portal';

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.24),
        },
      ]}
    >
      <Ionicons name="document-text" size={Math.round(size * 0.56)} color={portal.navy} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: portal.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
