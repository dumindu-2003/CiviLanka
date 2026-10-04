import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Filter = 'All' | 'Unread' | 'Applications' | 'System';

interface NotificationItem {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  time: string;
  kind: 'application' | 'system';
  read: boolean;
}

const FILTERS: Filter[] = ['All', 'Unread', 'Applications', 'System'];

// Demo data. Replace with an API call (notificationService) when the backend is ready.
const INITIAL: NotificationItem[] = [
  {
    id: '1',
    icon: 'notifications-outline',
    title: 'Application Approved',
    body: 'Your birth certificate application (APP001) has been approved.',
    time: '2 hours ago',
    kind: 'application',
    read: false,
  },
  {
    id: '2',
    icon: 'document-text-outline',
    title: 'New Application Submitted',
    body: 'A new marriage certificate application has been submitted for review.',
    time: '5 hours ago',
    kind: 'application',
    read: false,
  },
  {
    id: '3',
    icon: 'person-outline',
    title: 'Profile Updated',
    body: 'Your profile information has been successfully updated.',
    time: 'Yesterday',
    kind: 'system',
    read: true,
  },
  {
    id: '4',
    icon: 'warning-outline',
    title: 'Pending Approval',
    body: 'You have 3 applications pending approval. Please review them.',
    time: '2 days ago',
    kind: 'application',
    read: true,
  },
];

const REVEAL = 68; // width of the DELETE / READ panels
const THRESHOLD = 90; // drag distance that triggers the action

// Swipe left = delete, swipe right = mark as read
function SwipeRow({
  children,
  onDelete,
  onRead,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  onRead: () => void;
}) {
  const x = useRef(new Animated.Value(0)).current;
  const cb = useRef({ onDelete, onRead });
  cb.current = { onDelete, onRead };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => x.setValue(Math.max(-140, Math.min(140, g.dx))),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -THRESHOLD) {
          Animated.timing(x, { toValue: -500, duration: 180, useNativeDriver: true }).start(() => cb.current.onDelete());
        } else {
          if (g.dx > THRESHOLD) cb.current.onRead();
          Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const deleteOpacity = x.interpolate({ inputRange: [-REVEAL, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const readOpacity = x.interpolate({ inputRange: [0, REVEAL], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.swipeWrap}>
      <Animated.View style={[styles.panel, styles.panelRead, { opacity: readOpacity }]}>
        <Ionicons name="checkmark-done" size={16} color={colors.white} />
        <Text style={styles.panelText}>READ</Text>
      </Animated.View>
      <Animated.View style={[styles.panel, styles.panelDelete, { opacity: deleteOpacity }]}>
        <Ionicons name="trash-outline" size={16} color={colors.white} />
        <Text style={styles.panelText}>DELETE</Text>
      </Animated.View>

      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

export default function NotificationScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>('All');

  const unreadCount = items.filter((i) => !i.read).length;

  const visible = useMemo(
    () =>
      items.filter((i) => {
        if (filter === 'Unread') return !i.read;
        if (filter === 'Applications') return i.kind === 'application';
        if (filter === 'System') return i.kind === 'system';
        return true;
      }),
    [items, filter],
  );

  const markRead = (id: string) => setItems((list) => list.map((i) => (i.id === id ? { ...i, read: true } : i)));
  const remove = (id: string) => setItems((list) => list.filter((i) => i.id !== id));
  const markAll = () => setItems((list) => list.map((i) => ({ ...i, read: true })));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      {/* App bar */}
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.navigate('Home')} style={styles.backBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.appBarTitle}>Notifications</Text>
          <View style={styles.appBarRight}>
            <Pressable onPress={markAll} hitSlop={8} accessibilityRole="button">
              <Text style={styles.markAll}>Mark all as read</Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate('Profile')} style={styles.avatar} accessibilityLabel="Profile">
              <Ionicons name="person" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter chips */}
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: f === filter }}
              style={[styles.chip, f === filter && styles.chipActive]}
            >
              <Text style={styles.chipText}>{f}</Text>
              {f === 'Unread' ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        {/* Hint */}
        <View style={styles.hint}>
          <Ionicons name="swap-horizontal" size={12} color={colors.navy} />
          <Text style={styles.hintText}>Swipe left to delete, swipe right to mark as read</Text>
        </View>

        {/* List */}
        {visible.length === 0 ? <Text style={styles.empty}>No notifications.</Text> : null}
        {visible.map((n) => (
          <SwipeRow key={n.id} onDelete={() => remove(n.id)} onRead={() => markRead(n.id)}>
            <Pressable onPress={() => markRead(n.id)} style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name={n.icon} size={16} color={colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{n.title}</Text>
                <Text style={styles.body}>{n.body}</Text>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={12} color={colors.navy} />
                  <Text style={styles.time}>{n.time}</Text>
                </View>
              </View>
              {!n.read ? <View style={styles.dot} /> : null}
            </Pressable>
          </SwipeRow>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Ionicons name="checkmark-done" size={16} color={colors.navy} />
          </View>
          <Text style={styles.footerText}>You're all caught up on older notifications.</Text>
          <Pressable onPress={() => Alert.alert('Archive', 'This screen is not available yet.')} style={styles.archiveBtn}>
            <Text style={styles.archiveText}>View archive</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },

  // app bar
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 16, fontWeight: '600' },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  markAll: { color: colors.white, fontSize: 11 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // chips
  chips: { flexDirection: 'row', gap: 5 },
  chip: {
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
  },
  // remove this line to get the exact Figma look (all chips identical)
  chipActive: { borderBottomColor: colors.amber },
  chipText: { color: colors.white, fontSize: 11 },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 9 },

  // hint
  hint: {
    marginTop: 12,
    marginBottom: 12,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  hintText: { fontSize: 10, color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 12, marginVertical: 24 },

  // swipe
  swipeWrap: { marginBottom: 8 },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: REVEAL,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  panelRead: { left: 0, backgroundColor: colors.navy },
  panelDelete: { right: 0, backgroundColor: colors.red },
  panelText: { color: colors.white, fontSize: 8, letterSpacing: 0.6 },

  // card
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13, lineHeight: 20, fontWeight: '500', color: colors.text, paddingRight: 14 },
  body: { fontSize: 12, lineHeight: 19, color: colors.text },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  time: { fontSize: 11, color: colors.muted },
  dot: { position: 'absolute', top: 20, right: 16, width: 6, height: 6, borderRadius: 3, backgroundColor: '#000' },

  // footer
  footer: { alignItems: 'center', marginTop: 30 },
  footerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { fontSize: 11, color: colors.muted, marginTop: 10 },
  archiveBtn: { marginTop: 4, height: 20, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.navy, justifyContent: 'center' },
  archiveText: { color: colors.white, fontSize: 11 },
});