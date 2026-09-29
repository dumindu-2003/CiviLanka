import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { TextField } from './TextField';
import { AppButton } from './AppButton';
import type { SignOffCredentials } from '../types/auth';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: (c: SignOffCredentials) => void;
}

export function AuthorizeSignOffModal({ visible, title = 'Authorizing Officer Verification', onCancel, onConfirm }: Props) {
  const [officerUserName, setUser] = useState('');
  const [authorizingServiceNo, setSvc] = useState('');
  const [officerPassword, setPwd] = useState('');

  const submit = () => {
    onConfirm({ officerUserName, authorizingServiceNo, officerPassword });
    setPwd(''); // do not keep the password in state
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>Digital sign-off protocol</Text>
          <TextField label="Authorizing Service No" value={authorizingServiceNo} onChangeText={setSvc} />
          <TextField label="Officer User Name" value={officerUserName} onChangeText={setUser} autoCapitalize="none" />
          <TextField label="Officer Password" value={officerPassword} onChangeText={setPwd} secureTextEntry />
          <AppButton
            title="Authorize & Submit"
            onPress={submit}
            disabled={!officerUserName || !authorizingServiceNo || !officerPassword}
          />
          <AppButton title="Cancel" variant="outline" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 12 },
});
