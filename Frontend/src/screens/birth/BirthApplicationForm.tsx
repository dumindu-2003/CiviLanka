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
import type { SignOffCredentials } from "../../types/auth";
import type { BirthApplicationPayload } from "../../types/birth";

type FormData = BirthApplicationPayload;

type ApplicationFormProps = {
  onBack: () => void;
  initialData?: BirthApplicationPayload;
  onSaveDraft?: (payload: BirthApplicationPayload) => Promise<void>;
  onSubmit?: (
    payload: BirthApplicationPayload,
    credentials: SignOffCredentials
  ) => Promise<void>;
  onUpdate?: (payload: BirthApplicationPayload) => Promise<void>;
};

export default function BirthApplicationForm({
  onBack,
  initialData,
  onSaveDraft,
  onSubmit,
  onUpdate,
}: ApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showSignOff, setShowSignOff] = useState(false);

  const [form, setForm] = useState<FormData>(initialData ?? {
    babyName: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    gender: "",
    birthWeight: "",
    fatherName: "",
    fatherNic: "",
    fatherOccupation: "",
    fatherAddress: "",
    motherName: "",
    motherNic: "",
    motherOccupation: "",
    motherAddress: "",
    hospitalName: "",
    registrationDate: "",
  });

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((previous) => previous + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    } else {
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
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (initialData && onUpdate) {
      setSaving(true);
      try {
        await onUpdate(form);
      } catch (error) {
        Alert.alert(
          "Unable to update application",
          error instanceof Error ? error.message : "Please try again."
        );
      } finally {
        setSaving(false);
      }
      return;
    }
    setShowSignOff(true);
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
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F6F7F9]"
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
          <Text className="text-[22px] text-[#0B2855]">
            ‹
          </Text>
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold text-white">
            Birth Registration
          </Text>

          <Text className="text-[8px] text-[#D5DEEC]">
            Step {step} of 3 • Application
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
            style={{
              width: `${(step / 3) * 100}%`,
            }}
          />
        </View>

        <View className="mt-2 flex-row justify-between">
          <ProgressItem
            title="Birth Details"
            active={step === 1}
            completed={step > 1}
          />

          <ProgressItem
            title="Parents"
            active={step === 2}
            completed={step > 2}
          />

          <ProgressItem
            title="Review & Submit"
            active={step === 3}
            completed={false}
          />
        </View>
      </View>

      {/* =====================================================
          FORM CONTENT
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
        {step === 1 && (
          <StepOne
            form={form}
            updateField={updateField}
          />
        )}

        {step === 2 && (
          <StepTwo
            form={form}
            updateField={updateField}
          />
        )}

        {step === 3 && (
          <StepThree form={form} />
        )}
      </ScrollView>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <View className="border-t border-[#DDE2E8] bg-white px-3 py-2">
        {step < 3 ? (
          <>
            <Pressable
              onPress={handleNext}
              disabled={saving}
              className="h-[42px] items-center justify-center rounded-md bg-[#0B2855] active:opacity-80"
            >
              <Text className="text-[11px] font-semibold text-white">
                {step === 1
                  ? "Next: Parents' Details  →"
                  : "Next: Documents & Submission  →"}
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
              onPress={handleSubmit}
              disabled={saving}
              className="h-[42px] items-center justify-center rounded-md bg-[#0B2855]"
            >
              <Text className="text-[11px] font-semibold text-white">
                {initialData ? "Save Birth Application Changes" : "Submit Birth Registration"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleBack}
              disabled={saving}
              className="mt-1 h-[38px] items-center justify-center rounded-md border border-[#0B2855]"
            >
              <Text className="text-[10px] font-medium text-[#0B2855]">
                ← Back
              </Text>
            </Pressable>
          </>
        )}
      </View>
      <AuthorizeSignOffModal
        visible={showSignOff}
        title="Authorize birth registration"
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
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
}) {
  return (
    <View>
      <StepHeading
        step="1"
        title="Birth Details"
        percentage="33% Completed"
      />

      {/* APPLICANT */}

      {/* BABY */}

      <FormCard
        title="Baby's Particulars"
        subtitle="Information extracted from hospital discharge notes"
        badge="Child Birth"
      >
        <InputField
          label="Full Legal Name of the Child"
          value={form.babyName}
          onChangeText={(value) =>
            updateField(
              "babyName",
              value
            )
          }
        />

        <InputField
          label="Date of Birth"
          value={form.birthDate}
          placeholder="YYYY-MM-DD"
          onChangeText={(value) =>
            updateField(
              "birthDate",
              value
            )
          }
        />

        <InputField
          label="Time of Birth"
          value={form.birthTime}
          placeholder="HH:mm"
          onChangeText={(value) =>
            updateField(
              "birthTime",
              value
            )
          }
        />

        <InputField
          label="Place of Birth (Hospital/Clinic)"
          value={form.birthPlace}
          onChangeText={(value) =>
            updateField(
              "birthPlace",
              value
            )
          }
          multiline
        />

        <FieldLabel label="Gender" />

        <View className="flex-row">
          <GenderButton
            label="♂ Male"
            active={
              form.gender === "Male"
            }
            onPress={() =>
              updateField(
                "gender",
                "Male"
              )
            }
          />

          <GenderButton
            label="♀ Female"
            active={
              form.gender === "Female"
            }
            onPress={() =>
              updateField(
                "gender",
                "Female"
              )
            }
          />
        </View>

        <InputField
          label="Birth Weight"
          value={form.birthWeight}
          onChangeText={(value) =>
            updateField(
              "birthWeight",
              value
            )
          }
          keyboardType="numeric"
          suffix="kg"
        />
      </FormCard>

      {/* DECLARATION */}

      <View className="mb-3 rounded-lg bg-[#EDEFF2] p-3">
        <Text className="text-[9px] font-semibold text-[#334155]">
          ⓘ Official Declaration
        </Text>

        <Text className="mt-1 text-[8px] leading-4 text-[#687385]">
          Ensure that all information matches
          the hospital record before
          proceeding with the registration.
        </Text>
      </View>
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
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
}) {
  return (
    <View>
      <StepHeading
        step="2"
        title="Parents' Details"
        percentage="66% Completed"
      />

      {/* STEP TABS */}

      <View className="mb-3 flex-row rounded-md border border-[#DDE2E8] bg-white p-2">
        <SmallTab
          text="◉ Child Basics"
          active={false}
        />

        <SmallTab
          text="● Parents"
          active
        />

        <SmallTab
          text="Submission"
          active={false}
        />
      </View>

      {/* FATHER */}

      <FormCard
        title="Father's Details"
        badge="Part A"
      >
        <InputField
          label="Father's Full Name"
          rightLabel="Required"
          value={form.fatherName}
          onChangeText={(value) =>
            updateField(
              "fatherName",
              value
            )
          }
          required
        />

        <InputField
          label="National Identity Card (NIC)"
          rightLabel="12 digits"
          value={form.fatherNic}
          onChangeText={(value) =>
            updateField(
              "fatherNic",
              value
            )
          }
          keyboardType="numeric"
          required
        />

        <InputField
          label="Father's Occupation"
          value={form.fatherOccupation}
          onChangeText={(value) =>
            updateField(
              "fatherOccupation",
              value
            )
          }
        />

        <InputField
          label="Permanent Address"
          value={form.fatherAddress}
          onChangeText={(value) =>
            updateField(
              "fatherAddress",
              value
            )
          }
          multiline
        />
      </FormCard>

      {/* MOTHER */}

      <FormCard
        title="Mother's Details"
        badge="Part B"
      >
        <InputField
          label="Mother's Full Name"
          rightLabel="Required"
          value={form.motherName}
          onChangeText={(value) =>
            updateField(
              "motherName",
              value
            )
          }
          required
        />

        <InputField
          label="National Identity Card (NIC)"
          rightLabel="12 digits"
          value={form.motherNic}
          onChangeText={(value) =>
            updateField(
              "motherNic",
              value
            )
          }
          keyboardType="numeric"
          required
        />

        <InputField
          label="Mother's Occupation"
          value={form.motherOccupation}
          onChangeText={(value) =>
            updateField(
              "motherOccupation",
              value
            )
          }
        />

        <InputField
          label="Permanent Address"
          value={form.motherAddress}
          onChangeText={(value) =>
            updateField(
              "motherAddress",
              value
            )
          }
          multiline
        />
      </FormCard>

      {/* OTHER DETAILS */}

      <FormCard
        title="Other Registration Details"
        badge="Part C"
      >
        <InputField
          label="Hospital Name"
          value={form.hospitalName}
          onChangeText={(value) =>
            updateField(
              "hospitalName",
              value
            )
          }
        />

        <InputField
          label="Registration Date"
          value={form.registrationDate}
          placeholder="YYYY-MM-DD"
          onChangeText={(value) =>
            updateField(
              "registrationDate",
              value
            )
          }
        />

        <View className="mt-1 rounded-md bg-[#F1F3F6] p-2">
          <Text className="text-[8px] leading-4 text-[#687385]">
            All details should be verified
            against the Department of
            Registration of Persons database.
          </Text>
        </View>
      </FormCard>
    </View>
  );
}

/* =========================================================
   STEP 3
========================================================= */

function StepThree({
  form,
}: {
  form: FormData;
}) {
  return (
    <View>
      <StepHeading
        step="3"
        title="Review & Submit"
        percentage="100% Completed"
      />

      <FormCard title="Registration Summary">
        <ReviewRow
          label="Registration Date"
          value={form.registrationDate}
        />
      </FormCard>

      <FormCard title="Baby's Particulars">
        <ReviewRow
          label="Baby Name"
          value={form.babyName}
        />

        <ReviewRow
          label="Date of Birth"
          value={form.birthDate}
        />

        <ReviewRow
          label="Time of Birth"
          value={form.birthTime}
        />

        <ReviewRow
          label="Place of Birth"
          value={form.birthPlace}
        />

        <ReviewRow
          label="Gender"
          value={form.gender}
        />

        <ReviewRow
          label="Birth Weight"
          value={`${form.birthWeight} kg`}
        />
      </FormCard>

      <FormCard title="Father's Details">
        <ReviewRow
          label="Full Name"
          value={form.fatherName}
        />

        <ReviewRow
          label="NIC"
          value={form.fatherNic}
        />

        <ReviewRow
          label="Occupation"
          value={form.fatherOccupation}
        />

        <ReviewRow
          label="Address"
          value={form.fatherAddress}
        />
      </FormCard>

      <FormCard title="Mother's Details">
        <ReviewRow
          label="Full Name"
          value={form.motherName}
        />

        <ReviewRow
          label="NIC"
          value={form.motherNic}
        />

        <ReviewRow
          label="Occupation"
          value={form.motherOccupation}
        />

        <ReviewRow
          label="Address"
          value={form.motherAddress}
        />
      </FormCard>

      <FormCard title="Registration Details">
        <ReviewRow
          label="Hospital Name"
          value={form.hospitalName}
        />
        <ReviewRow
          label="Registration Date"
          value={form.registrationDate}
        />
      </FormCard>

      <View className="rounded-lg bg-[#EDEFF2] p-3">
        <Text className="text-[10px] font-semibold text-[#25334A]">
          ⓘ Declaration
        </Text>

        <Text className="mt-1 text-[8px] leading-4 text-[#687385]">
          I confirm that the information
          provided in this application is
          accurate and complete. I understand
          that the information will be verified
          before the birth certificate is issued.
        </Text>
      </View>
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
        <Text className="text-[8px] text-[#7A8491]">
          Step {step} of 3
        </Text>

        <View className="rounded-full bg-[#E9EDF2] px-2 py-1">
          <Text className="text-[7px] font-semibold text-[#526174]">
            {percentage}
          </Text>
        </View>
      </View>

      <Text className="mt-1 text-[18px] font-bold text-[#25334A]">
        {title}
      </Text>
    </View>
  );
}

/* =========================================================
   PROGRESS ITEM
========================================================= */

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
      {completed && (
        <Text className="mr-1 text-[8px] text-white">
          ✓
        </Text>
      )}

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

/* =========================================================
   FORM CARD
========================================================= */

function FormCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3 rounded-lg border border-[#E0E4E9] bg-white p-3">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[12px] font-bold text-[#26344A]">
            {title}
          </Text>

          {subtitle && (
            <Text className="mt-1 text-[7px] text-[#7A8491]">
              {subtitle}
            </Text>
          )}
        </View>

        {badge && (
          <View className="rounded-full bg-[#F0F2F5] px-2 py-1">
            <Text className="text-[7px] font-medium text-[#667085]">
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
  label,
  rightLabel,
  required,
}: {
  label: string;
  rightLabel?: string;
  required?: boolean;
}) {
  return (
    <View className="mb-1 flex-row items-center justify-between">
      <Text className="text-[8px] font-medium text-[#687385]">
        {label}

        {required && (
          <Text className="text-[#D1495B]">
            {" "}*
          </Text>
        )}
      </Text>

      {rightLabel && (
        <Text className="text-[7px] text-[#A0A7B1]">
          {rightLabel}
        </Text>
      )}
    </View>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  rightLabel,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  required = false,
  suffix,
}: {
  label: string;
  rightLabel?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "phone-pad";
  required?: boolean;
  suffix?: string;
}) {
  return (
    <View className="mb-3">
      <FieldLabel
        label={label}
        rightLabel={rightLabel}
        required={required}
      />

      <View
        className={`flex-row rounded-md border border-[#D9DEE5] bg-[#F8F9FB] ${
          multiline
            ? "min-h-[58px]"
            : "h-[38px]"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={
            multiline
              ? "top"
              : "center"
          }
          className={`flex-1 px-3 text-[9px] text-[#30343B] ${
            multiline
              ? "py-2"
              : "py-0"
          }`}
          placeholderTextColor="#9BA3AE"
        />

        {suffix && (
          <View className="items-center justify-center px-2">
            <Text className="text-[8px] text-[#9BA3AE]">
              {suffix}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* =========================================================
   GENDER BUTTON
========================================================= */

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
        active
          ? "bg-[#0B2855]"
          : "border border-[#D8DEE6] bg-white"
      }`}
    >
      <Text
        className={`text-[9px] font-medium ${
          active
            ? "text-white"
            : "text-[#344563]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   STEP 2 TAB
========================================================= */

function SmallTab({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
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
   REVIEW ROW
========================================================= */

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="mb-3 border-b border-[#EDF0F3] pb-2">
      <Text className="text-[7px] text-[#8A929D]">
        {label}
      </Text>

      <Text className="mt-1 text-[9px] font-medium text-[#30343B]">
        {value}
      </Text>
    </View>
  );
}