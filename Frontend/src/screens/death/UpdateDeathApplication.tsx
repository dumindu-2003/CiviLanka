import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DeathApplication, DeathStatus } from "../../types/death";

type Props = {
  application: DeathApplication;
  onBack: () => void;
  onEdit: () => void;
  canEdit?: boolean;
  heading?: string;
  description?: string;
  onApprove?: () => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onCreateRegistration?: () => void;
};

export default function UpdateDeathApplication({
  application,
  onBack,
  onEdit,
  canEdit = true,
  heading = "Update Application",
  description = "Review the death registration details and edit the application information.",
  onApprove,
  onReject,
  onCreateRegistration,
}: Props) {
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState(false);
  const getStatusTextColor = (status: DeathStatus) => {
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
            {heading}
          </Text>

          <Text className="mt-1 text-[10px] text-[#737B87]">
            {description}
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
            label="Application Reference"
            value={application.appRef}
          />

          <InfoRow
            label="Submitted On"
            value={application.submittedOn}
          />

          <InfoRow
            label="Certificate Type"
            value="Death Certificate (Official Notification)"
          />

          <InfoRow
            label="Date of Death"
            value={application.dateOfDemise}
          />

          <InfoRow
            label="Time of Death"
            value={application.timeOfDemise}
          />

          <InfoRow
            label="Place of Death"
            value={application.placeOfDemise}
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
            value={application.deceasedNic}
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
            value={application.dateOfDemise}
          />

          <InfoRow
            label="Marital Status"
            value={application.maritalStatus}
          />

          <InfoRow
            label="Age at Death"
            value={application.ageAtDeath}
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
            value={application.nic}
          />

          <InfoRow
            label="Relationship"
            value={application.relationship}
          />

          <InfoRow
            label="Contact Number"
            value={application.informantContact}
          />

        </SectionCard>

        <Pressable
          onPress={onEdit}
          className="mb-4 items-center rounded-xl border border-[#0B2855] bg-white py-4"
          accessibilityRole="button"
        >
          <Text className="text-[13px] font-bold text-[#0B2855]">
            Edit Application Details
          </Text>
        </Pressable>

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
          <Text
            className={`text-[11px] font-bold ${getStatusTextColor(
              application.status
            )}`}
          >
            {application.status === "Draft" ? "Open" : application.status}
          </Text>
          {application.rejectionReason ? (
            <InfoRow
              label="Rejection Reason"
              value={application.rejectionReason}
            />
          ) : null}
        </SectionCard>

        {application.status === "Pending" && onApprove && onReject ? (
          <View className="mb-4 rounded-xl border border-[#E0E4EA] bg-white p-4">
            <Text className="mb-3 text-[14px] font-bold text-[#171717]">
              Registrar Decision
            </Text>
            <Pressable
              disabled={working}
              onPress={() => {
                setWorking(true);
                void onApprove().finally(() => setWorking(false));
              }}
              className="h-[43px] items-center justify-center rounded-lg bg-[#16804B]"
            >
              <Text className="text-[12px] font-bold text-white">Approve</Text>
            </Pressable>
            <Text className="mb-1 mt-3 text-[8px] font-medium text-[#737B87]">
              Rejection reason
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Required if you reject this report"
              multiline
              className="min-h-[64px] rounded-md border border-[#E1E5EA] bg-[#F5F6F7] px-3 py-2 text-[12px] text-[#252525]"
            />
            <Pressable
              disabled={working}
              onPress={() => {
                const trimmed = reason.trim();
                if (!trimmed) {
                  Alert.alert("Rejection reason", "Enter a reason before rejecting this report.");
                  return;
                }
                setWorking(true);
                void onReject(trimmed).finally(() => setWorking(false));
              }}
              className="mt-2 h-[43px] items-center justify-center rounded-lg border border-[#C62828] bg-white"
            >
              <Text className="text-[12px] font-bold text-[#C62828]">Reject</Text>
            </Pressable>
          </View>
        ) : null}

        {application.status === "Approved" && onCreateRegistration ? (
          <Pressable
            onPress={onCreateRegistration}
            className="mb-4 h-[46px] flex-row items-center justify-center rounded-lg bg-[#0B2855]"
          >
            <Text className="mr-2 text-[18px] text-white">⊕</Text>
            <Text className="text-[13px] font-bold text-white">New Death Registration</Text>
          </Pressable>
        ) : null}

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