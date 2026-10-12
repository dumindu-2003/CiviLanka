import React, { useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

import UpdateDeathApplication from "./UpdateDeathApplication";
import { decideDeathApplication } from "../../actions/deathAction";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deathService, getDeathList, type DeathListItem } from "../../services/deathService";
import type { DeathApplication, DeathApplicationPayload } from "../../types/death";
import { errorMessage } from "../../utils/errorMessage";

type Props = {
  onBack: () => void;
  onCreateRegistration: (payload: DeathApplicationPayload) => void;
};

function toPayload(application: DeathApplication): DeathApplicationPayload {
  return {
    informantName: application.informantName,
    nic: application.nic,
    relationship: application.relationship,
    informantContact: application.informantContact,
    placeOfDemise: application.placeOfDemise,
    dateOfDemise: application.dateOfDemise,
    timeOfDemise: application.timeOfDemise,
    deceasedNic: application.deceasedNic,
    deceasedName: application.deceasedName,
    gender: application.gender,
    dateOfBirth: application.dateOfBirth,
    ageAtDeath: application.ageAtDeath,
    causeOfDeath: application.causeOfDeath,
    maritalStatus: application.maritalStatus,
    deceasedAddress: application.deceasedAddress,
  };
}

export default function VillageDeathReportScreen({ onBack, onCreateRegistration }: Props) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [rows, setRows] = useState<DeathListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DeathApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = (await getDeathList()) ?? [];
      setRows(list.filter((row) => row.submitted_by != null && String(row.submitted_by) !== userId));
    } catch (error) {
      Alert.alert("Unable to load death reports", errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openReport = async (row: DeathListItem) => {
    try {
      setSelected(await deathService.get(String(row.app_id)));
    } catch (error) {
      Alert.alert("Unable to open the report", errorMessage(error));
    }
  };

  if (selected) {
    const canDecide = selected.status === "Pending";
    return (
      <UpdateDeathApplication
        application={selected}
        canEdit={false}
        heading="Death Report"
        description="Full details sent by the Village Officer."
        onBack={() => setSelected(null)}
        onEdit={() => undefined}
        onApprove={
          canDecide
            ? async () => {
                try {
                  await dispatch(decideDeathApplication({
                    id: selected.id,
                    status: "Approved",
                  })).unwrap();
                  setSelected({ ...selected, status: "Approved", rejectionReason: "" });
                  Alert.alert("Report approved", "You can now start a new death registration with these details.");
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
                    id: selected.id,
                    status: "Rejected",
                    reason,
                  })).unwrap();
                  setSelected({ ...selected, status: "Rejected", rejectionReason: reason });
                  Alert.alert("Report rejected", "The Village Officer can correct this report and send it again.");
                } catch (error) {
                  Alert.alert("Unable to reject", errorMessage(error));
                }
              }
            : undefined
        }
        onCreateRegistration={
          selected.status === "Approved"
            ? () => onCreateRegistration(toPayload(selected))
            : undefined
        }
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2855" />
      <View className="h-[60px] flex-row items-center bg-[#0B2855] px-4">
        <Pressable
          onPress={onBack}
          className="h-[36px] w-[36px] items-center justify-center rounded-lg bg-white"
        >
          <Text className="text-[25px] text-[#0B2855]">‹</Text>
        </Pressable>
        <Text className="ml-3 flex-1 text-[16px] font-bold text-white">Death Reports</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 text-[12px] text-[#666666]">
          Reports sent by the Village Officer. Open one to see the full details.
        </Text>
        {loading ? (
          <ActivityIndicator className="mt-6" color="#0B2855" />
        ) : rows.length === 0 ? (
          <Text className="mt-4 text-[13px] text-[#666666]">No death reports have been sent yet.</Text>
        ) : (
          rows.map((row) => (
            <Pressable
              key={row.app_id}
              onPress={() => void openReport(row)}
              className="mb-3 rounded-xl border border-[#E0E4EA] bg-white p-4"
            >
              <Text className="text-[15px] font-bold text-[#171717]">{row.name || "—"}</Text>
              <Text className="mt-1 text-[11px] text-[#737B87]">
                {row.app_ref} • {row.status}
              </Text>
              <Text className="mt-3 text-[12px] font-bold text-[#0B2855]">View full details</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
