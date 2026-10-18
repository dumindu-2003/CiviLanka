import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import DeathRegisterForm from "./DeathRegisterForm";
import AllDeathApplications from "./AllDeathApplications";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createDeathApplication, loadDeathApplications } from "../../actions/deathAction";
import type { SignOffCredentials } from "../../types/auth";
import type { DeathApplicationPayload, DeathStatus } from "../../types/death";

export default function DeathTestScreen() {
  const dispatch = useAppDispatch();
  const registrations = useAppSelector((state) => state.death.queue);
  const status = useAppSelector((state) => state.death.status);
  /* =====================================================
     SCREEN STATES
  ====================================================== */

  const [showApplication, setShowApplication] =
    useState(false);

  const [showAllApplications, setShowAllApplications] =
    useState(false);
  const [applicationToOpen, setApplicationToOpen] = useState<string | null>(null);
  const [applicationFilter, setApplicationFilter] = useState<DeathStatus | undefined>();

  useEffect(() => {
    void dispatch(loadDeathApplications());
  }, [dispatch]);

  const saveDraft = async (payload: DeathApplicationPayload) => {
    await dispatch(createDeathApplication({ payload, status: "Draft" })).unwrap();
    await dispatch(loadDeathApplications()).unwrap();
    setShowApplication(false);
    Alert.alert("Draft saved", "The death application has been saved.");
  };

  const submitApplication = async (
    payload: DeathApplicationPayload,
    credentials: SignOffCredentials
  ) => {
    await dispatch(
      createDeathApplication({ payload, status: "Pending", credentials })
    ).unwrap();
    await dispatch(loadDeathApplications()).unwrap();
    setShowApplication(false);
    Alert.alert("Application submitted", "The death application was submitted for review.");
  };

  /* =====================================================
     NEW DEATH REGISTRATION
  ====================================================== */

  if (showApplication) {
    return (
      <DeathRegisterForm
        onBack={() => setShowApplication(false)}
        onSaveDraft={saveDraft}
        onSubmit={submitApplication}
      />
    );
  }

  /* =====================================================
     ALL DEATH APPLICATIONS
  ====================================================== */

  if (showAllApplications) {
    return (
      <AllDeathApplications
        onBack={() => {
          setShowAllApplications(false);
          setApplicationToOpen(null);
        }}
        initialApplicationId={applicationToOpen}
        initialStatusFilter={applicationFilter}
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
    setApplicationToOpen(null);
    setApplicationFilter(undefined);
    setShowAllApplications(true);
  };

  const handleFilterApplications = (filter: DeathStatus) => {
    setApplicationToOpen(null);
    setApplicationFilter(filter);
    setShowAllApplications(true);
  };

  const handleViewApplication = (id: string) => {
    setApplicationToOpen(id);
    setShowAllApplications(true);
  };

  const rejectedCount = registrations.filter((item) => item.status === "Rejected").length;
  const pendingCount = registrations.filter((item) => item.status === "Pending").length;
  const approvedCount = registrations.filter((item) => item.status === "Approved").length;

  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FB]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="px-4 pb-3 pt-10">
        <Text className="text-[20px] font-bold text-[#222222]">
          Welcome, Death Registrar
        </Text>
        <Text className="mt-1 text-[13px] text-[#555555]">
          Manage death registrations
        </Text>
      </View>

      <View className="mx-3 flex-row rounded-xl border border-[#E1E5EA] bg-white p-1 shadow-sm">
        <StatCard
          icon="▣"
          number={String(registrations.length)}
          description="Total"
          iconColor="#0B2855"
        />
        <StatCard
          icon="⌛"
          number={String(pendingCount)}
          description="Pending"
          iconColor="#B76E00"
        />
        <StatCard
          icon="✓"
          number={String(approvedCount)}
          description="Approved"
          iconColor="#16804B"
        />
        <StatCard
          icon="×"
          number={String(rejectedCount)}
          description="Rejected"
          iconColor="#C62828"
        />
      </View>

      <View className="px-3 pt-4">
        <Pressable
          onPress={handleNewRegistration}
          className="h-[48px] flex-row items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
        >
          <Text className="mr-2 text-[20px] text-white">⊕</Text>
          <Text className="text-[14px] font-medium text-white">
            New Death Registration
          </Text>
        </Pressable>

        <Pressable
          onPress={handleViewCertificates}
          className="mt-1 h-[48px] flex-row items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
        >
          <Text className="mr-2 text-[17px] text-white">▣</Text>
          <Text className="text-[14px] font-medium text-white">
            View All Death Certificates
          </Text>
        </Pressable>

        <Text className="mt-3 text-[12px] font-bold text-[#292929]">
          Filter by Status
        </Text>
        <View className="mt-2 flex-row gap-2">
          <StatusFilterButton
            label="Pending"
            onPress={() => handleFilterApplications("Pending")}
          />
          <StatusFilterButton
            label="Approved"
            onPress={() => handleFilterApplications("Approved")}
          />
          <StatusFilterButton
            label="Rejected"
            onPress={() => handleFilterApplications("Rejected")}
          />
        </View>
      </View>

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
        ) : registrations.slice(0, 5).map((item) => (
          <DeathRegistrationCard
            key={item.id}
            registration={{
              id: item.id,
              name: item.deceasedName,
              date: item.submittedOn,
              status: item.status,
            }}
            onView={() => handleViewApplication(item.id)}
          />
        ))}
        {status === "failed" && registrations.length === 0 && (
          <Text className="mt-4 text-center text-[11px] text-[#C62828]">
            Unable to load death applications.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

type StatCardProps = {
  icon: string;
  number: string;
  description: string;
  iconColor: string;
};

function StatCard({ icon, number, description, iconColor }: StatCardProps) {
  return (
    <View className="flex-1 items-center px-2 py-3">
      <Text className="text-[18px]" style={{ color: iconColor }}>
        {icon}
      </Text>
      <Text className="mt-1 text-[21px] font-bold text-[#222222]">
        {number}
      </Text>
      <Text className="text-center text-[11px] text-[#888888]">
        {description}
      </Text>
    </View>
  );
}

function StatusFilterButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-[42px] flex-1 items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`View ${label.toLowerCase()} death applications`}
    >
      <Text className="text-[12px] font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

/* =========================================================
   REGISTRATION CARD
========================================================= */

type CardProps = {
  registration: {
    id: string;
    name: string;
    date: string;
    status: "Draft" | "Pending" | "Approved" | "Rejected";
  };
  onView: () => void;
};

function DeathRegistrationCard({
  registration,
  onView,
}: CardProps) {
  const isPending = registration.status === "Pending";
  const isApproved = registration.status === "Approved";
  const isRejected = registration.status === "Rejected";
  const statusLabel = registration.status === "Draft" ? "Open" : registration.status;

  return (
    <View className="mt-3 rounded-lg border border-[#E2E5E9] bg-white px-3 py-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="mr-2 flex-1 flex-row items-center">
          <View className="rounded bg-[#EEEEEE] px-2 py-1">
            <Text className="text-[9px] text-[#777777]">
              {registration.id}
            </Text>
          </View>
          <Text
            className="ml-2 flex-1 text-[13px] font-medium text-[#333333]"
            numberOfLines={1}
          >
            {registration.name}
          </Text>
        </View>

        <View
          className={`rounded px-2 py-1 ${
            isPending
              ? "bg-[#FFF3E0]"
              : isApproved
                ? "bg-[#E8F7EF]"
                : isRejected
                  ? "bg-[#FDECEC]"
                  : "bg-[#F0F2F5]"
          }`}
        >
          <Text
            className={`text-[9px] font-semibold ${
              isPending
                ? "text-[#B76E00]"
                : isApproved
                  ? "text-[#16804B]"
                  : isRejected
                    ? "text-[#C62828]"
                    : "text-[#667085]"
            }`}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="mr-1 text-[13px] text-[#344563]">▣</Text>
          <Text className="text-[10px] text-[#777777]">
            {registration.date}
          </Text>
        </View>
        <Pressable
          onPress={onView}
          className="rounded-md bg-[#0B2855] px-4 py-2 active:opacity-80"
        >
          <Text className="text-[10px] font-medium text-white">View</Text>
        </Pressable>
      </View>
    </View>
  );
}