import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import UpdateDeathApplication from "./UpdateDeathApplication";

export type DeathStatus = "Open" | "Approved" | "Rejected";

export type DeathApplication = {
  id: string;
  deceasedName: string;
  nic: string;
  dateOfBirth: string;
  dateOfDeath: string;
  timeOfDeath: string;
  placeOfDeath: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  deceasedAddress: string;

  informantName: string;
  informantNic: string;
  relationship: string;
  informantContact: string;
  informantAddress: string;

  causeOfDeath: string;

  status: DeathStatus;
};

/* =========================================================
   INITIAL APPLICATION DATA
========================================================= */

const initialApplications: DeathApplication[] = [
  {
    id: "D001",
    deceasedName: "Hewage Don Karunadasa",
    nic: "195412803129V",
    dateOfBirth: "04/12/1954",
    dateOfDeath: "10/28/2024",
    timeOfDeath: "06:45 AM",
    placeOfDeath: "Hospital",
    gender: "Male",
    maritalStatus: "Widowed",
    occupation: "Retired Civil Servant",
    deceasedAddress:
      "No. 42/3, Temple Road, Kalutara North",

    informantName: "Kasun Chamara Jayawardena",
    informantNic: "198224501239",
    relationship: "Son / Daughter",
    informantContact: "+94 77 341 9820",
    informantAddress:
      "No. 42/3A, Flower Road, Colombo 07",

    causeOfDeath: "Natural causes",

    status: "Open",
  },

  {
    id: "D002",
    deceasedName: "Nimal Silva",
    nic: "194812345678V",
    dateOfBirth: "05/18/1948",
    dateOfDeath: "08/28/2026",
    timeOfDeath: "09:20 AM",
    placeOfDeath: "Home",
    gender: "Male",
    maritalStatus: "Married",
    occupation: "Retired Teacher",
    deceasedAddress:
      "No. 15, Main Street, Negombo",

    informantName: "Ruwan Silva",
    informantNic: "197912345678V",
    relationship: "Son",
    informantContact: "+94 71 234 5678",
    informantAddress:
      "No. 15, Main Street, Negombo",

    causeOfDeath: "Medical condition",

    status: "Open",
  },

  {
    id: "D003",
    deceasedName: "Kamala Perera",
    nic: "195512345678V",
    dateOfBirth: "07/11/1955",
    dateOfDeath: "08/25/2026",
    timeOfDeath: "02:15 PM",
    placeOfDeath: "Hospital",
    gender: "Female",
    maritalStatus: "Widowed",
    occupation: "Retired Clerk",
    deceasedAddress:
      "No. 22, Lake Road, Colombo",

    informantName: "Saman Perera",
    informantNic: "198512345678V",
    relationship: "Son",
    informantContact: "+94 76 555 1234",
    informantAddress:
      "No. 22, Lake Road, Colombo",

    causeOfDeath: "Natural causes",

    status: "Approved",
  },

  {
    id: "D004",
    deceasedName: "Sunil Fernando",
    nic: "196012345678V",
    dateOfBirth: "02/08/1960",
    dateOfDeath: "08/20/2026",
    timeOfDeath: "11:30 PM",
    placeOfDeath: "Hospital",
    gender: "Male",
    maritalStatus: "Married",
    occupation: "Business Owner",
    deceasedAddress:
      "No. 8, Church Road, Wattala",

    informantName: "Dilshan Fernando",
    informantNic: "199012345678V",
    relationship: "Son",
    informantContact: "+94 77 888 9999",
    informantAddress:
      "No. 8, Church Road, Wattala",

    causeOfDeath: "Pending medical verification",

    status: "Rejected",
  },
];

type Props = {
  onBack: () => void;
};

export default function AllDeathApplications({
  onBack,
}: Props) {
  const [applications, setApplications] =
    useState<DeathApplication[]>(initialApplications);

  const [selectedApplication, setSelectedApplication] =
    useState<DeathApplication | null>(null);

  /* =======================================================
     OPEN APPLICATION
  ======================================================= */

  const handleViewApplication = (
    application: DeathApplication
  ) => {
    setSelectedApplication(application);
  };

  /* =======================================================
     UPDATE APPLICATION
  ======================================================= */

  const handleUpdateApplication = (
    updatedApplication: DeathApplication
  ) => {
    setApplications((previousApplications) =>
      previousApplications.map((application) =>
        application.id === updatedApplication.id
          ? updatedApplication
          : application
      )
    );

    setSelectedApplication(null);
  };

  /* =======================================================
     SHOW UPDATE SCREEN
  ======================================================= */

  if (selectedApplication) {
    return (
      <UpdateDeathApplication
        application={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        onUpdate={handleUpdateApplication}
      />
    );
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  const total = applications.length;

  const open = applications.filter(
    (item) => item.status === "Open"
  ).length;

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

        {applications.map((application) => (
          <DeathApplicationCard
            key={application.id}
            application={application}
            onView={() =>
              handleViewApplication(application)
            }
          />
        ))}
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
              {application.status}
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
            value={application.nic}
          />

          <DetailRow
            label="Date of Death"
            value={application.dateOfDeath}
          />

          <DetailRow
            label="Time of Death"
            value={application.timeOfDeath}
          />

          <DetailRow
            label="Place of Death"
            value={application.placeOfDeath}
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