import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../../navigation/types';
import { findPerson, type FoundPerson, type RecentSearch } from '../../services/districtService';
import { colors } from '../../theme/colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmtDate = (iso?: string | null) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('T')[0].split('-');
  if (!y || !m || !d) return iso;
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
};

// recent row description = 'Find person: <value> | <name or Not found>'
const parseRecent = (r: RecentSearch) => {
  const [value = '', name = ''] = r.description.replace(/^Find person:\s*/, '').split(' | ');
  return { value: value.trim(), name: name.trim(), found: name.trim() !== 'Not found', date: (r.created_at ?? '').slice(0, 10) };
};

function Detail({ label, value, full }: { label: string; value?: string | null; full?: boolean }) {
  return (
    <View style={[styles.detail, full && { width: '100%' }]}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.detailValue}>{value && value.trim() ? value : '-'}</Text>
    </View>
  );
}

function PersonDetails({ p }: { p: FoundPerson }) {
  if (p.person_type === 'Officer') {
    return (
      <View style={styles.grid}>
        <Detail label="FULL NAME" value={p.full_name} />
        <Detail label="SERVICE NUMBER" value={p.service_number} />
        <Detail label="ROLE" value={p.role_name} />
        <Detail label="UNIT / DIVISION" value={p.unit_name} />
        <Detail label="MOBILE" value={p.phone} full />
      </View>
    );
  }
  return (
    <View style={styles.grid}>
      <Detail label="FULL NAME" value={p.full_name} />
      <Detail label="NIC NUMBER" value={p.nic} />
      <Detail label="DATE OF BIRTH" value={fmtDate(p.date_of_birth)} />
      <Detail label="DOCUMENT TYPE" value="National ID (NIC)" />
      <Detail label="GENDER" value={p.gender} />
      <Detail label="MOBILE" value={p.phone} />
      <Detail label="EMAIL" value={p.email} full />
      <Detail label="ADDRESS" value={p.address} full />
    </View>
  );
}

export default function FindPeopleScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector((s) => s.auth.user);

  const [query, setQuery] = useState('');
  const [person, setPerson] = useState<FoundPerson | null>(null);
  const [searched, setSearched] = useState<string | null>(null); // the value of the last finished search
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load only the recent searches when the screen opens
  useFocusEffect(
    useCallback(() => {
      findPerson()
        .then((r) => setRecent(r.recent))
        .catch(() => undefined);
    }, []),
  );

  const run = async (value: string) => {
    const v = value.trim();
    if (!v) {
      setError('Enter a NIC number or a service number.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      const res = await findPerson(v);
      setPerson(res.person);
      setSearched(v);
      setRecent(res.recent);
    } catch (e: any) {
      setPerson(null);
      setSearched(null);
      setError(e?.message ?? 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleTitle = user?.designation || 'District Registrar';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.backBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            Find People
          </Text>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color={colors.white} />
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.welcome}>Welcome, {roleTitle}</Text>
          <Text style={styles.subtitle}>Find a person in the national registry</Text>

          {/* search card */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.row}>
                <Ionicons name="search" size={16} color={colors.navy} />
                <Text style={styles.cardTitle}>Find Person</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>DIRECT API</Text>
              </View>
            </View>

            <Text style={[styles.caption, { marginTop: 14 }]}>NIC / SERVICE NUMBER</Text>
            <View style={styles.inputBox}>
              <Ionicons name="search" size={16} color={colors.navy} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="e.g. 199012345678 or DR-0001"
                placeholderTextColor="#8A8F98"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => run(query)}
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={() => run(query)}
              disabled={loading}
              accessibilityRole="button"
              style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="search" size={15} color={colors.white} />
                  <Text style={styles.verifyText}>SEARCH</Text>
                </>
              )}
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          {/* result card */}
          {searched !== null && person ? (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={[styles.row, { flex: 1 }]}>
                  <View style={styles.okIcon}>
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>Person Found</Text>
                    <Text style={styles.resultSub}>Official Sri Lanka Registry Match</Text>
                  </View>
                </View>
                <View style={styles.validChip}>
                  <View style={styles.validDot} />
                  <Text style={styles.validText}>{person.person_type}</Text>
                </View>
              </View>

              <View style={styles.detailBox}>
                <PersonDetails p={person} />
              </View>

              <View style={styles.footer}>
                <View style={styles.row}>
                  <Ionicons name="lock-closed-outline" size={11} color={colors.muted} />
                  <Text style={styles.footerText}>Lookup recorded in the audit trail</Text>
                </View>
                <Text style={styles.footerText}>Just now</Text>
              </View>
            </View>
          ) : null}

          {searched !== null && !person ? (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.okIcon, { backgroundColor: colors.red }]}>
                  <Ionicons name="close" size={14} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>No record found</Text>
                  <Text style={styles.resultSub}>Nothing matches “{searched}”. Check the NIC or service number and try again.</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* recent searches */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Showing {recent.length} records</Text>
            </View>
          </View>
          <View style={styles.card}>
            {recent.length === 0 ? <Text style={styles.empty}>No searches yet.</Text> : null}
            {recent.map((r, i) => {
              const x = parseRecent(r);
              return (
                <Pressable
                  key={`${r.created_at}-${i}`}
                  onPress={() => {
                    setQuery(x.value);
                    run(x.value);
                  }}
                  style={[styles.recentItem, i > 0 && styles.recentDivider]}
                  accessibilityRole="button"
                >
                  <View style={styles.recentIcon}>
                    <Ionicons name="person-outline" size={16} color={colors.navy} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentName}>{x.found ? x.name || '-' : 'No record found'}</Text>
                    <Text style={styles.recentSub}>{x.value}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={styles.validChip}>
                      <View style={[styles.validDot, !x.found && { backgroundColor: colors.red }]} />
                      <Text style={styles.validText}>{x.found ? 'Found' : 'Not found'}</Text>
                    </View>
                    <Text style={styles.recentSub}>{x.date}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { padding: 16, paddingBottom: 40, gap: 14 },

  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, color: colors.white, fontSize: 16, fontWeight: '600' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },

  welcome: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.text, marginTop: -8 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  chip: { height: 20, paddingHorizontal: 10, borderRadius: 4, backgroundColor: colors.chip, justifyContent: 'center' },
  chipText: { fontSize: 9, letterSpacing: 0.4, color: colors.muted },

  caption: { fontSize: 9, letterSpacing: 0.6, color: colors.muted },
  inputBox: {
    minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 8, marginTop: 6,
    borderWidth: 1, borderColor: '#E5E8EE', backgroundColor: colors.field, paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: 10 },
  verifyBtn: {
    height: 46, borderRadius: 8, backgroundColor: colors.navy, marginTop: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  verifyText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.6, color: colors.white },
  error: { fontSize: 11.5, color: colors.red, marginTop: 10 },

  okIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  resultSub: { fontSize: 10.5, color: colors.muted, marginTop: 1 },
  validChip: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 18, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.chip },
  validDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.black },
  validText: { fontSize: 10, color: colors.muted },

  detailBox: { marginTop: 14, borderRadius: 10, backgroundColor: colors.soft, padding: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  detail: { width: '50%', paddingRight: 8 },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 3 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  footerText: { fontSize: 10, color: colors.muted },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  empty: { fontSize: 12, color: colors.muted },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  recentDivider: { borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  recentIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontSize: 14, fontWeight: '600', color: colors.text },
  recentSub: { fontSize: 11, color: colors.muted, marginTop: 1 },
});