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
import type { AlertButton } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import UpdateBirthApplication from "./UpdateBirthApplication";
import BirthApplicationForm from "./BirthApplicationForm";
import {
  getBirthApplication,
  loadBirthApplications,
} from "../../actions/birthAction";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type {
  BirthApplication,
  BirthApplicationPayload,
  BirthStatus,
} from "../../types/birth";

type Props = {
  onBack: () => void;
  initialApplicationId?: string | null;
  initialStatusFilter?: BirthStatus;
};

function toBirthPayload(application: BirthApplication): BirthApplicationPayload {
  const {
    babyName,
    birthDate,
    birthTime,
    birthPlace,
    gender,
    birthWeight,
    fatherName,
    fatherNic,
    fatherOccupation,
    fatherAddress,
    motherName,
    motherNic,
    motherOccupation,
    motherAddress,
    hospitalName,
    registrationDate,
  } = application;
  return {
    babyName,
    birthDate,
    birthTime,
    birthPlace,
    gender,
    birthWeight,
    fatherName,
    fatherNic,
    fatherOccupation,
    fatherAddress,
    motherName,
    motherNic,
    motherOccupation,
    motherAddress,
    hospitalName,
    registrationDate,
  };
}

export default function AllBirthAplications({
  onBack,
  initialApplicationId,
  initialStatusFilter,
}: Props) {
  const dispatch = useAppDispatch();
  const registrations = useAppSelector((state) => state.birth.queue);
  const status = useAppSelector((state) => state.birth.status);
  const [selectedApplication, setSelectedApplication] =
    useState<BirthApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState(false);
  const [hiddenRejectedIds, setHiddenRejectedIds] = useState<string[]>([]);
  const visibleRegistrations = registrations.filter(
    (registration) => !hiddenRejectedIds.includes(registration.id)
  );
  const displayedRegistrations = initialStatusFilter
    ? visibleRegistrations.filter((registration) => registration.status === initialStatusFilter)
    : visibleRegistrations;

  useEffect(() => {
    void dispatch(loadBirthApplications());
  }, [dispatch]);

  // Open selected application
  const handleViewApplication = async (registration: BirthApplication) => {
    try {
      setSelectedApplication(await dispatch(getBirthApplication(registration.id)).unwrap());
      setEditingApplication(false);
    } catch (error) {
      Alert.alert(
        "Unable to open application",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const handleDeleteRejectedApplication = (registration: BirthApplication) => {
    const buttons: AlertButton[] = [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setHiddenRejectedIds((ids) =>
            ids.includes(registration.id) ? ids : [...ids, registration.id]
          ),
      },
    ];
    Alert.alert(
      "Remove rejected application?",
      "This removes the application from this screen only. It will not be deleted from the server.",
      buttons
    );
  };

  useEffect(() => {
    if (!initialApplicationId) return;
    let active = true;
    dispatch(getBirthApplication(initialApplicationId))
      .unwrap()
      .then((application) => {
        if (active) {
          setSelectedApplication(application);
          setEditingApplication(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          Alert.alert(
            "Unable to open application",
            error instanceof Error ? error.message : "Please try again."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [dispatch, initialApplicationId]);

  // If an application is selected,
  // show UpdateBirthApplication screen
  if (selectedApplication) {
    if (editingApplication) {
      const initialData = toBirthPayload(selectedApplication);
      const saveChanges = async (payload: BirthApplicationPayload) => {
        setSelectedApplication((application) =>
          application ? { ...application, ...payload } : application
        );
        setEditingApplication(false);
        Alert.alert(
          "Application updated"
        );
      };

      return (
        <BirthApplicationForm
          initialData={initialData}
          onBack={() => setEditingApplication(false)}
          onUpdate={saveChanges}
        />
      );
    }

    return (
      <UpdateBirthApplication
        registration={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        onEdit={() => setEditingApplication(true)}
      />
    );
  }

  // Counts
  const totalCount = visibleRegistrations.length;

  const openCount = visibleRegistrations.filter((item) => item.status === "Pending").length;

  const approvedCount = visibleRegistrations.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = visibleRegistrations.filter(
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
              Pending
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
          {status === "loading" && displayedRegistrations.length === 0 ? (
            <ActivityIndicator className="mt-4" />
          ) : displayedRegistrations.map((registration) => (
            <BirthApplicationCard
              key={registration.id}
              registration={registration}
              onView={() =>
                handleViewApplication(registration)
              }
              onDelete={() => handleDeleteRejectedApplication(registration)}
            />
          ))}
        </View>

        {/* Empty State */}
        {status === "failed" && displayedRegistrations.length === 0 && (
          <Text className="text-center text-[12px] text-[#C62828]">
            Unable to load birth applications.
          </Text>
        )}

        {status !== "loading" && displayedRegistrations.length === 0 && (
          <View className="items-center rounded-xl border border-[#E3E7ED] bg-white px-5 py-10">
            <Text className="text-[16px] font-bold text-[#171717]">
              {initialStatusFilter ? `No ${initialStatusFilter} Applications` : "No Applications"}
            </Text>

            <Text className="mt-1 text-center text-[11px] text-[#737B87]">
              {initialStatusFilter
                ? `There are no ${initialStatusFilter.toLowerCase()} birth applications available.`
                : "There are no birth registration applications available."}
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
  registration: BirthApplication;
  onView: () => void;
  onDelete: () => void;
};

function BirthApplicationCard({
  registration,
  onView,
  onDelete,
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
              {registration.status === "Draft" ? "Open" : registration.status}
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
                Father&apos;s Name
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
                Mother&apos;s Name
              </Text>
            </View>

            <Text className="flex-1 text-[11px] font-medium text-[#171717]">
              {registration.motherName}
            </Text>
          </View>
        </View>

        {/* ================= VIEW BUTTON ================= */}
        <View className="mt-5 flex-row gap-2">
          <Pressable
            onPress={onView}
            className="h-[44px] flex-1 items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="text-[12px] font-bold text-white">
              View Application
            </Text>
          </Pressable>
          {registration.status === "Rejected" ? (
            <Pressable
              onPress={onDelete}
              className="h-[44px] items-center justify-center rounded-lg border border-[#C62828] px-4 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`Remove rejected application ${registration.id} from this screen`}
            >
              <Text className="text-[12px] font-bold text-[#C62828]">
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}