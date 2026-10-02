import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Registration = {
  id: string;
  babyName: string;
  date: string;
  status: "Pending" | "Approved";
};

const registrations: Registration[] = [
  {
    id: "B001",
    babyName: "Baby Perera",
    date: "2026-09-01",
    status: "Pending",
  },
  {
    id: "B002",
    babyName: "Baby Silva",
    date: "2026-08-28",
    status: "Approved",
  },
];

export default function BirthDashboard() {
  const handleNewRegistration = () => {
    console.log("New Birth Registration");
    // Later:
    // router.push("/birth/application");
  };

  const handleViewCertificates = () => {
    console.log("View All Birth Certificates");
  };

  const handleViewApplication = (id: string) => {
    console.log("View application:", id);
    // Later:
    // router.push(`/birth/application/${id}`);
  };

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
          <Text className="text-[25px] text-white">☰</Text>
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
            <Text className="text-[13px] text-white">●</Text>
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
        {/* =================================================
            WELCOME SECTION
        ================================================== */}
        <View className="px-4 pb-3 pt-7">
          <Text className="text-[20px] font-bold text-[#222222]">
            Welcome, Birth Registrar
          </Text>

          <Text className="mt-1 text-[13px] text-[#555555]">
            Manage birth registrations
          </Text>
        </View>

        {/* =================================================
            STATISTICS CARDS
        ================================================== */}
        <View className="mx-3 flex-row rounded-xl border border-[#E1E5EA] bg-white p-1 shadow-sm">
          {/* New */}
          <StatCard
            icon="▣"
            label="NEW"
            number="5"
            description="New Entries"
            iconColor="#243C70"
          />

          {/* Waiting */}
          <StatCard
            icon="⌛"
            label="WAIT"
            number="3"
            description="Pending"
            iconColor="#243C70"
          />

          {/* Done */}
          <StatCard
            icon="✓"
            label="DONE"
            number="12"
            description="Approved"
            iconColor="#243C70"
          />
        </View>

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}
        <View className="px-3 pt-4">
          {/* New Registration */}
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

          {/* View Certificates */}
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
            RECENT REGISTRATIONS HEADER
        ================================================== */}
        <View className="mt-6 flex-row items-center justify-between px-4">
          <Text className="text-[15px] font-bold text-[#292929]">
            Recent Registrations
          </Text>

          <Text className="text-[10px] text-[#777777]">
            Showing 2 latest
          </Text>
        </View>

        {/* =================================================
            REGISTRATION CARDS
        ================================================== */}
        <View className="px-3">
          {registrations.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
              onPress={() =>
                handleViewApplication(registration.id)
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* =====================================================
          BOTTOM NAVIGATION
      ====================================================== */}
      <View className="h-[64px] flex-row border-t border-[#E5E7EB] bg-white">
        {/* Home */}
        <BottomNavItem
          icon="⌂"
          label="Home"
          active
          onPress={() => console.log("Home")}
        />

        {/* News */}
        <BottomNavItem
          icon="▣"
          label="News"
          onPress={() => console.log("News")}
        />

        {/* Notification */}
        <BottomNavItem
          icon="♧"
          label="Notification"
          onPress={() => console.log("Notification")}
        />

        {/* Profile */}
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
  registration: Registration;
  onPress: () => void;
};

function RegistrationCard({
  registration,
  onPress,
}: RegistrationCardProps) {
  const isPending = registration.status === "Pending";

  return (
    <View className="mt-3 rounded-lg border border-[#E2E5E9] bg-white px-3 py-3 shadow-sm">
      {/* Top row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* ID */}
          <View className="rounded bg-[#EEEEEE] px-2 py-1">
            <Text className="text-[9px] text-[#777777]">
              {registration.id}
            </Text>
          </View>

          {/* Baby name */}
          <Text className="ml-2 text-[13px] font-medium text-[#333333]">
            {registration.babyName}
          </Text>
        </View>

        {/* Status */}
        <View
          className={`rounded px-2 py-1 ${
            isPending ? "bg-[#FF9900]" : "bg-[#329447]"
          }`}
        >
          <Text className="text-[9px] font-semibold text-white">
            {registration.status}
          </Text>
        </View>
      </View>

      {/* Bottom row */}
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="mr-1 text-[13px] text-[#344563]">
            ▣
          </Text>

          <Text className="text-[10px] text-[#777777]">
            {registration.date}
          </Text>
        </View>

        {/* View button */}
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
          active ? "text-[#0B2855]" : "text-[#687385]"
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