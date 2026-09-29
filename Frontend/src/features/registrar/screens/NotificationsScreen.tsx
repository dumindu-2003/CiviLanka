import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import Header from '../../../components/common/Header';
import Card from '../../../components/common/Card';

const items = [
  { t: 'Application Approved', m: 'Your birth certificate application (APP001) has been approved.', w: '2 hours ago', unread: true, i: 'checkmark-circle' },
  { t: 'New Application Submitted', m: 'A new marriage certificate application has been submitted for review.', w: '5 hours ago', unread: true, i: 'document-text' },
  { t: 'Profile Updated', m: 'Your profile information has been successfully updated.', w: 'Yesterday', i: 'person' },
  { t: 'Pending Approval', m: 'You have 3 applications pending approval. Please review them.', w: '2 days ago', i: 'time' },
];

export default function NotificationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Notifications" />
      <FlatList data={items} keyExtractor={i => i.t} contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', gap: 16 }}>
            <View style={s.icon}><Ionicons name={item.i as any} size={16} color={colors.navy} /></View>
            <View style={{ flex: 1 }}>
              <View style={s.row}><Text style={s.t}>{item.t}</Text>{item.unread && <View style={s.dot} />}</View>
              <Text style={s.m}>{item.m}</Text><Text style={s.w}>{item.w}</Text>
            </View>
          </Card>)} />
    </View>
  );
}
const s = StyleSheet.create({
  icon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EEEEEF', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  t: { fontSize: 14, color: colors.text, fontWeight: '600' }, m: { fontSize: 14, color: colors.text, marginVertical: 2 },
  w: { fontSize: 12, color: colors.muted }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.navy },
});
