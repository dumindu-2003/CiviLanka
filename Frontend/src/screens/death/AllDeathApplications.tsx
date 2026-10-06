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

import UpdateDeathApplication from "./UpdateDeathApplication";
import DeathRegisterForm from "./DeathRegisterForm";
import {
  getDeathApplication,
  loadDeathApplications,
  updateDeathApplication,
} from "../../actions/deathAction";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { DeathApplication } from "../../types/death";

type Props = {
  onBack: () => void;
};

export default function AllDeathApplications({
  onBack,
}: Props) {
  const dispatch = useAppDispatch();
  const applications = useAppSelector((state) => state.death.queue);
  const status = useAppSelector((state) => state.death.status);

  const [selectedApplication, setSelectedApplication] =
    useState<DeathApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState(false);

  useEffect(() => {
    void dispatch(loadDeathApplications());
  }, [dispatch]);

  /* =======================================================
     OPEN APPLICATION
  ======================================================= */

  const handleViewApplication = async (application: DeathApplication) => {
    try {
      setSelectedApplication(
        await dispatch(getDeathApplication(application.id)).unwrap()
      );
      setEditingApplication(false);
    } catch (error) {
      Alert.alert(
        "Unable to open application",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  /* =======================================================
     UPDATE APPLICATION
  ======================================================= */

  /* =======================================================
     SHOW UPDATE SCREEN
  ======================================================= */

  if (selectedApplication) {
    if (editingApplication) {
      const { id, status: applicationStatus, submittedOn, ...initialData } = selectedApplication;
      void submittedOn;
      const saveChanges = async (payload: typeof initialData) => {
        await dispatch(updateDeathApplication({
          id,
          payload,
          status: applicationStatus,
        })).unwrap();
        await dispatch(loadDeathApplications()).unwrap();
        setEditingApplication(false);
        setSelectedApplication(null);
        Alert.alert("Application updated", "Death application details were saved.");
      };

      return (
        <DeathRegisterForm
          initialData={initialData}
          onBack={() => setEditingApplication(false)}
          onUpdate={saveChanges}
        />
      );
    }

    return (
      <UpdateDeathApplication
        application={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        onEdit={() => setEditingApplication(true)}
      />
    );
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  const total = applications.length;

  const open = applications.filter((item) => item.status === "Draft").length;

  const approved = applications.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejected = applications.filter(
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

      {/* ===================================================
          HEADER
      ==================================================== */}

      <View className="h-[60px] flex-row items-center bg-[#0B2855] px-4">
        <Pressable
          onPress={onBack}
          className="h-[36px] w-[36px] items-center justify-center rounded-lg bg-white"
        >
          <Text className="text-[25px] text-[#0B2855]">
            ‹
          </Text>
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-bold text-white">
            Death Applications
          </Text>

          <Text className="text-[9px] text-[#D7DFEC]">
            Manage all death registrations
          </Text>
        </View>

        <View className="rounded-md border border-white px-2 py-1">
          <Text className="text-[8px] font-bold text-white">
            ADMIN
          </Text>
        </View>
      </View>

      {/* ===================================================
          CONTENT
      ==================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 30,
        }}
      >
        {/* Page title */}

        <View className="mb-4">
          <Text className="text-[21px] font-bold text-[#171717]">
            All Death Applications
          </Text>

          <Text className="mt-1 text-[10px] text-[#737B87]">
            View and manage submitted death registrations.
          </Text>
        </View>

        {/* =================================================
            SUMMARY CARDS
        ================================================== */}

        <View className="mb-5 flex-row justify-between">
          {/* Total */}

          <View className="w-[23.5%] rounded-xl border border-[#E2E5E9] bg-white p-3">
            <Text className="text-[9px] text-[#737B87]">
              Total
            </Text>

            <Text className="mt-1 text-[21px] font-bold text-[#0B2855]">
              {total}
            </Text>
          </View>

          {/* Open */}

          <View className="w-[23.5%] rounded-xl border border-[#E2E5E9] bg-white p-3">
            <Text className="text-[9px] text-[#737B87]">
              Open
            </Text>

            <Text className="mt-1 text-[21px] font-bold text-[#0B2855]">
              {open}
            </Text>
          </View>

          {/* Approved */}

          <View className="w-[23.5%] rounded-xl border border-[#E2E5E9] bg-white p-3">
            <Text className="text-[9px] text-[#737B87]">
              Approved
            </Text>

            <Text className="mt-1 text-[21px] font-bold text-[#16804B]">
              {approved}
            </Text>
          </View>

          {/* Rejected */}

          <View className="w-[23.5%] rounded-xl border border-[#E2E5E9] bg-white p-3">
            <Text className="text-[9px] text-[#737B87]">
              Rejected
            </Text>

            <Text className="mt-1 text-[21px] font-bold text-[#C62828]">
              {rejected}
            </Text>
          </View>
        </View>

        {/* =================================================
            APPLICATION CARDS
        ================================================== */}

        {status === "loading" && applications.length === 0 ? (
          <ActivityIndicator className="mt-4" />
        ) : applications.map((application) => (
          <DeathApplicationCard
            key={application.id}
            application={application}
            onView={() =>
              handleViewApplication(application)
            }
          />
        ))}
        {status === "failed" && applications.length === 0 && (
          <Text className="text-center text-[12px] text-[#C62828]">
            Unable to load death applications.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   DEATH APPLICATION CARD
========================================================= */

type CardProps = {
  application: DeathApplication;
  onView: () => void;
};

function DeathApplicationCard({
  application,
  onView,
}: CardProps) {
  const statusStyle =
    application.status === "Approved"
      ? {
          background: "bg-[#E8F7EF]",
          border: "border-[#B7E4C7]",
          text: "text-[#16804B]",
        }
      : application.status === "Rejected"
      ? {
          background: "bg-[#FDECEC]",
          border: "border-[#F1B8B8]",
          text: "text-[#C62828]",
        }
      : {
          background: "bg-[#EEF4FF]",
          border: "border-[#C5D7F2]",
          text: "text-[#0B2855]",
        };

  return (
    <View className="mb-4 overflow-hidden rounded-xl border border-[#E0E4EA] bg-white">
      {/* Top blue line */}

      <View className="h-[4px] bg-[#0B2855]" />

      <View className="p-4">
        {/* Header */}

        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-[8px] font-medium text-[#737B87]">
              APPLICATION ID
            </Text>

            <Text className="mt-1 text-[15px] font-bold text-[#0B2855]">
              {application.id}
            </Text>
          </View>

          {/* Status */}

          <View
            className={`rounded-full border px-3 py-1.5 ${statusStyle.background} ${statusStyle.border}`}
          >
            <Text
              className={`text-[9px] font-bold ${statusStyle.text}`}
            >
              {application.status === "Draft" ? "Open" : application.status}
            </Text>
          </View>
        </View>

        <View className="my-3 h-[1px] bg-[#E8EBEF]" />

        {/* Deceased name */}

        <Text className="text-[8px] font-medium text-[#737B87]">
          DECEASED PERSON
        </Text>

        <Text className="mt-1 text-[16px] font-bold text-[#171717]">
          {application.deceasedName}
        </Text>

        {/* Details */}

        <View className="mt-4">
          <DetailRow
            label="NIC"
            value={application.deceasedNic}
          />

          <DetailRow
            label="Date of Death"
            value={application.dateOfDemise}
          />

          <DetailRow
            label="Time of Death"
            value={application.timeOfDemise}
          />

          <DetailRow
            label="Place of Death"
            value={application.placeOfDemise}
          />

          <DetailRow
            label="Informant"
            value={application.informantName}
          />
        </View>

        {/* View button */}

        <Pressable
          onPress={onView}
          className="mt-5 h-[43px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
        >
          <Text className="text-[11px] font-bold text-white">
            View Application
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="mb-2.5 flex-row">
      <Text className="w-[105px] text-[9px] text-[#737B87]">
        {label}
      </Text>

      <Text
        className="flex-1 text-[10px] font-medium text-[#171717]"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}