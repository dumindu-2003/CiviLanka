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

import UpdateDeathApplication from "./UpdateDeathApplication";
import DeathRegisterForm from "./DeathRegisterForm";
import {
  decideDeathApplication,
  getDeathApplication,
  loadDeathApplications,
} from "../../actions/deathAction";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { errorMessage } from "../../utils/errorMessage";
import type {
  DeathApplication,
  DeathApplicationPayload,
  DeathStatus,
} from "../../types/death";

type Props = {
  onBack: () => void;
  initialApplicationId?: string | null;
  initialStatusFilter?: DeathStatus;
};

function toDeathPayload(application: DeathApplication): DeathApplicationPayload {
  const {
    informantName,
    nic,
    relationship,
    informantContact,
    placeOfDemise,
    dateOfDemise,
    timeOfDemise,
    deceasedNic,
    deceasedName,
    gender,
    dateOfBirth,
    ageAtDeath,
    causeOfDeath,
    maritalStatus,
    deceasedAddress,
  } = application;
  return {
    informantName,
    nic,
    relationship,
    informantContact,
    placeOfDemise,
    dateOfDemise,
    timeOfDemise,
    deceasedNic,
    deceasedName,
    gender,
    dateOfBirth,
    ageAtDeath,
    causeOfDeath,
    maritalStatus,
    deceasedAddress,
  };
}

export default function AllDeathApplications({
  onBack,
  initialApplicationId,
  initialStatusFilter,
}: Props) {
  const dispatch = useAppDispatch();
  const applications = useAppSelector((state) => state.death.queue);
  const status = useAppSelector((state) => state.death.status);
  const user = useAppSelector((state) => state.auth.user);

  const [selectedApplication, setSelectedApplication] =
    useState<DeathApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState(false);
  const [hiddenRejectedIds, setHiddenRejectedIds] = useState<string[]>([]);
  const visibleApplications = applications.filter(
    (application) => !hiddenRejectedIds.includes(application.id)
  );
  const displayedApplications = initialStatusFilter
    ? visibleApplications.filter((application) => application.status === initialStatusFilter)
    : visibleApplications;

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

  const handleDeleteRejectedApplication = (application: DeathApplication) => {
    const buttons: AlertButton[] = [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setHiddenRejectedIds((ids) =>
            ids.includes(application.id) ? ids : [...ids, application.id]
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
    dispatch(getDeathApplication(initialApplicationId))
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

  /* =======================================================
     UPDATE APPLICATION
  ======================================================= */

  /* =======================================================
     SHOW UPDATE SCREEN
  ======================================================= */

  if (selectedApplication) {
    if (editingApplication) {
      const initialData = toDeathPayload(selectedApplication);
      const saveChanges = async (payload: DeathApplicationPayload) => {
        setSelectedApplication((application) =>
          application ? { ...application, ...payload } : application
        );
        setEditingApplication(false);
        Alert.alert(
          "Application updated",
        );
      };

      return (
        <DeathRegisterForm
          initialData={initialData}
          onBack={() => setEditingApplication(false)}
          onUpdate={saveChanges}
        />
      );
    }

    const canEdit =
      selectedApplication.submittedBy === user?.id &&
      selectedApplication.status !== "Approved";
    const canDecide =
      user?.role === "DEATH_REGISTRAR" && selectedApplication.status === "Pending";
    const refreshAfterDecision = async (message: string) => {
      await dispatch(loadDeathApplications()).unwrap();
      setSelectedApplication(null);
      Alert.alert("Death report updated", message);
    };

    return (
      <UpdateDeathApplication
        application={selectedApplication}
        canEdit={canEdit}
        onBack={() => setSelectedApplication(null)}
        onEdit={() => setEditingApplication(true)}
        onApprove={
          canDecide
            ? async () => {
                try {
                  await dispatch(decideDeathApplication({
                    id: selectedApplication.id,
                    status: "Approved",
                  })).unwrap();
                  await refreshAfterDecision("The death report is approved. It can no longer be edited.");
                } catch (error) {
                  Alert.alert("Unable to approve", errorMessage(error));
                }
              }
            : undefined
        }
        onReject={
          canDecide
            ? async (reason) => {
                try {
                  await dispatch(decideDeathApplication({
                    id: selectedApplication.id,
                    status: "Rejected",
                    reason,
                  })).unwrap();
                  await refreshAfterDecision("The death report was rejected. The village officer can correct and send it again.");
                } catch (error) {
                  Alert.alert("Unable to reject", errorMessage(error));
                }
              }
            : undefined
        }
      />
    );
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  const total = visibleApplications.length;

  const open = visibleApplications.filter((item) => item.status === "Pending").length;

  const approved = visibleApplications.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejected = visibleApplications.filter(
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
              Pending
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

        {status === "loading" && displayedApplications.length === 0 ? (
          <ActivityIndicator className="mt-4" />
        ) : displayedApplications.map((application) => (
          <DeathApplicationCard
            key={application.id}
            application={application}
            incoming={application.submittedBy !== '' && application.submittedBy !== user?.id}
            onView={() =>
              handleViewApplication(application)
            }
            onDelete={() => handleDeleteRejectedApplication(application)}
          />
        ))}
        {status === "failed" && displayedApplications.length === 0 && (
          <Text className="text-center text-[12px] text-[#C62828]">
            Unable to load death applications.
          </Text>
        )}
        {status !== "loading" && displayedApplications.length === 0 ? (
          <View className="mt-4 items-center rounded-xl border border-[#E3E7ED] bg-white px-5 py-10">
            <Text className="text-[16px] font-bold text-[#171717]">
              {initialStatusFilter ? `No ${initialStatusFilter} Applications` : "No Applications"}
            </Text>
            <Text className="mt-1 text-center text-[11px] text-[#737B87]">
              {initialStatusFilter
                ? `There are no ${initialStatusFilter.toLowerCase()} death applications available.`
                : "There are no death registration applications available."}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   DEATH APPLICATION CARD
========================================================= */

type CardProps = {
  application: DeathApplication;
  incoming?: boolean;
  onView: () => void;
  onDelete: () => void;
};

function DeathApplicationCard({
  application,
  incoming = false,
  onView,
  onDelete,
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
        {incoming ? (
          <Text className="mt-1 text-[10px] font-bold text-[#8A6A00]">
            Sent by a Village Officer
          </Text>
        ) : null}

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

        <View className="mt-5 flex-row gap-2">
          <Pressable
            onPress={onView}
            className="h-[43px] flex-1 items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="text-[11px] font-bold text-white">
              View Application
            </Text>
          </Pressable>
          {application.status === "Rejected" ? (
            <Pressable
              onPress={onDelete}
              className="h-[43px] items-center justify-center rounded-lg border border-[#C62828] px-4 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`Remove rejected application ${application.id} from this screen`}
            >
              <Text className="text-[11px] font-bold text-[#C62828]">
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
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