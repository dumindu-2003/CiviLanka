import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type DatePickerFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel: string;
};

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const parseDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date
    : undefined;
};

export function DatePickerField({
  value,
  onChangeText,
  accessibilityLabel,
}: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => parseDate(value) ?? new Date());

  const openPicker = () => {
    setPickerDate(parseDate(value) ?? new Date());
    setVisible(true);
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setVisible(false);
    if (event.type === "set" && selectedDate) {
      onChangeText(formatDate(selectedDate));
    }
  };

  if (Platform.OS === "web") {
    return React.createElement("input", {
      type: "date",
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        onChangeText(event.currentTarget.value),
      "aria-label": accessibilityLabel,
      style: {
        boxSizing: "border-box",
        width: "100%",
        height: 38,
        padding: "0 10px",
        border: "1px solid #DDE2E8",
        borderRadius: 6,
        backgroundColor: "#333333",
        color: value ? "#333333" : "#999999",
        fontSize: 12,
      },
    });
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={openPicker}
        className="h-[38px] flex-row items-center justify-between rounded-md border border-[#DDE2E8] bg-[#F5F6F7] px-2"
      >
        <Text className={`flex-1 text-[9px] ${value ? "text-[#333333]" : "text-[#999999]"}`}>
          {value || "YYYY-MM-DD"}
        </Text>
        <Feather name="calendar" size={16} color="#0B2855" />
      </Pressable>

      {Platform.OS === "android" && visible ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="calendar"
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          transparent
          animationType="slide"
          visible={visible}
          onRequestClose={() => setVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close date picker"
              onPress={() => setVisible(false)}
              className="flex-1"
            />
            <View className="rounded-t-2xl bg-white px-4 pb-8 pt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Pressable onPress={() => setVisible(false)} className="py-2">
                  <Text className="text-[15px] text-[#0B2855]">Cancel</Text>
                </Pressable>
                <Text className="text-[15px] font-semibold text-[#171717]">
                  Select date
                </Text>
                <Pressable
                  onPress={() => {
                    onChangeText(formatDate(pickerDate));
                    setVisible(false);
                  }}
                  className="py-2"
                >
                  <Text className="text-[15px] font-semibold text-[#0B2855]">
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="inline"
                onChange={(_event, selectedDate) => {
                  if (selectedDate) setPickerDate(selectedDate);
                }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}
