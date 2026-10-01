import React, { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BrandMark } from '../../components/BrandMark';
import { markOnboardingSeen } from '../../services/onboardingStorage';
import type { RootStackParamList } from '../../navigation/types';
import { portal } from '../../theme/portal';

const SLIDES: {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  kicker: string;
  title: string;
  body: string;
}[] = [
  {
    key: 'track',
    icon: 'documents-outline',
    kicker: 'CIVIL REGISTRATION',
    title: 'Track birth, marriage, and death records',
    body: 'Follow registrations across Sri Lanka from one official portal, with every record status in a single place.',
  },
  {
    key: 'officer',
    icon: 'id-card-outline',
    kicker: 'OFFICIAL ACCESS',
    title: 'Sign in with your service credentials',
    body: 'Use the officer username, NIC or service number, and password issued by your Divisional Secretariat or District Registrar.',
  },
  {
    key: 'secure',
    icon: 'shield-checkmark-outline',
    kicker: 'RESTRICTED SYSTEM',
    title: 'Built for accountable public service',
    body: 'Unauthorized access is prohibited under the Computer Crimes Act No. 24 of 2007. Only issued officer accounts may enter this tracker.',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);
  const [page, setPage] = useState(0);
  const [bodyHeight, setBodyHeight] = useState(0);
  const leaving = useRef(false);
  const last = page === SLIDES.length - 1;

  const finish = async () => {
    if (leaving.current) return;
    leaving.current = true;
    await markOnboardingSeen();
    navigation.replace('Login');
  };

  const goTo = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setPage(index);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next >= 0 && next < SLIDES.length) setPage(next);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: portal.navy }} />
      <View style={styles.header}>
        <BrandMark size={40} />
        <View style={styles.headerText}>
          <Text style={styles.brand}>Civil Registration Tracker</Text>
          <Text style={styles.brandSub}>OFFICIAL PORTAL</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={SLIDES}
        onLayout={(event) => setBodyHeight(event.nativeEvent.layout.height)}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, height: bodyHeight || undefined }]}>
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={34} color={portal.navy} />
              </View>
              <Text style={styles.kicker}>{item.kicker}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View key={slide.key} style={[styles.dot, index === page && styles.dotOn]} />
          ))}
        </View>
        <View style={styles.actions}>
          {last ? <View style={styles.skipSpacer} /> : (
            <Pressable onPress={finish} hitSlop={8} accessibilityRole="button" style={styles.skipBtn}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => (last ? finish() : goTo(page + 1))}
            accessibilityRole="button"
            style={[styles.next, last && styles.nextWide]}
          >
            <Text style={styles.nextText}>{last ? 'Continue to sign in' : 'Next'}</Text>
            <Ionicons name="arrow-forward" size={18} color={portal.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: portal.page },
  header: {
    backgroundColor: portal.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerText: { flex: 1 },
  brand: { color: portal.white, fontSize: 16, fontWeight: '700' },
  brandSub: { color: portal.gold, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginTop: 2 },
  list: { flex: 1 },
  slide: { padding: 16, justifyContent: 'center' },
  card: {
    backgroundColor: portal.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: portal.line,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F8EFCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  kicker: {
    color: portal.goldText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  title: { color: portal.ink, fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 10 },
  body: { color: portal.muted, fontSize: 15, lineHeight: 23 },
  footer: { paddingHorizontal: 16, paddingTop: 8 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D0D5DD' },
  dotOn: { width: 22, backgroundColor: portal.navy },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skipBtn: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 8 },
  skipSpacer: { width: 8 },
  skip: { color: portal.muted, fontSize: 16, fontWeight: '600' },
  next: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: portal.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextWide: { flex: 1 },
  nextText: { color: portal.white, fontSize: 16, fontWeight: '700' },
});
