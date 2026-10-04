import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DeathRegisterForm from "./DeathRegisterForm";
import AllDeathApplications from "./AllDeathApplications";

type Registration = {
  id: string;
  name: string;
  date: string;
  status: "Open" | "Approved" | "Rejected";
};

const registrations: Registration[] = [
  {
    id: "D001",
    name: "Nimal Silva",
    date: "2026-08-28",
    status: "Open",
  },
  {
    id: "D002",
    name: "Kamala Perera",
    date: "2026-08-25",
    status: "Approved",
  },
];

export default function DeathTestScreen() {
  /* =====================================================
     SCREEN STATES
  ====================================================== */

  const [showApplication, setShowApplication] =
    useState(false);

  const [showAllApplications, setShowAllApplications] =
    useState(false);

  /* =====================================================
     NEW DEATH REGISTRATION
  ====================================================== */

  if (showApplication) {
    return (
      <DeathRegisterForm
        onBack={() => setShowApplication(false)}
      />
    );
  }

  /* =====================================================
     ALL DEATH APPLICATIONS
  ====================================================== */

  if (showAllApplications) {
    return (
      <AllDeathApplications
        onBack={() => setShowAllApplications(false)}
      />
    );
  }

  /* =====================================================
     BUTTON HANDLERS
  ====================================================== */

  const handleNewRegistration = () => {
    setShowApplication(true);
  };

  const handleViewCertificates = () => {
    setShowAllApplications(true);
  };

  const handleViewApplication = (id: string) => {
    console.log("View Death Application:", id);

    // Open the All Applications screen.
    // The individual application can then be opened
    // using its View Application button.
    setShowAllApplications(true);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View className="h-[58px] flex-row items-center border-b border-[#EEEEEE] bg-white px-5">
        {/* Menu */}

        <Pressable
          className="h-[36px] w-[36px] items-center justify-center"
          onPress={() => console.log("Menu")}
        >
          <Text className="text-[23px] text-[#222222]">
            ☰
          </Text>
        </Pressable>

        {/* Title */}

        <View className="flex-1 items-center">
          <Text className="text-[16px] font-bold text-[#171717]">
            Death Registrar
          </Text>
        </View>

        {/* Profile */}

        <Pressable
          className="h-[29px] w-[29px] items-center justify-center rounded-full bg-black"
          onPress={() => console.log("Profile")}
        >
          <Text className="text-[14px] text-white">
            ♙
          </Text>
        </Pressable>
      </View>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 18,
          paddingBottom: 30,
        }}
      >
        {/* =================================================
            WELCOME
        ================================================== */}

        <View className="mb-5">
          <Text className="text-[20px] font-bold text-[#171717]">
            Welcome, Death Registrar
          </Text>

          <Text className="mt-1 text-[12px] text-[#666666]">
            Manage death registrations
          </Text>
        </View>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <View className="mb-5 flex-row justify-between">

          {/* NEW */}

          <View className="h-[104px] w-[31%] rounded-xl bg-[#F1F1F3] px-3 py-3">
            <View className="flex-row items-center justify-between">
              <View className="h-[24px] w-[24px] items-center justify-center rounded-md bg-[#E2E2E4]">
                <Text className="text-[13px] text-[#222222]">
                  ▣
                </Text>
              </View>

              <Text className="text-[8px] font-bold text-[#555555]">
                NEW
              </Text>
            </View>

            <Text className="mt-2 text-[24px] font-bold text-[#171717]">
              3
            </Text>

            <Text className="text-[9px] text-[#555555]">
              New
            </Text>

            <Text className="text-[9px] text-[#555555]">
              Registrations
            </Text>
          </View>

          {/* WAIT */}

          <View className="h-[104px] w-[31%] rounded-xl bg-[#F1F1F3] px-3 py-3">
            <View className="flex-row items-center justify-between">
              <View className="h-[24px] w-[24px] items-center justify-center rounded-md bg-[#E2E2E4]">
                <Text className="text-[14px] text-[#222222]">
                  ⌛
                </Text>
              </View>

              <Text className="text-[8px] font-bold text-[#555555]">
                WAIT
              </Text>
            </View>

            <Text className="mt-2 text-[24px] font-bold text-[#171717]">
              2
            </Text>

            <Text className="text-[9px] text-[#555555]">
              Pending
            </Text>

            <Text className="text-[9px] text-[#555555]">
              Approval
            </Text>
          </View>

          {/* DONE */}

          <View className="h-[104px] w-[31%] rounded-xl bg-[#F1F1F3] px-3 py-3">
            <View className="flex-row items-center justify-between">
              <View className="h-[24px] w-[24px] items-center justify-center rounded-md bg-[#E2E2E4]">
                <Text className="text-[13px] text-[#222222]">
                  ✓
                </Text>
              </View>

              <Text className="text-[8px] font-bold text-[#555555]">
                DONE
              </Text>
            </View>

            <Text className="mt-2 text-[24px] font-bold text-[#171717]">
              8
            </Text>

            <Text className="text-[9px] text-[#555555]">
              Approved
            </Text>
          </View>
        </View>

        {/* =================================================
            NEW DEATH REGISTRATION
        ================================================== */}

        <Pressable
          onPress={handleNewRegistration}
          className="mb-2.5 h-[42px] flex-row items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
        >
          <Text className="mr-2 text-[19px] text-white">
            ⊕
          </Text>

          <Text className="text-[12px] font-medium text-white">
            New Death Registration
          </Text>
        </Pressable>

        {/* =================================================
            VIEW ALL DEATH CERTIFICATES
        ================================================== */}

        <Pressable
          onPress={handleViewCertificates}
          className="mb-5 h-[42px] flex-row items-center justify-center rounded-lg bg-[#E7E7E9] active:opacity-80"
        >
          <Text className="mr-2 text-[16px] text-[#222222]">
            ▣
          </Text>

          <Text className="text-[12px] font-medium text-[#222222]">
            View All Death Certificates
          </Text>
        </Pressable>

        {/* =================================================
            RECENT REGISTRATIONS
        ================================================== */}

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[16px] font-bold text-[#171717]">
            Recent Registrations
          </Text>

          <Text className="text-[10px] text-[#555555]">
            Showing 2 latest
          </Text>
        </View>

        {/* =================================================
            REGISTRATION CARDS
        ================================================== */}

        {registrations.map((registration) => (
          <DeathRegistrationCard
            key={registration.id}
            registration={registration}
            onView={() =>
              handleViewApplication(registration.id)
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   REGISTRATION CARD
========================================================= */

type CardProps = {
  registration: Registration;
  onView: () => void;
};

function DeathRegistrationCard({
  registration,
  onView,
}: CardProps) {
  const isApproved =
    registration.status === "Approved";

  const isRejected =
    registration.status === "Rejected";

  return (
    <View className="mb-2 overflow-hidden rounded-xl border border-[#EEEEEE] bg-white">
      <View className="px-3.5 py-3.5">

        {/* =================================================
            TOP ROW
        ================================================== */}

        <View className="flex-row items-center">

          {/* ID */}

          <View className="rounded-full bg-[#F0F0F1] px-2.5 py-1">
            <Text className="text-[8px] font-bold text-[#333333]">
              {registration.id}
            </Text>
          </View>

          {/* Name */}

          <Text
            className="ml-2 flex-1 text-[12px] font-bold text-[#171717]"
            numberOfLines={1}
          >
            {registration.name}
          </Text>

          {/* Status */}

          <View
            className={`flex-row items-center rounded-full px-2.5 py-1 ${
              isApproved
                ? "bg-[#E8F7EF]"
                : isRejected
                ? "bg-[#FDECEC]"
                : "bg-[#EEF4FF]"
            }`}
          >
            <View
              className={`mr-1.5 h-[6px] w-[6px] rounded-full ${
                isApproved
                  ? "bg-[#16804B]"
                  : isRejected
                  ? "bg-[#C62828]"
                  : "bg-[#0B2855]"
              }`}
            />

            <Text
              className={`text-[8px] font-medium ${
                isApproved
                  ? "text-[#16804B]"
                  : isRejected
                  ? "text-[#C62828]"
                  : "text-[#0B2855]"
              }`}
            >
              {registration.status}
            </Text>
          </View>
        </View>

        {/* =================================================
            BOTTOM ROW
        ================================================== */}

        <View className="mt-4 flex-row items-center justify-between">

          <View className="flex-row items-center">
            <Text className="mr-1 text-[13px] text-[#555555]">
              □
            </Text>

            <Text className="text-[10px] text-[#555555]">
              {registration.date}
            </Text>
          </View>

          {/* View */}

          <Pressable
            onPress={onView}
            className="h-[28px] min-w-[51px] items-center justify-center rounded-lg bg-[#EEEEEF] px-3 active:opacity-70"
          >
            <Text className="text-[10px] font-medium text-[#222222]">
              View
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}