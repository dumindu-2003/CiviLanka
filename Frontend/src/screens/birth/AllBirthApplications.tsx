import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import UpdateBirthApplication from "./UpdateBirthApplication";

type RegistrationStatus = "Open" | "Approved" | "Rejected";

type Registration = {
  id: string;
  babyName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  birthPlace: string;
  status: RegistrationStatus;
};

// Initial application data
const initialRegistrations: Registration[] = [
  {
    id: "B001",
    babyName: "Baby Perera",
    fatherName: "Kasun Perera",
    motherName: "Nimali Perera",
    birthDate: "2026-09-01",
    birthPlace: "Colombo National Hospital",
    status: "Open",
  },
  {
    id: "B002",
    babyName: "Baby Silva",
    fatherName: "Nuwan Silva",
    motherName: "Tharushi Silva",
    birthDate: "2026-08-28",
    birthPlace: "Negombo General Hospital",
    status: "Approved",
  },
  {
    id: "B003",
    babyName: "Baby Fernando",
    fatherName: "Dinesh Fernando",
    motherName: "Sachini Fernando",
    birthDate: "2026-08-25",
    birthPlace: "Kalubowila Hospital",
    status: "Open",
  },
  {
    id: "B004",
    babyName: "Baby Kumara",
    fatherName: "Amal Kumara",
    motherName: "Dilani Kumara",
    birthDate: "2026-08-20",
    birthPlace: "Kandy General Hospital",
    status: "Rejected",
  },
];

type Props = {
  onBack: () => void;
};

export default function AllBirthAplications({ onBack }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>(
    initialRegistrations
  );

  const [selectedApplication, setSelectedApplication] =
    useState<Registration | null>(null);

  // Open selected application
  const handleViewApplication = (registration: Registration) => {
    setSelectedApplication(registration);
  };

  // Update application status
  const handleUpdateApplication = (updatedApplication: Registration) => {
    setRegistrations((previous) =>
      previous.map((item) =>
        item.id === updatedApplication.id ? updatedApplication : item
      )
    );

    setSelectedApplication(null);
  };

  // If an application is selected,
  // show UpdateBirthApplication screen
  if (selectedApplication) {
    return (
      <UpdateBirthApplication
        registration={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        onUpdate={handleUpdateApplication}
      />
    );
  }

  // Counts
  const totalCount = registrations.length;

  const openCount = registrations.filter(
    (item) => item.status === "Open"
  ).length;

  const approvedCount = registrations.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = registrations.filter(
    (item) => item.status === "Rejected"
  ).length;

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8FA]"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B2855"
      />

      {/* ================= HEADER ================= */}
      <View className="h-[60px] flex-row items-center bg-[#0B2855] px-4">
        <Pressable
          onPress={onBack}
          className="h-[38px] w-[38px] items-center justify-center rounded-lg bg-white"
        >
          <Text className="text-[25px] text-[#0B2855]">
            ‹
          </Text>
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[17px] font-bold text-white">
            Birth Applications
          </Text>

          <Text className="text-[9px] text-[#D7DFEC]">
            Manage all birth registrations
          </Text>
        </View>

        <View className="rounded-md border border-white px-2 py-1">
          <Text className="text-[9px] font-bold text-white">
            ADMIN
          </Text>
        </View>
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 30,
        }}
      >
        {/* Page Title */}
        <View className="mb-4">
          <Text className="text-[22px] font-bold text-[#171717]">
            All Applications
          </Text>

          <Text className="mt-1 text-[11px] text-[#737B87]">
            View and manage submitted birth registration applications.
          </Text>
        </View>

        {/* ================= SUMMARY ================= */}
        <View className="mb-5 flex-row gap-2">
          {/* Total */}
          <View className="flex-1 rounded-xl border border-[#E3E7ED] bg-white p-3">
            <Text className="text-[10px] text-[#737B87]">
              Total
            </Text>

            <Text className="mt-1 text-[22px] font-bold text-[#0B2855]">
              {totalCount}
            </Text>
          </View>

          {/* Open */}
          <View className="flex-1 rounded-xl border border-[#E3E7ED] bg-white p-3">
            <Text className="text-[10px] text-[#737B87]">
              Open
            </Text>

            <Text className="mt-1 text-[22px] font-bold text-[#0B2855]">
              {openCount}
            </Text>
          </View>

          {/* Approved */}
          <View className="flex-1 rounded-xl border border-[#E3E7ED] bg-white p-3">
            <Text className="text-[10px] text-[#737B87]">
              Approved
            </Text>

            <Text className="mt-1 text-[22px] font-bold text-[#16804B]">
              {approvedCount}
            </Text>
          </View>

          {/* Rejected */}
          <View className="flex-1 rounded-xl border border-[#E3E7ED] bg-white p-3">
            <Text className="text-[10px] text-[#737B87]">
              Rejected
            </Text>

            <Text className="mt-1 text-[22px] font-bold text-[#C62828]">
              {rejectedCount}
            </Text>
          </View>
        </View>

        {/* ================= APPLICATION LIST ================= */}
        <View>
          {registrations.map((registration) => (
            <BirthApplicationCard
              key={registration.id}
              registration={registration}
              onView={() =>
                handleViewApplication(registration)
              }
            />
          ))}
        </View>

        {/* Empty State */}
        {registrations.length === 0 && (
          <View className="items-center rounded-xl border border-[#E3E7ED] bg-white px-5 py-10">
            <Text className="text-[16px] font-bold text-[#171717]">
              No Applications
            </Text>

            <Text className="mt-1 text-center text-[11px] text-[#737B87]">
              There are no birth registration applications available.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   APPLICATION CARD
========================================================= */

type CardProps = {
  registration: Registration;
  onView: () => void;
};

function BirthApplicationCard({
  registration,
  onView,
}: CardProps) {
  const getStatusStyle = () => {
    if (registration.status === "Approved") {
      return {
        container: "bg-[#E8F7EF] border-[#B7E4C7]",
        text: "text-[#16804B]",
      };
    }

    if (registration.status === "Rejected") {
      return {
        container: "bg-[#FDECEC] border-[#F1B8B8]",
        text: "text-[#C62828]",
      };
    }

    return {
      container: "bg-[#EEF4FF] border-[#C5D7F2]",
      text: "text-[#0B2855]",
    };
  };

  const statusStyle = getStatusStyle();

  return (
    <View className="mb-4 overflow-hidden rounded-xl border border-[#E0E4EA] bg-white shadow-sm">
      {/* Blue Top Line */}
      <View className="h-[4px] bg-[#0B2855]" />

      <View className="p-4">
        {/* ================= CARD HEADER ================= */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[9px] font-medium text-[#737B87]">
              APPLICATION ID
            </Text>

            <Text className="mt-1 text-[15px] font-bold text-[#0B2855]">
              {registration.id}
            </Text>
          </View>

          {/* Status */}
          <View
            className={`rounded-full border px-3 py-1.5 ${statusStyle.container}`}
          >
            <Text
              className={`text-[10px] font-bold ${statusStyle.text}`}
            >
              {registration.status}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="my-3 h-[1px] bg-[#E8EBEF]" />

        {/* ================= BABY NAME ================= */}
        <Text className="text-[9px] font-medium text-[#737B87]">
          BABY NAME
        </Text>

        <Text className="mt-1 text-[17px] font-bold text-[#171717]">
          {registration.babyName}
        </Text>

        {/* ================= DETAILS ================= */}
        <View className="mt-4">
          {/* Birth Date */}
          <View className="mb-3 flex-row">
            <View className="w-[110px]">
              <Text className="text-[10px] text-[#737B87]">
                Birth Date
              </Text>
            </View>

            <Text className="flex-1 text-[11px] font-medium text-[#171717]">
              {registration.birthDate}
            </Text>
          </View>

          {/* Birth Place */}
          <View className="mb-3 flex-row">
            <View className="w-[110px]">
              <Text className="text-[10px] text-[#737B87]">
                Birth Place
              </Text>
            </View>

            <Text className="flex-1 text-[11px] font-medium text-[#171717]">
              {registration.birthPlace}
            </Text>
          </View>

          {/* Father */}
          <View className="mb-3 flex-row">
            <View className="w-[110px]">
              <Text className="text-[10px] text-[#737B87]">
                Father's Name
              </Text>
            </View>

            <Text className="flex-1 text-[11px] font-medium text-[#171717]">
              {registration.fatherName}
            </Text>
          </View>

          {/* Mother */}
          <View className="flex-row">
            <View className="w-[110px]">
              <Text className="text-[10px] text-[#737B87]">
                Mother's Name
              </Text>
            </View>

            <Text className="flex-1 text-[11px] font-medium text-[#171717]">
              {registration.motherName}
            </Text>
          </View>
        </View>

        {/* ================= VIEW BUTTON ================= */}
        <Pressable
          onPress={onView}
          className="mt-5 h-[44px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
        >
          <Text className="text-[12px] font-bold text-white">
            View Application
          </Text>
        </Pressable>
      </View>
    </View>
  );
}