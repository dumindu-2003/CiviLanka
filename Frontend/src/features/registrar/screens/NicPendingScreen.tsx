import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import Header from '../../../components/common/Header';
import Card from '../../../components/common/Card';
import AppButton from '../../../components/common/AppButton';

const data = [
  { ref: 'NIC-APP-2026-88941', date: '18 Oct 2026', name: 'Saman Kumara Perera', meta: 'Age: 20 • First-time NIC • Colombo 03', officer: 'K. M. Bandara', vo: 'VO-2024-8841', gn: 'GN Div 412 - Colombo Fort North' },
  { ref: 'NIC-APP-2026-88938', date: '18 Oct 2026', name: 'Nadeesha Dilrukshi Senanayake', meta: 'Age: 16 • First-time NIC • Slave Island', officer: 'M. T. Hameed', vo: 'VO-2023-5120', gn: 'GN Div 408 - Kompannaveediya' },
  { ref: 'NIC-APP-2026-88915', date: '17 Oct 2026', name: 'Kasun Dinesh Jayawardena', meta: 'Age: 34 • Replacement • Kollupitiya', officer: 'W. A. Sunil Shantha', vo: 'VO-2021-3319', gn: 'GN Div 415 - Kollupitiya West' },
];

export default function NicPendingScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const list = data.filter(d => (d.name + d.ref + d.vo).toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="NIC Pending Applications" onBack={() => navigation.goBack()} />
      <View style={s.search}>
        <Ionicons name="search" size={15} color={colors.navy} />
        <TextInput style={{ flex: 1, fontSize: 14 }} placeholder="Search App Ref, Citizen Name, or VO No..." value={q} onChangeText={setQ} />
      </View>
      <FlatList data={list} keyExtractor={i => i.ref} contentContainerStyle={{ padding: 16, gap: 16 }}
        ListFooterComponent={<Text style={s.foot}>Showing {list.length} of 18 pending applications in Colombo Fort Secretariat Division</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={s.row}><Text style={s.muted}>{item.ref}</Text><Text style={s.muted}>{item.date}</Text></View>
            <Text style={s.name}>{item.name}</Text><Text style={s.muted}>{item.meta}</Text>
            <View style={s.box}>
              <View style={s.row}><Text style={s.muted}>Officer: {item.officer}</Text><Text style={s.muted}>{item.vo}</Text></View>
              <Text style={s.muted}>{item.gn}</Text>
            </View>
            <AppButton label="Review & Authorize" icon="arrow-forward" style={{ height: 40 }} />
          </Card>)} />
    </View>
  );
}
const s = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginBottom: 0, paddingHorizontal: 12, height: 44, backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: colors.border, borderRadius: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' }, muted: { fontSize: 12, color: colors.muted },
  name: { fontSize: 18, fontWeight: '600', color: colors.text, marginVertical: 6 },
  box: { backgroundColor: colors.soft, borderRadius: 8, padding: 8, gap: 2, marginVertical: 8 },
  foot: { textAlign: 'center', fontSize: 12, color: colors.muted },
});
