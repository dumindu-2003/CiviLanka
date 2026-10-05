import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface EnrollForm {
  fullName: string;
  nic: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  language: 'Sinhala' | 'English' | 'Tamil';
  email: string;
  phone: string;
  address: string;
  district: string;
  role: string;
  password: string;
  confirm: string;
  cadreNo: string;
  department: string;
  designation: string;
  workAddress: string;
  govEmail: string;
  officeLine: string;
  declare1: boolean;
  declare2: boolean;
}

export const initialForm: EnrollForm = {
  fullName: '', nic: '', dob: '', gender: 'Male', language: 'Sinhala',
  email: '', phone: '', address: '', district: '',
  role: '', password: '', confirm: '',
  cadreNo: '', department: '', designation: '', workAddress: '', govEmail: '', officeLine: '',
  declare1: false, declare2: false,
};

export type SetFn = <K extends keyof EnrollForm>(key: K, value: EnrollForm[K]) => void;

export const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna',
  'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export const ROLES = ['Village Officer', 'Grama Niladhari', 'Assistant Registrar', 'District Registrar'];

// ---------------- header ----------------
export interface HeaderCfg {
  title: string;
  kicker: string;
  kickerRight?: string;
  eyebrow?: string;
  heading?: string;
  headingRight?: string;
  sub?: string;
  pct: number;
}

export function StepHeader({ cfg, onBack }: { cfg: HeaderCfg; onBack: () => void }) {
  return (
    <SafeAreaView edges={['top']} style={ui.headerWrap}>
      <View style={ui.appBar}>
        <Pressable onPress={onBack} style={ui.backBtn} hitSlop={8} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={18} color={colors.navy} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={ui.sys}>GOVERNREG DIGITAL SYSTEM</Text>
          <Text style={ui.appTitle} numberOfLines={1} adjustsFontSizeToFit>
            {cfg.title}
          </Text>
        </View>
        <View style={ui.avatar}>
          <Ionicons name="person" size={14} color={colors.white} />
        </View>
      </View>

      <View style={ui.meta}>
        <View style={ui.rowBetween}>
          <Text style={ui.kicker}>{cfg.kicker}</Text>
          {cfg.kickerRight ? <Text style={ui.kickerRight}>{cfg.kickerRight}</Text> : null}
        </View>
        {cfg.eyebrow ? (
          <View style={ui.rowCenter}>
            <Ionicons name="shield-checkmark-outline" size={11} color="#AEB8D0" />
            <Text style={ui.kicker}>{cfg.eyebrow}</Text>
          </View>
        ) : null}
        {cfg.heading ? (
          <View style={ui.rowBetween}>
            <Text style={ui.heading}>{cfg.heading}</Text>
            {cfg.headingRight ? <Text style={ui.headingRight}>{cfg.headingRight}</Text> : null}
          </View>
        ) : null}
        {cfg.sub ? <Text style={ui.sub}>{cfg.sub}</Text> : null}
        <View style={ui.track}>
          <View style={[ui.fill, { width: `${cfg.pct}%` }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------- building blocks ----------------
export function Card({ children }: { children: React.ReactNode }) {
  return <View style={ui.card}>{children}</View>;
}

export function SectionTitle({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={ui.rowCenter}>
      <Ionicons name={icon} size={14} color={colors.navy} />
      <Text style={ui.section}>{text}</Text>
    </View>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  tag?: string;
  labelIcon?: IconName;
  icon?: IconName;
  rightIcon?: IconName;
  right?: React.ReactNode;
  help?: string;
}

export function Field({ label, required, tag, labelIcon, icon, rightIcon, right, help, style, ...rest }: FieldProps) {
  const multi = !!rest.multiline;
  return (
    <View>
      <View style={ui.labelRow}>
        <View style={ui.rowCenter}>
          {labelIcon ? <Ionicons name={labelIcon} size={13} color={colors.navy} /> : null}
          <Text style={ui.label}>
            {label}
            {required ? ' *' : ''}
          </Text>
        </View>
        {tag ? (
          <View style={ui.tag}>
            <Text style={ui.tagText}>{tag}</Text>
          </View>
        ) : null}
      </View>
      <View style={[ui.inputBox, multi && { alignItems: 'flex-start' }]}>
        {icon ? <Ionicons name={icon} size={17} color={colors.navy} style={multi ? { marginTop: 12 } : undefined} /> : null}
        <TextInput
          placeholderTextColor="#8A8F98"
          {...rest}
          style={[ui.input, multi && { minHeight: 76, textAlignVertical: 'top' }, style]}
        />
        {right ?? (rightIcon ? <Ionicons name={rightIcon} size={17} color={colors.navy} /> : null)}
      </View>
      {help ? <Text style={ui.help}>{help}</Text> : null}
    </View>
  );
}

export function SelectField({
  label, required, icon, value, placeholder, options, onSelect,
}: {
  label: string;
  required?: boolean;
  icon?: IconName;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <View style={ui.labelRow}>
        <Text style={ui.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      </View>
      <Pressable onPress={() => setOpen(true)} style={ui.inputBox} accessibilityRole="button">
        {icon ? <Ionicons name={icon} size={17} color={colors.navy} /> : null}
        <Text style={[ui.input, { paddingVertical: 14 }, !value && { color: '#8A8F98' }]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.text} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={ui.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={ui.sheet} onPress={() => undefined}>
            <Text style={ui.sheetTitle}>{label}</Text>
            <ScrollView>
              {options.map((o) => (
                <Pressable
                  key={o}
                  onPress={() => {
                    onSelect(o);
                    setOpen(false);
                  }}
                  style={ui.sheetRow}
                >
                  <Text style={[ui.sheetText, o === value && { fontWeight: '700', color: colors.navy }]}>{o}</Text>
                  {o === value ? <Ionicons name="checkmark" size={16} color={colors.navy} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function Segmented<T extends string>({
  options, value, onChange, pill,
}: {
  options: { value: T; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
  pill?: boolean;
}) {
  return (
    <View style={pill ? ui.pillRow : ui.segRow}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            style={[pill ? ui.pill : ui.seg, on && (pill ? ui.pillOn : ui.segOn)]}
          >
            {o.icon ? <Ionicons name={o.icon} size={13} color={on ? colors.white : colors.muted} /> : null}
            <Text style={[ui.segText, on && { color: colors.white, fontWeight: '600' }]}>{o.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function InfoNote({ icon = 'shield-checkmark-outline', title, text, rightIcon }: { icon?: IconName; title?: string; text: string; rightIcon?: IconName }) {
  return (
    <View style={ui.note}>
      <Ionicons name={icon} size={17} color={colors.navy} />
      <View style={{ flex: 1 }}>
        {title ? <Text style={ui.noteTitle}>{title}</Text> : null}
        <Text style={ui.noteText}>{text}</Text>
      </View>
      {rightIcon ? <Ionicons name={rightIcon} size={16} color={colors.muted} /> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, icon = 'arrow-forward', flex }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconName; flex?: number }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[ui.primary, disabled && { backgroundColor: '#8591A8' }, flex ? { flex } : undefined]}
    >
      <Text style={ui.primaryText}>{label}</Text>
      <Ionicons name={icon} size={15} color={colors.white} />
    </Pressable>
  );
}

export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={ui.outline}>
      <Ionicons name="arrow-back" size={14} color={colors.navy} />
      <Text style={ui.outlineText}>{label}</Text>
    </Pressable>
  );
}

export function NavRow({ nextLabel, onBack, onNext, nextDisabled }: { nextLabel: string; onBack: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return (
    <View style={ui.navRow}>
      <View style={{ flex: 1 }}>
        <OutlineButton label="Back" onPress={onBack} />
      </View>
      <PrimaryButton label={nextLabel} onPress={onNext} disabled={nextDisabled} flex={2} />
    </View>
  );
}

// ---------------- styles ----------------
export const ui = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },

  headerWrap: { backgroundColor: colors.navy },
  appBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  sys: { fontSize: 8.5, letterSpacing: 0.8, color: '#AEB8D0' },
  appTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginTop: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4, gap: 5 },
  kicker: { fontSize: 9, letterSpacing: 0.8, color: '#AEB8D0' },
  kickerRight: { fontSize: 10, color: colors.white },
  heading: { flex: 1, fontSize: 21, fontWeight: '700', color: colors.white },
  headingRight: { fontSize: 10, color: '#C9D1E3' },
  sub: { fontSize: 12, lineHeight: 17, color: '#C9D1E3' },
  track: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8, overflow: 'hidden' },
  fill: { height: 3, backgroundColor: colors.white },

  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 14 },
  section: { fontSize: 10, letterSpacing: 0.8, color: colors.muted },

  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 11.5, fontWeight: '600', color: colors.text },
  tag: { borderRadius: 4, backgroundColor: colors.chip, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 8.5, color: colors.muted },
  inputBox: {
    minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#E5E8EE', backgroundColor: colors.field, paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: 10 },
  help: { fontSize: 9.5, color: colors.muted, marginTop: 4 },

  segRow: { flexDirection: 'row', borderRadius: 8, backgroundColor: colors.soft, padding: 3, gap: 3 },
  seg: { flex: 1, height: 36, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  segOn: { backgroundColor: colors.navy },
  segText: { fontSize: 12, color: colors.muted },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, height: 36, borderRadius: 999, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  pillOn: { backgroundColor: colors.navy },

  note: { flexDirection: 'row', gap: 10, alignItems: 'center', borderRadius: 10, backgroundColor: colors.soft, padding: 12 },
  noteTitle: { fontSize: 11.5, fontWeight: '600', color: colors.text },
  noteText: { fontSize: 10.5, lineHeight: 15, color: colors.muted },

  primary: { height: 48, borderRadius: 8, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 8 },
  primaryText: { fontSize: 13, fontWeight: '600', color: colors.white },
  outline: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.navy, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  outlineText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  navRow: { flexDirection: 'row', gap: 10 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  sheet: { maxHeight: '70%', borderRadius: 14, backgroundColor: colors.white, padding: 8 },
  sheetTitle: { fontSize: 13, fontWeight: '700', color: colors.text, padding: 12 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 13 },
  sheetText: { fontSize: 14, color: colors.text },
});