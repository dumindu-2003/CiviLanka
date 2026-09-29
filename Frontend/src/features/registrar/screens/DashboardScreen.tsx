import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import Header from '../../../components/common/Header';
import Card from '../../../components/common/Card';
import AppButton from '../../../components/common/AppButton';

const stats = [['Pending Approvals', 15, 'Requires review'], ['Approved', 45, 'Synchronized'], ['Rejected', 3, 'Action needed'], ['Total Records', 63, 'Fiscal 2026']];
const filters = ['All', 'Birth', 'Death', 'Marriage'];
const apps = [
  { id: 'APP001', type: 'Birth', name: 'Saman Perera', date: '2026-09-01' },
  { id: 'APP002', type: 'Death', name: 'Nimal Silva', date: '2026-08-28' },
];

export default function DashboardScreen({ navigation }: any) {
  const [f, setF] = useState('All');
  const list = apps.filter(a => f === 'All' || a.type === f);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="District Registrar" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={s.h1}>Welcome, District Registrar</Text>
        <Text style={s.body}>Manage all civil registration records</Text>
        <View style={s.grid}>
          {stats.map(([l, v, n]) => (
            <View key={l as string} style={s.stat}>
              <Text style={s.sl}>{l}</Text><Text style={s.sv}>{v}</Text><Text style={s.sn}>{n}</Text>
            </View>))}
        </View>
        <Text style={s.h3}>Queue Filters</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {filters.map(x => (
            <TouchableOpacity key={x} onPress={() => setF(x)} style={[s.chip, f === x && { backgroundColor: colors.navy }]}>
              <Text style={{ fontSize: 12, color: f === x ? colors.white : colors.muted }}>{x}</Text>
            </TouchableOpacity>))}
        </View>
        <Text style={s.h3}>Applications Queue</Text>
        {list.map(a => (
          <Card key={a.id}>
            <View style={s.row}><Text style={s.sl}>{a.id}  •  {a.type}</Text><Text style={s.sl}>Pending</Text></View>
            <Text style={s.name}>{a.name}</Text><Text style={s.sl}>Submitted {a.date}</Text>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 12 }}>
              <AppButton label="View" style={s.act} />
              <AppButton label="Approve" variant="success" style={s.act} />
              <AppButton label="Reject" variant="danger" style={s.act} />
            </View>
          </Card>))}
        <AppButton label="NIC Requests" icon="card" onPress={() => navigation.navigate('NicPending')} />
        <AppButton label="Generate Report" icon="bar-chart" variant="outline" />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '700', color: colors.text }, body: { fontSize: 14, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '47.5%', backgroundColor: colors.white, borderWidth: 1, borderColor: '#C4C7C7', borderRadius: 8, padding: 16 },
  sl: { fontSize: 12, color: colors.muted }, sn: { fontSize: 10, color: colors.muted }, sv: { fontSize: 36, fontWeight: '700', color: colors.text },
  chip: { backgroundColor: colors.chip, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' }, name: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 8 },
  act: { flex: 1, height: 40 },
});
