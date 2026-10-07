import React, { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface Slide {
  id: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={slide.image} style={styles.image} resizeMode="cover" />
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark-outline" size={11} color={colors.navy} />
          <Text style={styles.badgeText}>Authorized Access</Text>
        </View>
      </View>

      {/* navy edge bar + arrows */}
      <View style={styles.bar} />
      <Pressable onPress={prev} accessibilityRole="button" accessibilityLabel="Previous slide" style={styles.prev}>
        <Ionicons name="chevron-back" size={14} color={colors.white} />
      </Pressable>
      <Pressable onPress={next} accessibilityRole="button" accessibilityLabel="Next slide" style={styles.next}>
        <Ionicons name="chevron-forward" size={14} color={colors.white} />
      </Pressable>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingBottom: 8,
  },
  imageWrap: {
    marginTop: 15,
    marginLeft: 22,
    marginRight: 25,
    height: 164,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.soft,
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: { fontSize: 10, color: colors.muted },

  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 22,
    height: 179,
    borderRadius: 11,
    backgroundColor: colors.navy,
  },
  prev: {
    position: 'absolute',
    left: 0,
    top: 82,
    width: 34,
    height: 30,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  next: {
    position: 'absolute',
    right: 2,
    top: 82,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textWrap: { paddingHorizontal: 16, marginTop: 16 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22, color: colors.text },
  body: { fontSize: 13, lineHeight: 18, color: colors.text, marginTop: 6 },

  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.navy },
  dotActive: { width: 22 },
});