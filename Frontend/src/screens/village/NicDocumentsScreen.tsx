import React, { useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { rememberNicFiles, saveNicFormDraft } from '../../services/nicFormSync';
import { colors } from '../../theme/colors';

type DocKey = 'birth' | 'address' | 'photo' | 'previous';

interface PickedFile {
  name: string;
  uri: string;
  size?: number;
}

const MAX_BYTES = 5 * 1024 * 1024;
const REQUIRED: DocKey[] = ['birth', 'address', 'photo'];

const EMPTY: Partial<Record<DocKey, PickedFile>> = {};
let savedDraft: Partial<Record<DocKey, PickedFile>> = {};

export function readNicDocumentDraft() {
  return savedDraft;
}

export function clearNicDocumentDraft() {
  savedDraft = {};
}

function fileError(name: string, mime: string | undefined, size: number | undefined, photo: boolean) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const type = (mime ?? '').toLowerCase();
  const image = type.startsWith('image/') || ext === 'jpg' || ext === 'jpeg' || ext === 'png';
  const pdf = type === 'application/pdf' || ext === 'pdf';
  if (photo ? !image : !(pdf || ext === 'jpg' || ext === 'jpeg' || type === 'image/jpeg')) {
    return photo ? 'Use a JPG or PNG photo.' : 'Use a PDF or JPG up to 5MB.';
  }
  if (size != null && size > MAX_BYTES) return 'The file must be 5MB or smaller.';
  return null;
}

export default function NicDocumentsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [files, setFiles] = useState<Partial<Record<DocKey, PickedFile>>>(savedDraft ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<DocKey, string>>>({});
  const saving = useRef(false);

  const keep = (key: DocKey, file: PickedFile) => {
    setFiles((current) => {
      const next = { ...current, [key]: file };
      savedDraft = next;
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const reject = (key: DocKey, message: string) => {
    setErrors((current) => ({ ...current, [key]: message }));
  };

  const pickDocument = async (key: DocKey) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const name = asset.fileName ?? 'document.jpg';
    const message = fileError(name, asset.mimeType, asset.fileSize, false);
    if (message) {
      reject(key, message);
      return;
    }
    keep(key, { name, uri: asset.uri, size: asset.fileSize });
  };

  const pickPhoto = async (camera: boolean) => {
    if (camera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera needed', 'Allow camera access to take the passport photo.');
        return;
      }
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const name = asset.fileName ?? 'passport-photo.jpg';
    const message = fileError(name, asset.mimeType, asset.fileSize, true);
    if (message) {
      reject('photo', message);
      return;
    }
    keep('photo', { name, uri: asset.uri, size: asset.fileSize });
  };

  const choosePhoto = () => {
    Alert.alert('Passport size photo', 'Take a new photo or upload one.', [
      { text: 'Take Photo', onPress: () => pickPhoto(true) },
      { text: 'Upload', onPress: () => pickPhoto(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const review = async () => {
    const next: Partial<Record<DocKey, string>> = {};
    for (const key of REQUIRED) {
      if (!files[key]) next[key] = 'This document is required.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      Alert.alert('Check the documents', 'Birth certificate, address proof, and the passport photo are required.');
      return;
    }
    if (saving.current) return;
    saving.current = true;
    savedDraft = files;
    rememberNicFiles(files);
    try {
      await saveNicFormDraft({ includeDocuments: true });
      nav.navigate('NicDeclaration');
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : 'The documents were not saved.');
    } finally {
      saving.current = false;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.mark} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.title}>Biometrics And Photo Upload</Text>
          <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Profile' })} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.step}>STEP 3 OF 4: SUPPORTING DOCUMENTS</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>75%</Text>
          </View>
        </View>
        <View style={styles.track}>
          <View style={styles.trackOn} />
          <View style={styles.trackOn} />
          <View style={styles.trackOn} />
          <View style={styles.trackOff} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>3. Attach Supporting Documents</Text>
          <Ionicons name="document-text-outline" size={16} color={colors.navy} />
        </View>

        <DocCard
          title="Birth Certificate Copy"
          detail="Original scan or certified copy. JPG up to 5MB"
          required
          file={files.birth}
          error={errors.birth}
          onPress={() => pickDocument('birth')}
        />
        <DocCard
          title="Proof of Address"
          detail="Utility bill or Grama Niladhari certificate (< 3 months), JPG up to 5MB"
          required
          file={files.address}
          error={errors.address}
          onPress={() => pickDocument('address')}
        />
        <View style={[styles.card, errors.photo ? styles.cardBad : null]}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Passport Size Photo</Text>
            <Badge required />
          </View>
          <Text style={styles.detail}>ICAO standard. 35×45mm white background</Text>
          <View style={styles.photoRow}>
            <View style={styles.photoBox}>
              {files.photo ? (
                <Image source={{ uri: files.photo.uri }} style={styles.photo} />
              ) : (
                <Ionicons name="person-outline" size={28} color={colors.navy} />
              )}
            </View>
            <Text style={styles.detail}>Dimensions: 35 × 45 mm. Clear frontal view, neutral face, eyes open</Text>
          </View>
          {files.photo ? <Text style={styles.fileName}>{files.photo.name}</Text> : null}
          {errors.photo ? <Text style={styles.error}>{errors.photo}</Text> : null}
          <UploadButton icon="camera-outline" label={files.photo ? 'Replace Photo' : 'Take Photo / Upload'} onPress={choosePhoto} />
        </View>
        <DocCard
          title="Previous NIC Copy"
          detail="Required if renewal or re-issue"
          file={files.previous}
          error={errors.previous}
          onPress={() => pickDocument('previous')}
        />

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={colors.navy} />
          <Text style={styles.noteText}>All physical documents must be presented during biometric enrollment.</Text>
        </View>

        <Pressable onPress={review} accessibilityRole="button" style={styles.reviewBtn}>
          <Text style={styles.reviewText}>Review & Verify</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </Pressable>
        <Pressable onPress={() => nav.goBack()} accessibilityRole="button" style={styles.backBtn}>
          <Ionicons name="arrow-back" size={16} color={colors.navy} />
          <Text style={styles.backText}>Back to Contact Details</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Badge({ required }: { required?: boolean }) {
  return (
    <View style={[styles.badge, required ? styles.badgeRequired : styles.badgeOptional]}>
      <Text style={[styles.badgeText, required ? styles.badgeTextRequired : styles.badgeTextOptional]}>
        {required ? 'Required' : 'Optional'}
      </Text>
    </View>
  );
}

function UploadButton({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.uploadBtn}>
      <Ionicons name={icon} size={16} color={colors.white} />
      <Text style={styles.uploadText}>{label}</Text>
    </Pressable>
  );
}

function DocCard({
  title,
  detail,
  required,
  file,
  error,
  onPress,
}: {
  title: string;
  detail: string;
  required?: boolean;
  file?: PickedFile;
  error?: string;
  onPress: () => void;
}) {
  return (
    <View style={[styles.card, error ? styles.cardBad : null]}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Badge required={required} />
      </View>
      <Text style={styles.detail}>{detail}</Text>
      {file ? <Text style={styles.fileName}>{file.name}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <UploadButton icon="cloud-upload-outline" label={file ? 'Replace File' : 'Upload File'} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.navy, paddingBottom: 16 },
  appBar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  mark: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '700' },
  avatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, gap: 8 },
  step: { flex: 1, color: '#D5DCE8', fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  pill: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  track: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginTop: 10 },
  trackOn: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.white },
  trackOff: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' },

  content: { padding: 16, paddingBottom: 28, gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 8 },
  cardBad: { borderWidth: 1, borderColor: colors.red },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  detail: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.muted },
  fileName: { fontSize: 12, fontWeight: '600', color: colors.navy },
  error: { color: colors.red, fontSize: 12 },

  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeRequired: { backgroundColor: '#FDECEC' },
  badgeOptional: { backgroundColor: '#F1F2F4' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextRequired: { color: colors.red },
  badgeTextOptional: { color: colors.muted },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photoBox: {
    width: 64, height: 72, borderRadius: 12, backgroundColor: '#F2F3F5',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  photo: { width: 64, height: 72 },

  uploadBtn: {
    height: 42, borderRadius: 10, backgroundColor: colors.navy, marginTop: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  uploadText: { color: colors.white, fontSize: 14, fontWeight: '600' },

  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: 12, padding: 12 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.muted },

  reviewBtn: {
    height: 48, borderRadius: 10, backgroundColor: colors.navy, marginTop: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  reviewText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  backBtn: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  backText: { color: colors.navy, fontSize: 15, fontWeight: '700' },
});
