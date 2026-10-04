import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onBack?: () => void;
};

type FormData = {
  certificateType: string;

  informantName: string;
  nic: string;
  relationship: string;
  informantContact: string;
  informantAddress: string;

  placeOfDemise: string;
  dateOfDemise: string;
  timeOfDemise: string;

  deceasedNic: string;
  deceasedName: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  occupation: string;
  deceasedAddress: string;

  causeOfDeath: string;
};

export default function DeathRegisterForm({ onBack }: Props) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormData>({
    certificateType: "Death Certificate (Official Notification)",

    informantName: "Kasun Chamara Jayawardena",
    nic: "198224501239",
    relationship: "Son / Daughter",
    informantContact: "+94 77 341 9820",
    informantAddress: "No. 42/3A, Flower Road, Colombo 07",

    placeOfDemise: "Hospital",
    dateOfDemise: "10/28/2024",
    timeOfDemise: "06:45 AM",

    deceasedNic: "195412803129V",
    deceasedName: "Hewage Don Karunadasa",
    gender: "Male",
    dateOfBirth: "04/12/1954",
    maritalStatus: "Widowed",
    occupation: "Retired Civil Servant",
    deceasedAddress: "No. 42/3, Temple Road, Kalutara North",

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
    } else {
      console.log("Death Registration Submitted:", form);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSaveDraft = () => {
    console.log("Death Registration Draft:", form);
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
          <Text className="text-[9px] font-medium tracking-[0.5px] text-white">
            DEATH REGISTRATION - STEP {step}:{" "}
            {step === 1
              ? "INFORMANT & DEMISE"
              : "DECEASED DETAILS"}
          </Text>

          <Text className="mt-1 text-[7px] text-[#D7DFEC]">
            Official Death Registration Application
          </Text>
        </View>

        <View className="h-[25px] w-[25px] items-center justify-center rounded-full bg-black">
          <Text className="text-[11px] text-white">
            ♙
          </Text>
        </View>
      </View>

      {/* =====================================================
          PROGRESS
      ====================================================== */}
      <View className="border-b border-[#DDE2E8] bg-white px-3 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-[25px] w-[25px] items-center justify-center rounded-full bg-[#0B2855]">
              <Text className="text-[10px] font-bold text-white">
                {step}
              </Text>
            </View>

            <View className="ml-2">
              <Text className="text-[8px] text-[#555555]">
                Application Step {step} of 2
              </Text>

              <Text className="text-[14px] font-bold text-[#171717]">
                {step === 1
                  ? "Informant & Applicant Details"
                  : "Deceased Legal Particulars"}
              </Text>
            </View>
          </View>

          <View className="rounded-full bg-[#EEEEF0] px-3 py-1">
            <Text className="text-[8px] font-bold text-[#777777]">
              {step === 1 ? "50%" : "100%"}
            </Text>

            <Text className="text-[7px] text-[#777777]">
              COMPLETE
            </Text>
          </View>
        </View>

        {/* Progress line */}
        <View className="mt-3 h-[4px] overflow-hidden rounded-full bg-[#DDE2E8]">
          <View
            className={`h-full rounded-full bg-[#0B2855] ${
              step === 1 ? "w-1/2" : "w-full"
            }`}
          />
        </View>

        {/* Step indicators */}
        <View className="mt-2 flex-row justify-between">
          <Text
            className={`text-[7px] ${
              step === 1
                ? "font-bold text-[#0B2855]"
                : "text-[#777777]"
            }`}
          >
            ① Informant
          </Text>

          <Text
            className={`text-[7px] ${
              step === 2
                ? "font-bold text-[#0B2855]"
                : "text-[#777777]"
            }`}
          >
            ② Deceased
          </Text>
        </View>
      </View>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 30,
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

        {/* =================================================
            BUTTONS
        ================================================== */}

        <View className="mt-4">
          {/* Next / Submit */}
          <Pressable
            onPress={handleNext}
            className="h-[42px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="text-[11px] font-bold text-white">
              {step === 1
                ? "Next: Deceased Details →"
                : "Submit Death Registration"}
            </Text>
          </Pressable>

          {/* Save Draft */}
          <Pressable
            onPress={handleSaveDraft}
            className="mt-2 h-[42px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="text-[11px] font-bold text-white">
              ▣ Save as Draft
            </Text>
          </Pressable>

          {/* Back on Step 2 */}
          {step === 2 && (
            <Pressable
              onPress={handleBack}
              className="mt-2 h-[42px] items-center justify-center rounded-lg border border-[#0B2855] bg-white"
            >
              <Text className="text-[11px] font-bold text-[#0B2855]">
                ← Back to Informant Details
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
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
  updateField: (
    field: keyof FormData,
    value: string
  ) => void;
}) {
  return (
    <View>
      {/* Certificate Type */}
      <SectionCard
        title="Certificate Type"
        badge=""
      >
        <FieldLabel text="Certificate Type" />

        <SelectField
          value={form.certificateType}
          onPress={() =>
            updateField(
              "certificateType",
              "Death Certificate (Official Notification)"
            )
          }
        />
      </SectionCard>

      {/* Informant */}
      <SectionCard
        title="Informant's Details"
        badge="PARTY LODGING"
      >
        <FieldLabel text="Informant's Full Legal Name" />

        <InputField
          value={form.informantName}
          onChangeText={(value) =>
            updateField("informantName", value)
          }
        />

        <FieldLabel text="National Identity Card (NIC) / Passport No." />

        <InputField
          value={form.nic}
          onChangeText={(value) =>
            updateField("nic", value)
          }
        />

        <FieldLabel text="Relationship to Deceased" />

        <SelectField
          value={form.relationship}
          onPress={() =>
            updateField(
              "relationship",
              "Son / Daughter"
            )
          }
        />

        <FieldLabel text="Informant's Contact Number" />

        <InputField
          value={form.informantContact}
          onChangeText={(value) =>
            updateField(
              "informantContact",
              value
            )
          }
          keyboardType="phone-pad"
        />

        <FieldLabel text="Informant's Permanent Residential Address" />

        <InputField
          value={form.informantAddress}
          onChangeText={(value) =>
            updateField(
              "informantAddress",
              value
            )
          }
          multiline
          height={58}
        />
      </SectionCard>

      {/* Demise Context */}
      <SectionCard
        title="Demise Context"
        badge="INCIDENT DETAILS"
      >
        <FieldLabel text="Immediate Place of Demise" />

        <SelectField
          value={form.placeOfDemise}
          onPress={() =>
            updateField(
              "placeOfDemise",
              "Hospital"
            )
          }
        />

        <FieldLabel text="Date of Demise" />

        <InputField
          value={form.dateOfDemise}
          onChangeText={(value) =>
            updateField(
              "dateOfDemise",
              value
            )
          }
          rightText="●"
        />

        <FieldLabel text="Time of Demise" />

        <InputField
          value={form.timeOfDemise}
          onChangeText={(value) =>
            updateField(
              "timeOfDemise",
              value
            )
          }
          rightText="●"
        />

        {/* Medical note */}
        <View className="mt-2 rounded-md border border-[#D8E1EA] bg-[#F1F6FA] px-2.5 py-2">
          <Text className="text-[8px] leading-[12px] text-[#596A7B]">
            ⓘ Medical Certificate of Cause of Death
            (Form B-4) issued by the attending physician
            or hospital registrar will be required in Step 3.
          </Text>
        </View>
      </SectionCard>
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
  updateField: (
    field: keyof FormData,
    value: string
  ) => void;
}) {
  return (
    <View>
      {/* Deceased Legal Particulars */}
      <SectionCard
        title="Deceased Person's Particulars"
        badge="OFFICIAL RECORD"
      >
        {/* NIC */}
        <FieldLabel text="NIC / Identity Number" />

        <View className="flex-row items-center">
          <View className="flex-1">
            <InputField
              value={form.deceasedNic}
              onChangeText={(value) =>
                updateField(
                  "deceasedNic",
                  value
                )
              }
            />
          </View>

          <View className="ml-2 rounded-md bg-[#EEF5EE] px-2 py-2">
            <Text className="text-[7px] font-bold text-[#315D35]">
              ✓ VERIFIED
            </Text>
          </View>
        </View>

        <Text className="mb-3 mt-1 text-[7px] text-[#7A8088]">
          Auto-synced with National Registration Registry
        </Text>

        {/* Name */}
        <FieldLabel text="Full Legal Name" />

        <InputField
          value={form.deceasedName}
          onChangeText={(value) =>
            updateField(
              "deceasedName",
              value
            )
          }
        />

        {/* Gender */}
        <FieldLabel text="Gender Assigned" />

        <View className="flex-row">
          <Pressable
            onPress={() =>
              updateField("gender", "Male")
            }
            className={`mr-1 flex-1 rounded-md px-3 py-2 ${
              form.gender === "Male"
                ? "bg-[#0B2855]"
                : "border border-[#D8DDE4] bg-white"
            }`}
          >
            <Text
              className={`text-center text-[9px] font-medium ${
                form.gender === "Male"
                  ? "text-white"
                  : "text-[#333333]"
              }`}
            >
              ♂ Male
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              updateField("gender", "Female")
            }
            className={`ml-1 flex-1 rounded-md px-3 py-2 ${
              form.gender === "Female"
                ? "bg-[#0B2855]"
                : "border border-[#D8DDE4] bg-white"
            }`}
          >
            <Text
              className={`text-center text-[9px] font-medium ${
                form.gender === "Female"
                  ? "text-white"
                  : "text-[#333333]"
              }`}
            >
              ♀ Female
            </Text>
          </Pressable>
        </View>

        {/* DOB */}
        <FieldLabel text="Date of Birth" />

        <InputField
          value={form.dateOfBirth}
          onChangeText={(value) =>
            updateField(
              "dateOfBirth",
              value
            )
          }
          rightText="▣"
        />

        {/* Date of Demise */}
        <FieldLabel text="Date of Demise" />

        <InputField
          value={form.dateOfDemise}
          onChangeText={(value) =>
            updateField(
              "dateOfDemise",
              value
            )
          }
          rightText="▣"
        />

        {/* Time */}
        <FieldLabel text="Time of Demise" />

        <InputField
          value={form.timeOfDemise}
          onChangeText={(value) =>
            updateField(
              "timeOfDemise",
              value
            )
          }
          rightText="◷"
        />

        {/* Age */}
        <FieldLabel text="Age at Demise" />

        <InputField
          value="70 Yrs"
          onChangeText={() => {}}
        />

        {/* Marital Status */}
        <FieldLabel text="Marital Status" />

        <SelectField
          value={form.maritalStatus}
          onPress={() =>
            updateField(
              "maritalStatus",
              "Widowed"
            )
          }
        />

        {/* Occupation */}
        <FieldLabel text="Occupation Prior to Demise" />

        <InputField
          value={form.occupation}
          onChangeText={(value) =>
            updateField(
              "occupation",
              value
            )
          }
        />

        {/* Address */}
        <FieldLabel text="Permanent Residential Address" />

        <InputField
          value={form.deceasedAddress}
          onChangeText={(value) =>
            updateField(
              "deceasedAddress",
              value
            )
          }
          multiline
          height={60}
        />
      </SectionCard>

      {/* Cause & Circumstances */}
      <SectionCard
        title="Cause & Circumstances"
        badge="FORM B-4"
      >
        <FieldLabel text="Cause of Demise (Medical Assessment)" />

        <InputField
          value={form.causeOfDeath}
          onChangeText={(value) =>
            updateField(
              "causeOfDeath",
              value
            )
          }
          placeholder="Enter cause of death"
          multiline
          height={80}
        />

        <View className="mt-2 rounded-md border border-[#D8E1EA] bg-[#F1F6FA] px-2.5 py-2">
          <Text className="text-[8px] leading-[12px] text-[#596A7B]">
            ⓘ The Medical Certificate of Cause of
            Death (Form B-4) must be verified before
            final registration.
          </Text>
        </View>
      </SectionCard>
    </View>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3 rounded-lg border border-[#E0E4E9] bg-white p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="flex-1 text-[13px] font-bold text-[#171717]">
          {title}
        </Text>

        {badge !== "" && (
          <View className="rounded-md bg-[#F1F1F1] px-2 py-1">
            <Text className="text-[6px] font-medium text-[#777777]">
              {badge}
            </Text>
          </View>
        )}
      </View>

      {children}
    </View>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  text,
}: {
  text: string;
}) {
  return (
    <Text className="mb-1 mt-2 text-[8px] text-[#626A73]">
      {text}
    </Text>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  height = 36,
  rightText,
  keyboardType,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  height?: number;
  rightText?: string;
  keyboardType?: "default" | "phone-pad" | "numeric";
}) {
  return (
    <View
      className="flex-row items-center rounded-md border border-[#DDE2E8] bg-[#F5F6F7] px-2"
      style={{
        minHeight: height,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        multiline={multiline}
        keyboardType={keyboardType || "default"}
        className="flex-1 text-[9px] text-[#333333]"
        style={{
          minHeight: multiline ? height - 8 : 34,
          textAlignVertical: multiline
            ? "top"
            : "center",
        }}
      />

      {rightText && (
        <Text className="ml-1 text-[10px] text-[#0B2855]">
          {rightText}
        </Text>
      )}
    </View>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  onPress,
}: {
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[36px] flex-row items-center rounded-md border border-[#DDE2E8] bg-[#F5F6F7] px-2.5"
    >
      <Text
        className="flex-1 text-[9px] text-[#333333]"
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text className="text-[10px] text-[#0B2855]">
        ⌄
      </Text>
    </Pressable>
  );
}