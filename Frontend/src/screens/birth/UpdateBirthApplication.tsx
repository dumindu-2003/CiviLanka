import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RegistrationStatus = "Open" | "Approved" | "Rejected";

export type Registration = {
  id: string;
  babyName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  birthPlace: string;
  status: RegistrationStatus;
};

type UpdateBirthApplicationProps = {
  registration: Registration;
  onBack: () => void;
  onUpdate: (updatedApplication: Registration) => void;
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
  onUpdate,
}: UpdateBirthApplicationProps) {
  const [status, setStatus] = useState<RegistrationStatus>(
    registration.status || "Open"
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const statuses: RegistrationStatus[] = [
    "Open",
    "Approved",
    "Rejected",
  ];

  const handleUpdate = () => {
    const updatedApplication: Registration = {
      ...registration,
      status: status,
    };

    onUpdate(updatedApplication);
  };

  const getStatusTextColor = (value: RegistrationStatus) => {
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
            Review the registration details and update the application status.
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

        {/* STATUS */}
        <SectionCard title="Application Status">
          <Text className="mb-2 text-[11px] font-semibold text-[#555]">
            Registration Status
          </Text>

          {/* DROPDOWN BUTTON */}
          <Pressable
            onPress={() => setShowDropdown(!showDropdown)}
            className="flex-row items-center justify-between rounded-xl border border-[#D7DCE3] bg-white px-4 py-3"
          >
            <Text
              className={`text-[14px] font-bold ${getStatusTextColor(
                status
              )}`}
            >
              {status}
            </Text>

            <Text className="text-[18px] font-bold text-[#0B2855]">
              {showDropdown ? "⌃" : "⌄"}
            </Text>
          </Pressable>

          {/* DROPDOWN OPTIONS */}
          {showDropdown && (
            <View className="mt-2 overflow-hidden rounded-xl border border-[#D7DCE3] bg-white">
              {statuses.map((item) => {
                const selected = status === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setStatus(item);
                      setShowDropdown(false);
                    }}
                    className="flex-row items-center justify-between border-b border-[#EEF0F3] px-4 py-3"
                  >
                    <Text
                      className={`text-[13px] font-semibold ${getStatusTextColor(
                        item
                      )}`}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Text className="text-[16px] font-bold text-[#0B2855]">
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </SectionCard>

        {/* CURRENT STATUS */}
        <View className="mb-4 rounded-xl border border-[#DCE3ED] bg-[#EEF4FB] p-4">
          <Text className="text-[10px] font-medium text-[#687386]">
            CURRENT SELECTED STATUS
          </Text>

          <Text
            className={`mt-1 text-[18px] font-bold ${getStatusTextColor(
              status
            )}`}
          >
            {status}
          </Text>
        </View>

        {/* UPDATE BUTTON */}
        <Pressable
          onPress={handleUpdate}
          className="mb-3 items-center rounded-xl bg-[#0B2855] py-4"
        >
          <Text className="text-[14px] font-bold text-white">
            Update Birth Application
          </Text>
        </Pressable>

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