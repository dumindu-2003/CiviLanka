import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Bulletin {
  id: string;
  tag: string;
  lavender?: boolean;
  time: string;
  title: string;
  body: string;
  refIcon: IconName;
  refColor?: string;
  refLabel: string;
  download?: boolean; // true = "View" button, false = chevron button
}

// Demo data. Replace with an API call (newsService) when the backend is ready.
const FEATURED = {
  date: '15 SEP 2026',
  title: 'Revised Digital NIC & Vital Records Verification Guidelines',
  body: 'New protocol mandates bi-annual credential verification for Divisional Registrars and Village Officers handling online certificate issuance.',
  ref: 'RG/2026/08',
  readTime: '4 min read',
};

const BULLETINS: Bulletin[] = [
  {
    id: '1',
    tag: 'PUBLIC NOTICE',
    time: 'Yesterday',
    title: 'Online Marriage Registration Processing Timelines Updated',
    body: 'Standard processing time for verified submissions reduced to 48 working hours across all District Secretariats.',
    refIcon: 'pricetag-outline',
    refLabel: 'Notice Ref: SL-PR-992',
  },
  {
    id: '2',
    tag: 'GAZETTE EXTRAORDINARY',
    time: '3 days ago',
    title: 'Gazette No. 2410/18: Birth Registration Act Amendments',
    body: 'Official enactment of digital birth certificate issuance and remote informant identification guidelines.',
    refIcon: 'newspaper-outline',
    refColor: colors.red,
    refLabel: 'Gazette No. 2410/18 • PDF Available',
    download: true,
  },
  {
    id: '3',
    tag: 'SYSTEM UPDATE',
    lavender: true,
    time: '5 days ago',
    title: 'Maintenance & System Upgrade Scheduled for Sept 20',
    body: 'The central Document Tracker portal will undergo scheduled maintenance from 22:00 to 02:00 IST.',
    refIcon: 'construct-outline',
    refLabel: 'Technical Bulletin v2.2',
  },
  {
    id: '4',
    tag: 'CIRCULAR',
    time: '1 week ago',
    title: 'Authorized Sign-Off Requirements for Village Officers',
    body: 'Mandatory requirement to attach official deployment credentials for Form submission.',
    refIcon: 'document-outline',
    refLabel: 'Circular: VO-2026-04',
  },
];

const soon = (what: string) => Alert.alert(what, 'This screen is not available yet.');

function BulletinCard({ item }: { item: Bulletin }) {
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={[styles.tag, item.lavender && styles.tagLavender]}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color={colors.muted} />
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.body}</Text>

      <View style={[styles.rowBetween, { marginTop: 16 }]}>
        <View style={styles.refRow}>
          <Ionicons name={item.refIcon} size={13} color={item.refColor ?? colors.muted} />
          <Text style={styles.refText} numberOfLines={1}>
            {item.refLabel}
          </Text>
        </View>
        {item.download ? (
          <Pressable onPress={() => soon(item.title)} style={styles.viewBtn} accessibilityRole="button">
            <Ionicons name="download-outline" size={13} color={colors.text} />
            <Text style={styles.viewText}>View</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => soon(item.title)} style={styles.chevBtn} accessibilityRole="button">
            <Ionicons name="chevron-forward" size={14} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function NewsScreen() {
  const nav = useNavigation<any>();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [pinned, setPinned] = useState(false);

  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      BULLETINS.filter(
        (b) => !q || `${b.title} ${b.body} ${b.tag} ${b.refLabel}`.toLowerCase().includes(q),
      ),
    [q],
  );

  const showFeatured = !q || `${FEATURED.title} ${FEATURED.body}`.toLowerCase().includes(q);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="business-outline" size={22} color={colors.text} />
            <Text style={styles.headerTitle}>News</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => searchRef.current?.focus()} hitSlop={8} accessibilityLabel="Search">
              <Ionicons name="search" size={20} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => nav.navigate('Profile')} style={styles.avatar} accessibilityLabel="Profile">
              <Ionicons name="person" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info strip */}
        <View style={styles.strip}>
          <Ionicons name="checkmark-circle-outline" size={12} color={colors.text} />
          <Text style={styles.stripText} numberOfLines={1} ellipsizeMode="clip">
            Official Government Updates • Dept. of Registrar General & Public Records
          </Text>
        </View>

        {/* Search */}
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            ref={searchRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search news, gazettes, circulars..."
            placeholderTextColor="#9A9A9A"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={16} color="#B0B0B0" />
            </Pressable>
          ) : null}
        </View>

        {/* Featured notice */}
        {showFeatured ? (
          <View style={[styles.card, styles.featured]}>
            <View style={styles.rowBetween}>
              <View style={styles.importantRow}>
                <View style={styles.redDot} />
                <Text style={styles.important}>IMPORTANT NOTICE • {FEATURED.date}</Text>
              </View>
              <Pressable onPress={() => setPinned((p) => !p)} hitSlop={8} accessibilityLabel="Pin notice">
                <Ionicons name={pinned ? 'pin' : 'pin-outline'} size={16} color={pinned ? colors.navy : '#9A9A9A'} />
              </Pressable>
            </View>

            <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
            <Text style={styles.featuredBody}>{FEATURED.body}</Text>

            <View style={styles.featuredFoot}>
              <Text style={styles.footMeta}>
                {FEATURED.ref} • {FEATURED.readTime}
              </Text>
              <Pressable onPress={() => soon('Gazette')} style={styles.readRow} accessibilityRole="button">
                <Text style={styles.readText}>Read Gazette</Text>
                <Ionicons name="arrow-forward" size={11} color={colors.text} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Recent bulletins */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <Text style={styles.sectionTitle}>Recent Bulletins</Text>
            <View style={styles.count}>
              <Text style={styles.countText}>{visible.length}</Text>
            </View>
          </View>
          <View style={styles.liveRow}>
            <Ionicons name="sync-outline" size={12} color={colors.text} />
            <Text style={styles.liveText}>Live Feed</Text>
          </View>
        </View>

        {visible.length === 0 ? <Text style={styles.empty}>No results found.</Text> : null}
        {visible.map((b) => (
          <BulletinCard key={b.id} item={b} />
        ))}

        {/* Archive */}
        <Pressable onPress={() => soon('Gazette Archive')} style={styles.archive} accessibilityRole="button">
          <Ionicons name="archive-outline" size={16} color={colors.text} />
          <Text style={styles.archiveText}>View Gazette Archive (2020 - 2026)</Text>
        </Pressable>

        <Text style={styles.version}>National Registry Information System • Version 4.8.2</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },

  // header
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // strip + search
  strip: {
    height: 25,
    borderRadius: 8,
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  stripText: { flex: 1, fontSize: 9, fontWeight: '500', color: colors.text },
  search: {
    marginTop: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: 0 },

  // cards
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // featured
  featured: { marginTop: 8, overflow: 'hidden', paddingBottom: 0 },
  importantRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  important: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.5, color: colors.red },
  featuredTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.text, marginTop: 8 },
  featuredBody: { fontSize: 13, lineHeight: 22, color: '#555555', marginTop: 4 },
  featuredFoot: {
    marginTop: 14,
    marginHorizontal: -10,
    marginBottom: 6,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  footMeta: { fontSize: 10, color: colors.muted },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  readText: { fontSize: 10, fontWeight: '700', color: colors.text },

  // section row
  sectionRow: { marginTop: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: colors.text },
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 10, color: colors.muted },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  liveText: { fontSize: 10, fontWeight: '700', color: colors.text },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 12, marginVertical: 24 },

  // bulletin card
  tag: { height: 16, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.chip, justifyContent: 'center' },
  tagLavender: { backgroundColor: '#E3E1EC' },
  tagText: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.5, color: '#444444' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  time: { fontSize: 10, color: colors.muted },
  cardTitle: { fontSize: 13, lineHeight: 18, fontWeight: '700', color: colors.text, marginTop: 6 },
  cardBody: { fontSize: 12, lineHeight: 21, color: '#555555', marginTop: 2 },
  refRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 8 },
  refText: { flexShrink: 1, fontSize: 10, fontWeight: '500', color: colors.muted },
  chevBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewText: { fontSize: 11, fontWeight: '600', color: colors.text },

  // archive + footer
  archive: {
    marginTop: 8,
    height: 45,
    borderRadius: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  archiveText: { fontSize: 13, fontWeight: '500', color: colors.text },
  version: { textAlign: 'center', fontSize: 9, letterSpacing: 0.3, color: colors.muted, marginTop: 12 },
});