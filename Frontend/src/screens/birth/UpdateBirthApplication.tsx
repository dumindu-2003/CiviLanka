import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BirthApplication, BirthStatus } from "../../types/birth";

type UpdateBirthApplicationProps = {
  registration: BirthApplication;
  onBack: () => void;
  onEdit: () => void;
};

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

type InfoRowProps = {
  label: string;
  value: string;
};

export default function UpdateBirthApplication({
  registration,
  onBack,
  onEdit,
}: UpdateBirthApplicationProps) {
  const getStatusTextColor = (value: BirthStatus) => {
    if (value === "Approved") {
      return "text-[#16804B]";
    }

    if (value === "Rejected") {
      return "text-[#C62828]";
    }

    return "text-[#0B2855]";
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8FA]"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B2855"
      />

      {/* HEADER */}
      <View className="h-[58px] flex-row items-center bg-[#0B2855] px-3">
        <Pressable
          onPress={onBack}
          className="h-[36px] w-[36px] items-center justify-center rounded-lg bg-white"
        >
          <Text className="text-[24px] text-[#0B2855]">‹</Text>
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-bold text-white">
            Birth Application
          </Text>

          <Text className="text-[9px] text-[#D7DFEC]">
            Update registration details
          </Text>
        </View>

        <View className="rounded-md border border-white px-2 py-1">
          <Text className="text-[9px] font-bold text-white">
            {registration.id}
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        {/* TITLE */}
        <View className="mb-4">
          <Text className="text-[20px] font-bold text-[#171717]">
            Update Application
          </Text>

          <Text className="mt-1 text-[11px] text-[#737B87]">
            Review the registration details and edit the application information.
          </Text>
        </View>

        {/* APPLICATION INFORMATION */}
        <SectionCard title="Application Information">
          <InfoRow
            label="Application ID"
            value={registration.id}
          />

          <InfoRow
            label="Baby Name"
            value={registration.babyName}
          />

          <InfoRow
            label="Birth Date"
            value={registration.birthDate}
          />

          <InfoRow
            label="Birth Place"
            value={registration.birthPlace}
          />
        </SectionCard>

        {/* PARENTS DETAILS */}
        <SectionCard title="Parents' Details">
          <InfoRow
            label="Father's Name"
            value={registration.fatherName}
          />

          <InfoRow
            label="Mother's Name"
            value={registration.motherName}
          />
        </SectionCard>

        <Pressable
          onPress={onEdit}
          className="mb-4 items-center rounded-xl border border-[#0B2855] bg-white py-4"
        >
          <Text className="text-[14px] font-bold text-[#0B2855]">
            Edit Application Details
          </Text>
        </Pressable>

        {/* STATUS */}
        <SectionCard title="Application Status">
          <Text className="mb-2 text-[11px] font-semibold text-[#555]">
            Registration Status
          </Text>
          <Text
            className={`text-[14px] font-bold ${getStatusTextColor(
              registration.status
            )}`}
          >
            {registration.status === "Draft" ? "Open" : registration.status}
          </Text>
          {registration.rejectionReason ? (
            <InfoRow
              label="Rejection Reason"
              value={registration.rejectionReason}
            />
          ) : null}
        </SectionCard>

        {/* BACK BUTTON */}
        <Pressable
          onPress={onBack}
          className="items-center rounded-xl border border-[#0B2855] bg-white py-4"
        >
          <Text className="text-[14px] font-bold text-[#0B2855]">
            ← Back to Applications
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================= */
/* SECTION CARD */
/* ============================= */

function SectionCard({
  title,
  children,
}: SectionCardProps) {
  return (
    <View className="mb-4 rounded-2xl border border-[#E1E5EA] bg-white p-4">
      <Text className="mb-4 text-[14px] font-bold text-[#0B2855]">
        {title}
      </Text>

      {children}
    </View>
  );
}

/* ============================= */
/* INFORMATION ROW */
/* ============================= */

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <View className="mb-3 border-b border-[#EEF0F3] pb-3">
      <Text className="mb-1 text-[10px] font-medium text-[#7A828E]">
        {label}
      </Text>

      <Text className="text-[13px] font-semibold text-[#171717]">
        {value || "-"}
      </Text>
    </View>
  );
}