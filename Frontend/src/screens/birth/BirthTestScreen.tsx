import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllBirthAplications from "./AllBirthApplications";
import ApplicationForm from "./BirthApplicationForm";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createBirthApplication, loadBirthApplications } from "../../actions/birthAction";
import type { SignOffCredentials } from "../../types/auth";
import type { BirthApplicationPayload } from "../../types/birth";

export default function BirthTestScreen() {
  const dispatch = useAppDispatch();
  const registrations = useAppSelector((state) => state.birth.queue);
  const status = useAppSelector((state) => state.birth.status);
  const [showApplication, setShowApplication] =
  useState(false);

  const [showAllApplications, setShowAllApplications] =
  useState(false);

  useEffect(() => {
    void dispatch(loadBirthApplications());
  }, [dispatch]);

  const saveDraft = async (payload: BirthApplicationPayload) => {
    await dispatch(createBirthApplication({ payload, status: "Draft" })).unwrap();
    await dispatch(loadBirthApplications()).unwrap();
    setShowApplication(false);
    Alert.alert("Draft saved", "The birth application has been saved.");
  };

  const submitApplication = async (
    payload: BirthApplicationPayload,
    credentials: SignOffCredentials
  ) => {
    await dispatch(
      createBirthApplication({ payload, status: "Pending", credentials })
    ).unwrap();
    await dispatch(loadBirthApplications()).unwrap();
    setShowApplication(false);
    Alert.alert("Application submitted", "The birth application was submitted for review.");
  };

  /* =====================================================
     SHOW APPLICATION FORM
  ====================================================== */

  if (showApplication) {
    return (
        <ApplicationForm
        onBack={() => setShowApplication(false)}
        onSaveDraft={saveDraft}
        onSubmit={submitApplication}
        />
    );
  }

  if (showAllApplications) {
    return (
        <AllBirthAplications
        onBack={() => setShowAllApplications(false)}
        />
    );
  }

  /* =====================================================
     DASHBOARD FUNCTIONS
  ====================================================== */

  const handleNewRegistration = () => {
    setShowApplication(true);
  };

  const handleViewCertificates = () => {
    setShowAllApplications(true);
    console.log("View All Birth Certificates");
  };

  const handleViewApplication = (id: string) => {
    setShowAllApplications(true);
    console.log("View application:", id);
  };

  const draftCount = registrations.filter((item) => item.status === "Draft").length;
  const pendingCount = registrations.filter((item) => item.status === "Pending").length;
  const approvedCount = registrations.filter((item) => item.status === "Approved").length;

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B2855"
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View className="h-[56px] flex-row items-center justify-between bg-[#0B2855] px-2">
        {/* Menu */}
        <Pressable
          className="h-10 w-10 items-center justify-center"
          onPress={() => console.log("Menu pressed")}
        >
          <Text className="text-[25px] text-white">
            ☰
          </Text>
        </Pressable>

        {/* Title */}
        <Text className="text-[16px] font-bold text-white">
          Dashboard
        </Text>

        {/* Profile */}
        <Pressable
          className="h-10 w-10 items-center justify-center"
          onPress={() => console.log("Profile pressed")}
        >
          <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-white">
            <Text className="text-[13px] text-white">
              ●
            </Text>
          </View>
        </Pressable>
      </View>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <ScrollView
        className="flex-1 bg-[#F8F9FB]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/* WELCOME */}

        <View className="px-4 pb-3 pt-7">
          <Text className="text-[20px] font-bold text-[#222222]">
            Welcome, Birth Registrar
          </Text>

          <Text className="mt-1 text-[13px] text-[#555555]">
            Manage birth registrations
          </Text>
        </View>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <View className="mx-3 flex-row rounded-xl border border-[#E1E5EA] bg-white p-1 shadow-sm">
          <StatCard
            icon="▣"
            label="NEW"
            number={String(draftCount)}
            description="New Entries"
            iconColor="#243C70"
          />

          <StatCard
            icon="⌛"
            label="WAIT"
            number={String(pendingCount)}
            description="Pending"
            iconColor="#243C70"
          />

          <StatCard
            icon="✓"
            label="DONE"
            number={String(approvedCount)}
            description="Approved"
            iconColor="#243C70"
          />
        </View>

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}

        <View className="px-3 pt-4">
          {/* NEW REGISTRATION */}

          <Pressable
            onPress={handleNewRegistration}
            className="h-[48px] flex-row items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="mr-2 text-[20px] text-white">
              ⊕
            </Text>

            <Text className="text-[14px] font-medium text-white">
              New Birth Registration
            </Text>
          </Pressable>

          {/* VIEW CERTIFICATES */}

          <Pressable
            onPress={handleViewCertificates}
            className="mt-1 h-[48px] flex-row items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
            >
            <Text className="mr-2 text-[17px] text-white">
                ▣
            </Text>

            <Text className="text-[14px] font-medium text-white">
                View All Birth Certificates
            </Text>
        </Pressable>
        </View>

        {/* =================================================
            RECENT REGISTRATIONS
        ================================================== */}

        <View className="mt-6 flex-row items-center justify-between px-4">
          <Text className="text-[15px] font-bold text-[#292929]">
            Recent Registrations
          </Text>

          <Text className="text-[10px] text-[#777777]">
            Showing {Math.min(registrations.length, 5)} latest
          </Text>
        </View>

        <View className="px-3">
          {status === "loading" && registrations.length === 0 ? (
            <ActivityIndicator className="mt-4" />
          ) : registrations.slice(0, 5).map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={{
                id: registration.id,
                babyName: registration.babyName,
                date: registration.submittedOn,
                status: registration.status,
              }}
              onPress={() =>
                handleViewApplication(registration.id)
              }
            />
          ))}
          {status === "failed" && registrations.length === 0 && (
            <Text className="mt-4 text-center text-[11px] text-[#C62828]">
              Unable to load birth applications.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* =====================================================
          BOTTOM NAVIGATION
      ====================================================== */}

      <View className="h-[64px] flex-row border-t border-[#E5E7EB] bg-white">
        <BottomNavItem
          icon="⌂"
          label="Home"
          active
          onPress={() => console.log("Home")}
        />

        <BottomNavItem
          icon="▣"
          label="News"
          onPress={() => console.log("News")}
        />

        <BottomNavItem
          icon="♧"
          label="Notification"
          onPress={() => console.log("Notification")}
        />

        <BottomNavItem
          icon="♙"
          label="Profile"
          onPress={() => console.log("Profile")}
        />
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

type StatCardProps = {
  icon: string;
  label: string;
  number: string;
  description: string;
  iconColor: string;
};

function StatCard({
  icon,
  label,
  number,
  description,
  iconColor,
}: StatCardProps) {
  return (
    <View className="flex-1 px-2 py-3">
      <View className="flex-row items-start justify-between">
        <Text
          className="text-[18px]"
          style={{ color: iconColor }}
        >
          {icon}
        </Text>

        <Text className="text-[8px] font-medium text-[#777777]">
          {label}
        </Text>
      </View>

      <Text className="mt-1 text-[21px] font-bold text-[#222222]">
        {number}
      </Text>

      <Text className="text-[9px] text-[#888888]">
        {description}
      </Text>
    </View>
  );
}

/* =========================================================
   REGISTRATION CARD
========================================================= */

type RegistrationCardProps = {
  registration: {
    id: string;
    babyName: string;
    date: string;
    status: "Draft" | "Pending" | "Approved" | "Rejected";
  };
  onPress: () => void;
};

function RegistrationCard({
  registration,
  onPress,
}: RegistrationCardProps) {
  const isPending = registration.status === "Pending";
  const statusLabel = registration.status === "Draft" ? "Open" : registration.status;

  return (
    <View className="mt-3 rounded-lg border border-[#E2E5E9] bg-white px-3 py-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="rounded bg-[#EEEEEE] px-2 py-1">
            <Text className="text-[9px] text-[#777777]">
              {registration.id}
            </Text>
          </View>

          <Text className="ml-2 text-[13px] font-medium text-[#333333]">
            {registration.babyName}
          </Text>
        </View>

        <View
          className={`rounded px-2 py-1 ${
            isPending
              ? "bg-[#FF9900]"
              : "bg-[#329447]"
          }`}
        >
          <Text className="text-[9px] font-semibold text-white">
            {statusLabel}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="mr-1 text-[13px] text-[#344563]">
            ▣
          </Text>

          <Text className="text-[10px] text-[#777777]">
            {registration.date}
          </Text>
        </View>

        <Pressable
          onPress={onPress}
          className="rounded-md bg-[#0B2855] px-4 py-2 active:opacity-80"
        >
          <Text className="text-[10px] font-medium text-white">
            View
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   BOTTOM NAV ITEM
========================================================= */

type BottomNavItemProps = {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
};

function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center active:opacity-70"
    >
      <Text
        className={`text-[20px] ${
          active
            ? "text-[#0B2855]"
            : "text-[#687385]"
        }`}
      >
        {icon}
      </Text>

      <Text
        className={`mt-1 text-[9px] ${
          active
            ? "font-semibold text-[#0B2855]"
            : "text-[#687385]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}