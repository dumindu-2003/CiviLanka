import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import AppButton from '../../../components/common/AppButton';
import Card from '../../../components/common/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [user, setUser] = useState(''); const [svc, setSvc] = useState(''); const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const field = (label: string, icon: any, input: React.ReactNode) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.input}><Ionicons name={icon} size={16} color={colors.navy} />{input}</View>
    </View>
  );
  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 16, paddingTop: 72 }}>
      <View style={s.badge}><Ionicons name="shield-checkmark" size={12} color={colors.amber} />
        <Text style={s.badgeTxt}>GOVERNREG DIGITAL SYSTEM • RESTRICTED ACCESS</Text></View>
      <Text style={s.h1}>Officer Authentication</Text>
      <Text style={s.sub}>Enter your authorized government service credentials to access the document tracking registry.</Text>
      <View style={{ height: 24 }} />
      {field('Government Username', 'person', <TextInput style={s.txt} placeholder="e.g. j.perera" autoCapitalize="none" value={user} onChangeText={setUser} />)}
      {field('Service No', 'card', <TextInput style={s.txt} placeholder="E.G. AG-884210" autoCapitalize="characters" value={svc} onChangeText={setSvc} />)}
      {field('Password', 'lock-closed', <>
        <TextInput style={s.txt} placeholder="Enter secure password" secureTextEntry={!show} value={pw} onChangeText={setPw} />
        <Ionicons name={show ? 'eye-off' : 'eye'} size={18} color={colors.navy} onPress={() => setShow(!show)} /></>)}
      <Text style={s.help}>Need credential assistance? Contact System Administrator</Text>
      <AppButton label="Sign In" icon="arrow-forward" style={{ marginTop: 16 }} onPress={() => navigation.replace('Tabs')} />
      <Card style={{ marginTop: 24 }}>
        <Text style={s.cardTitle}>Official Access Notice & Legal Warning</Text>
        <Text style={s.small}>Accounts cannot be created online. Report to your Divisional Secretariat or AG Office with your official service identification.</Text>
        <Text style={[s.small, { marginTop: 8 }]}>Unauthorized access is prohibited under the Computer Crimes Act No. 24 of 2007 of Sri Lanka.</Text>
      </Card>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F7FA' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.navy, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  badgeTxt: { color: colors.white, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  h1: { fontSize: 28, fontWeight: '600', color: colors.navy, marginTop: 8 },
  sub: { fontSize: 14, color: '#374151', lineHeight: 22, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '500', color: colors.navy, marginBottom: 4 },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 4 },
  txt: { flex: 1, fontSize: 14, color: colors.text },
  help: { fontSize: 12, fontWeight: '500', color: colors.navy },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.navy, marginBottom: 8 },
  small: { fontSize: 12, lineHeight: 20, color: '#374151' },
});
