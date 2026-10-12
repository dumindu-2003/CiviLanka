import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthorizeSignOffModal } from "../../components/AuthorizeSignOffModal";
import { DatePickerField } from "../../components/DatePickerField";
import { errorMessage } from "../../utils/errorMessage";
import type { SignOffCredentials } from "../../types/auth";
import type { DeathApplicationPayload } from "../../types/death";

type Props = {
  onBack?: () => void;
  initialData?: DeathApplicationPayload;
  onSaveDraft?: (payload: DeathApplicationPayload) => Promise<void>;
  onSubmit?: (
    payload: DeathApplicationPayload,
    credentials: SignOffCredentials
  ) => Promise<void>;
  onUpdate?: (payload: DeathApplicationPayload) => Promise<void>;
};

type FormData = DeathApplicationPayload;

export default function DeathRegisterForm({
  onBack,
  initialData,
  onSaveDraft,
  onSubmit,
  onUpdate,
}: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showSignOff, setShowSignOff] = useState(false);

  const [form, setForm] = useState<FormData>(initialData ?? {
    informantName: "",
    nic: "",
    relationship: "",
    informantContact: "",
    placeOfDemise: "",
    dateOfDemise: "",
    timeOfDemise: "",
    deceasedNic: "",
    deceasedName: "",
    gender: "",
    dateOfBirth: "",
    ageAtDeath: "",
    maritalStatus: "",
    deceasedAddress: "",
    causeOfDeath: "",
  });

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (initialData && onUpdate) {
      void handleUpdate();
    } else {
      setShowSignOff(true);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      if (!onUpdate) throw new Error("Updating is not available on this screen.");
      await onUpdate(form);
    } catch (error) {
      Alert.alert(
        "Unable to update application",
        errorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const save = initialData ? onUpdate : onSaveDraft;
      if (!save) throw new Error("Saving is not available on this screen.");
      await save(form);
    } catch (error) {
      Alert.alert(
        "Unable to save draft",
        errorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSignOff = async (credentials: SignOffCredentials) => {
    setSaving(true);
    try {
      if (!onSubmit) throw new Error("Submission is not available on this screen.");
      await onSubmit(form, credentials);
      setShowSignOff(false);
    } catch (error) {
      Alert.alert(
        "Unable to submit application",
        errorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8FA]"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B2855"
      />

      {/* =====================================================
          HEADER
      ====================================================== */}
      <View className="h-[58px] flex-row items-center bg-[#0B2855] px-3">
        <Pressable
          onPress={handleBack}
          className="h-[34px] w-[34px] items-center justify-center rounded-md bg-white"
        >
          <Text className="text-[22px] font-bold text-[#0B2855]">
            ‹
          </Text>
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold text-white">
            Death Registration
          </Text>

          <Text className="text-[8px] text-[#D5DEEC]">
            Step {step} of 2 • Application
          </Text>
        </View>

        <View className="h-[27px] w-[27px] items-center justify-center rounded-full border border-white">
          <Text className="text-[10px] text-white">
            ●
          </Text>
        </View>
      </View>

      {/* =====================================================
          PROGRESS
      ====================================================== */}
      <View className="bg-[#0B2855] px-3 pb-3">
        <View className="h-[5px] overflow-hidden rounded-full bg-[#566B8A]">
          <View
            className="h-full rounded-full bg-white"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </View>

        <View className="mt-2 flex-row justify-between">
          <ProgressItem
            title="Informant & Demise"
            active={step === 1}
            completed={step > 1}
          />
          <ProgressItem
            title="Deceased Details"
            active={step === 2}
            completed={false}
          />
        </View>
      </View>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 20,
        }}
      >
        {step === 1 ? (
          <StepOne
            form={form}
            updateField={updateField}
          />
        ) : (
          <StepTwo
            form={form}
            updateField={updateField}
          />
        )}

      </ScrollView>

      {/* =================================================
          FOOTER
      ================================================== */}
      <View className="border-t border-[#DDE2E8] bg-white px-3 py-2">
        {step === 1 ? (
          <>
            <Pressable
              onPress={handleNext}
              disabled={saving}
              className="h-[42px] items-center justify-center rounded-md bg-[#0B2855] active:opacity-80"
            >
              <Text className="text-[11px] font-semibold text-white">
                Next: Deceased Details  →
              </Text>
            </Pressable>

            <View className="mt-1 flex-row">
              <Pressable
                onPress={handleBack}
                disabled={saving}
                className="mr-1 h-[38px] flex-1 items-center justify-center rounded-md border border-[#0B2855] bg-white"
              >
                <Text className="text-[10px] font-medium text-[#0B2855]">
                  ← Back
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveDraft}
                disabled={saving}
                className="ml-1 h-[38px] flex-1 items-center justify-center rounded-md bg-[#0B2855]"
              >
                <Text className="text-[10px] font-medium text-white">
                  {initialData ? "Save Changes" : "▣ Save as Draft"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Pressable
              onPress={handleNext}
              disabled={saving}
              className="h-[42px] items-center justify-center rounded-md bg-[#0B2855]"
            >
              <Text className="text-[11px] font-semibold text-white">
                {initialData ? "Save Death Application Changes" : "Submit Death Registration"}
              </Text>
            </Pressable>

            <View className="mt-1 flex-row">
              <Pressable
                onPress={handleBack}
                disabled={saving}
                className="mr-1 h-[38px] flex-1 items-center justify-center rounded-md border border-[#0B2855] bg-white"
              >
                <Text className="text-[10px] font-medium text-[#0B2855]">
                  ← Back to Informant Details
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveDraft}
                disabled={saving}
                className="ml-1 h-[38px] flex-1 items-center justify-center rounded-md bg-[#0B2855]"
              >
                <Text className="text-[10px] font-medium text-white">
                  {initialData ? "Save Changes" : "▣ Save as Draft"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
      <AuthorizeSignOffModal
        visible={showSignOff && !initialData}
        title="Authorize death registration"
        onCancel={() => setShowSignOff(false)}
        onConfirm={(credentials) => void handleConfirmSignOff(credentials)}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   STEP 1
========================================================= */

function StepOne({
  form,
  updateField,
}: {
  form: FormData;
  updateField: (field: keyof FormData, value: string) => void;
}) {
  return (
    <View>
      <StepHeading
        step="1"
        title="Informant & Demise Details"
        percentage="50% Completed"
      />

      <FormCard
        title="Informant's Details"
        badge="INFORMANT"
      >
        <InputField
          label="Informant's Full Legal Name"
          value={form.informantName}
          onChangeText={(value) => updateField("informantName", value)}
        />

        <InputField
          label="National Identity Card (NIC) / Passport No."
          value={form.nic}
          onChangeText={(value) => updateField("nic", value)}
        />

        <InputField
          label="Relationship to Deceased"
          value={form.relationship}
          onChangeText={(value) => updateField("relationship", value)}
        />

        <InputField
          label="Informant's Contact Number"
          value={form.informantContact}
          onChangeText={(value) => updateField("informantContact", value)}
          keyboardType="phone-pad"
        />
      </FormCard>

      <FormCard
        title="Demise Context"
        badge="INCIDENT DETAILS"
      >
        <InputField
          label="Immediate Place of Demise"
          value={form.placeOfDemise}
          onChangeText={(value) => updateField("placeOfDemise", value)}
        />

        <DateInputField
          label="Date of Demise"
          value={form.dateOfDemise}
          onChangeText={(value) => updateField("dateOfDemise", value)}
        />

        <InputField
          label="Time of Demise"
          value={form.timeOfDemise}
          placeholder="HH:mm"
          onChangeText={(value) => updateField("timeOfDemise", value)}
        />

        <View className="mt-1 rounded-md bg-[#F1F3F6] p-2">
          <Text className="text-[8px] leading-4 text-[#687385]">
            Medical Certificate of Cause of Death (Form B-4) issued by the
            attending physician or hospital registrar is required for final
            registration.
          </Text>
        </View>
      </FormCard>
    </View>
  );
}

/* =========================================================
   STEP 2
========================================================= */

function StepTwo({
  form,
  updateField,
}: {
  form: FormData;
  updateField: (field: keyof FormData, value: string) => void;
}) {
  return (
    <View>
      <StepHeading
        step="2"
        title="Deceased Details"
        percentage="100% Completed"
      />

      <View className="mb-3 flex-row rounded-md border border-[#DDE2E8] bg-white p-2">
        <SmallTab text="Informant & Demise" active={false} />
        <SmallTab text="Deceased Details" active />
      </View>

      <FormCard
        title="Deceased Person's Particulars"
        badge="OFFICIAL RECORD"
      >
        <InputField
          label="NIC / Identity Number"
          value={form.deceasedNic}
          onChangeText={(value) => updateField("deceasedNic", value)}
        />

        <InputField
          label="Full Legal Name"
          value={form.deceasedName}
          onChangeText={(value) => updateField("deceasedName", value)}
        />

        <FieldLabel label="Gender Assigned" />
        <View className="flex-row">
          <GenderButton
            label="♂ Male"
            active={form.gender === "Male"}
            onPress={() => updateField("gender", "Male")}
          />
          <GenderButton
            label="♀ Female"
            active={form.gender === "Female"}
            onPress={() => updateField("gender", "Female")}
          />
        </View>

        <DateInputField
          label="Date of Birth"
          value={form.dateOfBirth}
          onChangeText={(value) => updateField("dateOfBirth", value)}
        />

        <InputField
          label="Age at Demise"
          value={form.ageAtDeath}
          onChangeText={(value) => updateField("ageAtDeath", value)}
          keyboardType="numeric"
        />

        <InputField
          label="Marital Status"
          value={form.maritalStatus}
          onChangeText={(value) => updateField("maritalStatus", value)}
        />

        <InputField
          label="Permanent Residential Address"
          value={form.deceasedAddress}
          onChangeText={(value) => updateField("deceasedAddress", value)}
          multiline
        />
      </FormCard>

      <FormCard
        title="Cause & Circumstances"
        badge="FORM B-4"
      >
        <InputField
          label="Cause of Demise (Medical Assessment)"
          value={form.causeOfDeath}
          onChangeText={(value) => updateField("causeOfDeath", value)}
          placeholder="Enter cause of death"
          multiline
        />

        <View className="mt-1 rounded-md bg-[#F1F3F6] p-2">
          <Text className="text-[8px] leading-4 text-[#687385]">
            The Medical Certificate of Cause of Death (Form B-4) must be
            verified before final registration.
          </Text>
        </View>
      </FormCard>
    </View>
  );
}

/* =========================================================
   STEP HEADING
========================================================= */

function StepHeading({
  step,
  title,
  percentage,
}: {
  step: string;
  title: string;
  percentage: string;
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[8px] text-[#7A8491]">Step {step} of 2</Text>
        <View className="rounded-full bg-[#E9EDF2] px-2 py-1">
          <Text className="text-[7px] font-semibold text-[#526174]">
            {percentage}
          </Text>
        </View>
      </View>
      <Text className="mt-1 text-[18px] font-bold text-[#25334A]">{title}</Text>
    </View>
  );
}

function ProgressItem({
  title,
  active,
  completed,
}: {
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <View className="flex-row items-center">
      {completed ? <Text className="mr-1 text-[8px] text-white">✓</Text> : null}
      <Text
        className={`text-[7px] ${
          active || completed
            ? "font-semibold text-white"
            : "text-[#AEBACB]"
        }`}
      >
        {title}
      </Text>
    </View>
  );
}

function SmallTab({ text, active }: { text: string; active: boolean }) {
  return (
    <View className="flex-1 items-center">
      <Text
        className={`text-[7px] ${
          active
            ? "font-semibold text-[#0B2855]"
            : "text-[#7C8795]"
        }`}
      >
        {text}
      </Text>
    </View>
  );
}

/* =========================================================
   FORM CARD
========================================================= */

function FormCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3 rounded-lg border border-[#E0E4E9] bg-white p-3">
      <View className="mb-3 flex-row items-start justify-between">
        <Text className="flex-1 text-[12px] font-bold text-[#26344A]">
          {title}
        </Text>
        {badge ? (
          <View className="rounded-full bg-[#F0F2F5] px-2 py-1">
            <Text className="text-[7px] font-medium text-[#667085]">{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <View className="mb-1 flex-row items-center">
      <Text className="text-[8px] font-medium text-[#687385]">{label}</Text>
      {required ? <Text className="ml-1 text-[8px] text-[#D1495B]">*</Text> : null}
    </View>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "numeric";
}) {
  return (
    <View className="mb-3">
      <FieldLabel label={label} />
      <View
        className={`flex-row rounded-md border border-[#D9DEE5] bg-[#F8F9FB] ${
          multiline ? "min-h-[58px]" : "h-[38px]"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9BA3AE"
          multiline={multiline}
          keyboardType={keyboardType ?? "default"}
          textAlignVertical={multiline ? "top" : "center"}
          className={`flex-1 px-3 text-[9px] text-[#30343B] ${
            multiline ? "py-2" : "py-0"
          }`}
        />
      </View>
    </View>
  );
}

function DateInputField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View className="mb-3">
      <FieldLabel label={label} />
      <DatePickerField
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
      />
    </View>
  );
}

function GenderButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-1 h-[34px] flex-1 items-center justify-center rounded-md ${
        active ? "bg-[#0B2855]" : "border border-[#D8DEE6] bg-white"
      }`}
    >
      <Text
        className={`text-[9px] font-medium ${
          active ? "text-white" : "text-[#344563]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
