import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import Header from '../../../components/common/Header';
import Card from '../../../components/common/Card';
import AppButton from '../../../components/common/AppButton';

const goals = [['70%', 'Faster Turnaround'], ['Real-Time', 'Data Collection'], ['100%', 'Audit & Authority']];

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="GovernReg Digital System" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={s.sub}>
          <Text style={s.eyebrow}>RESTRICTED ACCESS • OFFICIAL PORTAL</Text>
          <Text style={s.h2}>Documentation Tracker</Text>
        </View>
        <Card>
          <Ionicons name="shield-checkmark" size={18} color={colors.navy} />
          <Text style={s.h3}>Real-Time Document Tracking</Text>
          <Text style={s.body}>Automated logging and tracking that drastically cuts operation times while maintaining stringent verification standards.</Text>
        </Card>
        <Card><Text style={s.h3}>Our Vision</Text>
          <Text style={s.body}>To establish a secure, high-integrity governance framework that accelerates public documentation workflows.</Text></Card>
        <Card><Text style={s.h3}>Our Goals</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
            {goals.map(([v, l]) => (
              <View key={l} style={s.metric}><Text style={s.mv}>{v}</Text><Text style={s.ml}>{l}</Text></View>))}
          </View></Card>
        <Card><Text style={s.h3}>Our Mission</Text>
          <Text style={s.body}>Empower authorized officers with intelligent, low-friction tools to track, verify, and approve official records securely in real time.</Text></Card>
        <AppButton label="Registrar Dashboard" icon="grid" onPress={() => navigation.navigate('Dashboard')} />
        <AppButton label="NIC Pending Applications" icon="document-text" variant="outline" onPress={() => navigation.navigate('NicPending')} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  sub: { backgroundColor: colors.soft, borderRadius: 12, padding: 16 },
  eyebrow: { fontSize: 10, letterSpacing: 0.5, color: colors.muted },
  h2: { fontSize: 18, fontWeight: '600', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text, marginVertical: 6 },
  body: { fontSize: 14, lineHeight: 22, color: colors.text },
  metric: { flex: 1, backgroundColor: colors.soft, borderRadius: 8, padding: 10, alignItems: 'center' },
  mv: { fontSize: 20, fontWeight: '700', color: colors.text },
  ml: { fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 2 },
});
