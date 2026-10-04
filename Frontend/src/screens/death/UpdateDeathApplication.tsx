import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DeathApplication,
  DeathStatus,
} from "./AllDeathApplications";

type Props = {
  application: DeathApplication;
  onBack: () => void;
  onUpdate: (application: DeathApplication) => void;
};

export default function UpdateDeathApplication({
  application,
  onBack,
  onUpdate,
}: Props) {
  const [status, setStatus] = useState<DeathStatus>(
    application.status || "Open"
  );

  const [showDropdown, setShowDropdown] =
    useState(false);

  const statuses: DeathStatus[] = [
    "Open",
    "Approved",
    "Rejected",
  ];

  const handleUpdate = () => {
    onUpdate({
      ...application,
      status: status,
    });
  };

  const getStatusTextColor = () => {
    if (status === "Approved") {
      return "text-[#16804B]";
    }

    if (status === "Rejected") {
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

      {/* ===================================================
          HEADER
      ==================================================== */}

      <View className="h-[58px] flex-row items-center bg-[#0B2855] px-3">
        <Pressable
          onPress={onBack}
          className="h-[36px] w-[36px] items-center justify-center rounded-lg bg-white"
        >
          <Text className="text-[24px] font-bold text-[#0B2855]">
            ‹
          </Text>
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold text-white">
            Death Application
          </Text>

          <Text className="text-[8px] text-[#D7DFEC]">
            Review and update registration
          </Text>
        </View>

        <View className="rounded-md border border-white px-2 py-1">
          <Text className="text-[8px] font-bold text-white">
            {application.id}
          </Text>
        </View>
      </View>

      {/* ===================================================
          CONTENT
      ==================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: 18,
          paddingBottom: 35,
        }}
      >
        {/* Page title */}

        <View className="mb-4">
          <Text className="text-[21px] font-bold text-[#171717]">
            Update Application
          </Text>

          <Text className="mt-1 text-[10px] text-[#737B87]">
            Review the death registration details and
            update the application status.
          </Text>
        </View>

        {/* =================================================
            APPLICATION INFORMATION
        ================================================== */}

        <SectionCard title="Application Information">
          <InfoRow
            label="Application ID"
            value={application.id}
          />

          <InfoRow
            label="Certificate Type"
            value="Death Certificate (Official Notification)"
          />

          <InfoRow
            label="Date of Death"
            value={application.dateOfDeath}
          />

          <InfoRow
            label="Time of Death"
            value={application.timeOfDeath}
          />

          <InfoRow
            label="Place of Death"
            value={application.placeOfDeath}
          />
        </SectionCard>

        {/* =================================================
            DECEASED DETAILS
        ================================================== */}

        <SectionCard title="Deceased Person's Details">
          <InfoRow
            label="Full Legal Name"
            value={application.deceasedName}
          />

          <InfoRow
            label="NIC / Identity Number"
            value={application.nic}
          />

          <InfoRow
            label="Gender"
            value={application.gender}
          />

          <InfoRow
            label="Date of Birth"
            value={application.dateOfBirth}
          />

          <InfoRow
            label="Date of Death"
            value={application.dateOfDeath}
          />

          <InfoRow
            label="Time of Death"
            value={application.timeOfDeath}
          />

          <InfoRow
            label="Marital Status"
            value={application.maritalStatus}
          />

          <InfoRow
            label="Occupation"
            value={application.occupation}
          />

          <InfoRow
            label="Permanent Address"
            value={application.deceasedAddress}
          />
        </SectionCard>

        {/* =================================================
            INFORMANT DETAILS
        ================================================== */}

        <SectionCard title="Informant's Details">
          <InfoRow
            label="Full Legal Name"
            value={application.informantName}
          />

          <InfoRow
            label="NIC / Passport"
            value={application.informantNic}
          />

          <InfoRow
            label="Relationship"
            value={application.relationship}
          />

          <InfoRow
            label="Contact Number"
            value={application.informantContact}
          />

          <InfoRow
            label="Residential Address"
            value={application.informantAddress}
          />
        </SectionCard>

        {/* =================================================
            CAUSE OF DEATH
        ================================================== */}

        <SectionCard title="Cause & Circumstances">
          <InfoRow
            label="Cause of Death"
            value={
              application.causeOfDeath ||
              "Not provided"
            }
          />

          <View className="mt-2 rounded-lg border border-[#D8E1EA] bg-[#F1F6FA] p-3">
            <Text className="text-[8px] leading-[12px] text-[#596A7B]">
              Medical Certificate of Cause of Death
              (Form B-4) should be verified before the
              application is finally approved.
            </Text>
          </View>
        </SectionCard>

        {/* =================================================
            STATUS
        ================================================== */}

        <SectionCard title="Application Status">
          <Text className="mb-2 text-[9px] font-medium text-[#626A73]">
            Registration Status
          </Text>

          {/* Dropdown button */}

          <Pressable
            onPress={() =>
              setShowDropdown(!showDropdown)
            }
            className="min-h-[43px] flex-row items-center rounded-lg border border-[#D8DDE4] bg-white px-3"
          >
            <Text
              className={`flex-1 text-[11px] font-bold ${getStatusTextColor()}`}
            >
              {status}
            </Text>

            <Text className="text-[14px] text-[#0B2855]">
              {showDropdown ? "⌃" : "⌄"}
            </Text>
          </Pressable>

          {/* Dropdown options */}

          {showDropdown && (
            <View className="mt-2 overflow-hidden rounded-lg border border-[#D8DDE4] bg-white">
              {statuses.map((item) => {
                const selected = status === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setStatus(item);
                      setShowDropdown(false);
                    }}
                    className="flex-row items-center border-b border-[#EEEEEE] px-3 py-3"
                  >
                    <View
                      className={`mr-3 h-[10px] w-[10px] rounded-full ${
                        item === "Approved"
                          ? "bg-[#16804B]"
                          : item === "Rejected"
                          ? "bg-[#C62828]"
                          : "bg-[#0B2855]"
                      }`}
                    />

                    <Text
                      className={`flex-1 text-[11px] font-medium ${
                        item === "Approved"
                          ? "text-[#16804B]"
                          : item === "Rejected"
                          ? "text-[#C62828]"
                          : "text-[#0B2855]"
                      }`}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Text className="text-[15px] font-bold text-[#0B2855]">
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Current status */}

          <View className="mt-3 rounded-lg bg-[#F3F5F7] p-3">
            <Text className="text-[8px] text-[#737B87]">
              CURRENT SELECTED STATUS
            </Text>

            <Text
              className={`mt-1 text-[15px] font-bold ${getStatusTextColor()}`}
            >
              {status}
            </Text>
          </View>
        </SectionCard>

        {/* =================================================
            UPDATE BUTTON
        ================================================== */}

        <Pressable
          onPress={handleUpdate}
          className="mt-1 h-[45px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
        >
          <Text className="text-[11px] font-bold text-white">
            Update Death Application
          </Text>
        </Pressable>

        {/* Back button */}

        <Pressable
          onPress={onBack}
          className="mt-2 h-[43px] items-center justify-center rounded-lg border border-[#0B2855] bg-white"
        >
          <Text className="text-[11px] font-bold text-[#0B2855]">
            ← Back to Applications
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4 rounded-xl border border-[#E0E4EA] bg-white p-4">
      <Text className="mb-3 text-[14px] font-bold text-[#171717]">
        {title}
      </Text>

      {children}
    </View>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="mb-3">
      <Text className="text-[8px] font-medium text-[#737B87]">
        {label}
      </Text>

      <View className="mt-1 rounded-md border border-[#E1E5EA] bg-[#F5F6F7] px-3 py-2.5">
        <Text className="text-[10px] font-medium text-[#252525]">
          {value}
        </Text>
      </View>
    </View>
  );
}