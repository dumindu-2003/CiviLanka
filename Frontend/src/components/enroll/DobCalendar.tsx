import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const FIRST_YEAR = 1900;

export function formatDobDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function parseDobDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function DobCalendar({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const today = startOfDay(new Date());
  const currentYear = today.getFullYear();
  const selected = parseDobDate(value);
  const initial = selected ?? today;
  const [cursor, setCursor] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [pickingYear, setPickingYear] = useState(false);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = currentYear; year >= FIRST_YEAR; year -= 1) list.push(year);
    return list;
  }, [currentYear]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const slots: Array<Date | null> = [];
    for (let i = 0; i < firstWeekday; i += 1) slots.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) slots.push(new Date(year, month, day));
    while (slots.length % 7 !== 0) slots.push(null);
    return slots;
  }, [cursor]);

  const shiftMonth = (amount: number) => {
    setCursor((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + amount, 1);
      const earliest = new Date(FIRST_YEAR, 0, 1);
      const latest = new Date(today.getFullYear(), today.getMonth(), 1);
      if (next < earliest || next > latest) return current;
      return next;
    });
  };

  const canPick = (date: Date) => {
    const day = startOfDay(date);
    return day.getFullYear() >= FIRST_YEAR && day <= today;
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => {
        const openOn = selected ?? today;
        setCursor(new Date(openOn.getFullYear(), openOn.getMonth(), 1));
        setPickingYear(false);
      }}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <Text style={styles.title}>Date of birth</Text>
          <View style={styles.nav}>
            <Pressable onPress={() => shiftMonth(-1)} style={styles.navBtn} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={18} color={colors.navy} />
            </Pressable>
            <Pressable onPress={() => setPickingYear((open) => !open)} style={styles.monthBtn} accessibilityRole="button">
              <Text style={styles.monthText}>
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </Text>
            </Pressable>
            <Pressable onPress={() => shiftMonth(1)} style={styles.navBtn} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={18} color={colors.navy} />
            </Pressable>
          </View>

          {pickingYear ? (
            <ScrollView style={styles.yearList}>
              {years.map((year) => {
                const active = year === cursor.getFullYear();
                return (
                  <Pressable
                    key={year}
                    onPress={() => {
                      setCursor(new Date(year, cursor.getMonth(), 1));
                      setPickingYear(false);
                    }}
                    style={[styles.yearRow, active && styles.yearRowOn]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.yearText, active && styles.yearTextOn]}>{year}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <>
              <View style={styles.week}>
                {WEEKDAYS.map((day) => (
                  <Text key={day} style={styles.weekday}>
                    {day}
                  </Text>
                ))}
              </View>
              {Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7)).map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                  {week.map((date, index) => {
                    if (!date) return <View key={`empty-${weekIndex}-${index}`} style={styles.day} />;
                    const enabled = canPick(date);
                    const isSelected = selected !== null && startOfDay(date).getTime() === startOfDay(selected).getTime();
                    return (
                      <Pressable
                        key={formatDobDate(date)}
                        disabled={!enabled}
                        onPress={() => {
                          onSelect(formatDobDate(date));
                          onClose();
                        }}
                        style={styles.day}
                        accessibilityRole="button"
                        accessibilityLabel={formatDobDate(date)}
                      >
                        <View style={[styles.dayMark, isSelected && styles.dayOn]}>
                          <Text style={[styles.dayText, !enabled && styles.dayTextOff, isSelected && styles.dayTextOn]}>{date.getDate()}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, backgroundColor: colors.white, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthBtn: { flex: 1, alignItems: 'center' },
  monthText: { fontSize: 15, fontWeight: '700', color: colors.navy },
  week: { flexDirection: 'row', marginTop: 8 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.muted },
  weekRow: { flexDirection: 'row' },
  day: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
  dayMark: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.navy },
  dayText: { fontSize: 14, color: colors.text },
  dayTextOff: { color: '#C5CAD3' },
  dayTextOn: { color: colors.white, fontWeight: '700' },
  yearList: { maxHeight: 280, marginTop: 8 },
  yearRow: { height: 40, alignItems: 'center', justifyContent: 'center' },
  yearRowOn: { backgroundColor: '#EEF1F6', borderRadius: 8 },
  yearText: { fontSize: 15, color: colors.text },
  yearTextOn: { fontWeight: '700', color: colors.navy },
});
