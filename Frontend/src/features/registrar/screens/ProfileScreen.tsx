import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import Header from '../../../components/common/Header';
import AppButton from '../../../components/common/AppButton';

const sections = [
  { title: 'Personal Information', icon: 'person', rows: [['Full Name', 'Saman Perera'], ['NIC Number', '199012345678'], ['Date of Birth', '1990-05-15'], ['Gender', 'Male']] },
  { title: 'Contact Information', icon: 'call', rows: [['Email', 'saman.perera@gov.lk'], ['Phone', '+94 77 123 4567'], ['Address', 'No. 45, Main Street, Colombo']] },
  { title: 'Employment Information', icon: 'briefcase', rows: [['Employee ID', 'EMP-2024-001'], ['Designation', 'Village Officer'], ['Department', 'Divisional Secretariat'], ['Office Location', 'Kaduwela']] },
];

export default function ProfileScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My Profile" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.hero}>
          <View style={s.avatar}><Ionicons name="person" size={36} color={colors.muted} /></View>
          <Text style={s.name}>Saman Perera</Text>
          <Text style={s.pill}>Village Officer</Text>
          <Text style={s.email}>saman.perera@gov.lk</Text>
        </View>
        {sections.map(sec => (
          <View key={sec.title} style={s.card}>
            <View style={s.head}><Ionicons name={sec.icon as any} size={16} color={colors.white} /><Text style={s.headTxt}>{sec.title}</Text></View>
            {sec.rows.map(([l, v]) => (
              <View key={l} style={s.item}><Text style={s.l}>{l.toUpperCase()}</Text><Text style={s.v}>{v}</Text></View>))}
          </View>))}
        <View style={{ padding: 16 }}>
          <AppButton label="LOGOUT" icon="log-out" onPress={() => navigation.getParent()?.replace('Login')} />
          <Text style={s.ver}>GovDoc Tracker v2.4.1{'\n'}Department of Registrar General</Text>
        </View>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  hero: { backgroundColor: colors.navy, alignItems: 'center', paddingBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.white, fontSize: 18, fontWeight: '600', marginTop: 8 },
  pill: { color: colors.white, backgroundColor: '#FFFFFF33', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, fontSize: 12, marginVertical: 4, overflow: 'hidden' },
  email: { color: colors.white, fontSize: 12 },
  card: { backgroundColor: colors.white, marginHorizontal: 16, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  head: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: colors.navy, padding: 14 },
  headTxt: { color: colors.white, fontSize: 16, fontWeight: '600' },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  l: { fontSize: 11, letterSpacing: 0.55, color: colors.muted }, v: { fontSize: 14, color: colors.text, marginTop: 2 },
  ver: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 16, lineHeight: 16 },
});
