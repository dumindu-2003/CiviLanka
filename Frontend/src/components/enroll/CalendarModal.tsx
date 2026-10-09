import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const pad = (n: number) => String(n).padStart(2, '0');

// 'DD / MM / YYYY'  ->  Date (or null when the text is not a complete date)
const parseDob = (s: string): Date | null => {
  const m = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec((s ?? '').trim());
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d : null;
};

interface Props {
  visible: boolean;
  value: string; // current text of the field: 'DD / MM / YYYY'
  onSelect: (value: string) => void; // returns 'DD / MM / YYYY'
  onClose: () => void;
}

export function CalendarModal({ visible, value, onSelect, onClose }: Props) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [view, setView] = useState({ y: today.getFullYear() - 30, m: 0 });
  const [mode, setMode] = useState<'day' | 'year'>('day');

  // every time the calendar opens: jump to the date already typed (or ~30 years back for a date of birth)
  useEffect(() => {
    if (!visible) return;
    const d = parseDob(value);
    setView(d ? { y: d.getFullYear(), m: d.getMonth() } : { y: today.getFullYear() - 30, m: 0 });
    setMode('day');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const selected = parseDob(value);
  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const atCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  const prevMonth = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () => {
    if (atCurrentMonth) return;
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  };

  const years: number[] = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 100; y--) years.push(y);

  const pickDay = (day: number) => onSelect(`${pad(day)} / ${pad(view.m + 1)} / ${view.y}`);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card} onPress={() => undefined}>
          {/* header */}
          <View style={s.head}>
            <Pressable onPress={prevMonth} hitSlop={8} style={s.navBtn} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={18} color={colors.white} />
            </Pressable>
            <Pressable onPress={() => setMode((x) => (x === 'day' ? 'year' : 'day'))} style={s.titleBtn} accessibilityRole="button">
              <Text style={s.title}>
                {MONTHS[view.m]} {view.y}
              </Text>
              <Ionicons name={mode === 'day' ? 'chevron-down' : 'chevron-up'} size={14} color={colors.white} />
            </Pressable>
            <Pressable
              onPress={nextMonth}
              hitSlop={8}
              style={[s.navBtn, atCurrentMonth && { opacity: 0.35 }]}
              accessibilityLabel="Next month"
            >
              <Ionicons name="chevron-forward" size={18} color={colors.white} />
            </Pressable>
          </View>

          {mode === 'year' ? (
            <ScrollView style={s.yearScroll} contentContainerStyle={s.yearWrap}>
              {years.map((y) => (
                <Pressable
                  key={y}
                  onPress={() => {
                    setView((v) => ({ ...v, y }));
                    setMode('day');
                  }}
                  style={[s.yearChip, y === view.y && s.yearChipOn]}
                >
                  <Text style={[s.yearText, y === view.y && { color: colors.white, fontWeight: '700' }]}>{y}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={s.body}>
              <View style={s.weekRow}>
                {WEEKDAYS.map((w) => (
                  <Text key={w} style={s.weekText}>
                    {w}
                  </Text>
                ))}
              </View>
              <View style={s.grid}>
                {cells.map((day, i) => {
                  if (day === null) return <View key={`e${i}`} style={s.cell} />;
                  const date = new Date(view.y, view.m, day);
                  const future = date > todayStart;
                  const isSel =
                    !!selected &&
                    selected.getFullYear() === view.y &&
                    selected.getMonth() === view.m &&
                    selected.getDate() === day;
                  return (
                    <Pressable key={day} disabled={future} onPress={() => pickDay(day)} style={s.cell} accessibilityRole="button">
                      <View style={[s.dayDot, isSel && s.dayDotOn]}>
                        <Text style={[s.dayText, future && { color: '#C4C7CE' }, isSel && { color: colors.white, fontWeight: '700' }]}>
                          {day}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <Pressable onPress={onClose} style={s.cancel} accessibilityRole="button">
            <Text style={s.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  card: { borderRadius: 16, backgroundColor: colors.white, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.navy, paddingHorizontal: 12, paddingVertical: 12 },
  navBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  titleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700', color: colors.white },

  body: { padding: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekText: { flex: 1, textAlign: 'center', fontSize: 11, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' },
  dayDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayDotOn: { backgroundColor: colors.navy },
  dayText: { fontSize: 13, color: colors.text },

  yearScroll: { maxHeight: 300 },
  yearWrap: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8, justifyContent: 'center' },
  yearChip: { width: 74, height: 36, borderRadius: 8, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  yearChipOn: { backgroundColor: colors.navy },
  yearText: { fontSize: 13, color: colors.text },

  cancel: { height: 44, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  cancelText: { fontSize: 13, fontWeight: '600', color: colors.navy },
});