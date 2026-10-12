import React, { useEffect, useRef, useState } from "react";
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
  title?: string;
  subtitle?: string;
  submitLabel?: string;
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
  title = "Official Death Registration Application",
  subtitle,
  submitLabel = "Submit Death Registration",
  onSaveDraft,
  onSubmit,
  onUpdate,
}: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showSignOff, setShowSignOff] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

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
  const formRef = useRef(form);
  const stepRef = useRef(step);
  formRef.current = form;
  stepRef.current = step;

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((previous) => {
      const next = { ...previous, [field]: value };
      if (field === "dateOfBirth" || field === "dateOfDemise") {
        const age = ageAtDemise(next.dateOfBirth, next.dateOfDemise);
        if (age !== null) next.ageAtDeath = age;
      }
      return next;
    });
  };

  useEffect(() => {
    setIssues((current) => (current.length > 0 ? validateDeathStep(step, form) : current));
  }, [form, step]);

  useEffect(() => {
    const age = ageAtDemise(form.dateOfBirth, form.dateOfDemise);
    if (age === null || age === form.ageAtDeath) return;
    setForm((previous) => ({ ...previous, ageAtDeath: age }));
  }, [form.dateOfBirth, form.dateOfDemise, form.ageAtDeath]);

  const handleNext = () => {
    const currentForm = formRef.current;
    const currentStep = stepRef.current;
    const found = validateDeathStep(currentStep, currentForm);
    setIssues(found);
    if (found.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    if (currentStep === 1) {
      setIssues([]);
      setStep(2);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (onUpdate) {
      void handleUpdate();
    } else {
      setShowSignOff(true);
    }
  };

  const handleUpdate = async () => {
    const found = validateDeathReport(formRef.current);
    setIssues(found);
    if (found.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    setSaving(true);
    try {
      if (!onUpdate) throw new Error("Updating is not available on this screen.");
      await onUpdate(formRef.current);
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
      const save = onUpdate ?? onSaveDraft;
      if (!save) throw new Error("Saving is not available on this screen.");
      await save(formRef.current);
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
    const found = validateDeathReport(formRef.current);
    setIssues(found);
    if (found.length > 0) {
      setShowSignOff(false);
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    setSaving(true);
    try {
      if (!onSubmit) throw new Error("Submission is not available on this screen.");
      await onSubmit(formRef.current, credentials);
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
          <Text className="text-[9px] font-medium tracking-[0.5px] text-white">
            DEATH REGISTRATION - STEP {step}:{" "}
            {step === 1
              ? "INFORMANT & DEMISE"
              : "DECEASED DETAILS"}
          </Text>

          <Text className="mt-1 text-[7px] text-[#D7DFEC]">
            {title}
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
                  ? "Informant & Death Details"
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
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 30,
        }}
      >
        {subtitle ? (
          <Text className="mb-2 text-[11px] leading-4 text-[#596A7B]">
            {subtitle}
          </Text>
        ) : null}
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

        {issues.length > 0 ? (
          <View className="mt-3 rounded-md border border-[#F1B8B8] bg-[#FDECEC] px-3 py-2">
            {issues.map((issue) => (
              <Text key={issue} className="text-[11px] leading-4 text-[#C62828]">
                {issue}
              </Text>
            ))}
          </View>
        ) : null}

        <View className="mt-4">
          {/* Next / Submit */}
          <Pressable
            onPress={handleNext}
            disabled={saving}
            className="h-[42px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="text-[11px] font-bold text-white">
              {step === 1
                ? "Next: Deceased Details →"
                : onUpdate ? "Save Death Application Changes" : submitLabel}
            </Text>
          </Pressable>

          {step === 2 && onUpdate && onSubmit ? (
            <Pressable
              onPress={() => {
                const found = validateDeathReport(formRef.current);
                setIssues(found);
                if (found.length > 0) {
                  scrollRef.current?.scrollToEnd({ animated: true });
                  return;
                }
                setShowSignOff(true);
              }}
              disabled={saving}
              className="mt-2 h-[42px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
            >
              <Text className="text-[11px] font-bold text-white">
                {submitLabel}
              </Text>
            </Pressable>
          ) : null}

          {/* Save Draft */}
          <Pressable
            onPress={handleSaveDraft}
            disabled={saving}
            className="mt-2 h-[42px] items-center justify-center rounded-lg bg-[#0B2855] active:opacity-80"
          >
            <Text className="text-[11px] font-bold text-white">
              {onUpdate ? "Save Changes" : "▣ Save as Draft"}
            </Text>
          </Pressable>

          {/* Back on Step 2 */}
          {step === 2 && (
            <Pressable
              onPress={handleBack}
              disabled={saving}
              className="mt-2 h-[42px] items-center justify-center rounded-lg border border-[#0B2855] bg-white"
            >
              <Text className="text-[11px] font-bold text-[#0B2855]">
                ← Back to Informant Details
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <AuthorizeSignOffModal
        visible={showSignOff}
        title="Authorize death registration"
        onCancel={() => setShowSignOff(false)}
        onConfirm={(credentials) => void handleConfirmSignOff(credentials)}
      />
    </SafeAreaView>
  );
}

function validateDeathStep(step: number, form: FormData) {
  return step === 1 ? validateInformant(form) : validateDeceased(form);
}

function validateDeathReport(form: FormData) {
  return [...validateInformant(form), ...validateDeceased(form)];
}

function validateInformant(form: FormData) {
  const issues: string[] = [];
  if (!personName(form.informantName)) issues.push("Enter the informant's full name (at least 3 letters).");
  if (!nicOk(form.nic)) issues.push("Enter a valid informant NIC (12 digits, or 9 digits followed by V or X).");
  if (form.relationship.trim().length < 2 || form.relationship.trim().length > 50) {
    issues.push("Enter the informant's relationship (up to 50 characters).");
  }
  if (!phoneOk(form.informantContact)) issues.push("Enter a contact number as 07XXXXXXXX or +947XXXXXXXX.");
  if (form.placeOfDemise.trim().length < 2 || form.placeOfDemise.trim().length > 150) {
    issues.push("Enter the place of death (up to 150 characters).");
  }
  const deathDate = parseIsoDate(form.dateOfDemise);
  if (!deathDate) issues.push("Select the date of death.");
  else if (deathDate > startOfToday()) issues.push("The date of death cannot be in the future.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.timeOfDemise.trim())) {
    issues.push("Enter the time of death as HH:mm.");
  }
  return issues;
}

function validateDeceased(form: FormData) {
  const issues: string[] = [];
  if (!nicOk(form.deceasedNic)) issues.push("Enter a valid NIC for the deceased person.");
  if (!personName(form.deceasedName)) issues.push("Enter the deceased person's full legal name.");
  if (form.gender !== "Male" && form.gender !== "Female") issues.push("Select the gender.");
  const birth = parseIsoDate(form.dateOfBirth);
  const death = parseIsoDate(form.dateOfDemise);
  if (!birth) issues.push("Select the date of birth.");
  else if (birth > startOfToday()) issues.push("The date of birth cannot be in the future.");
  else if (death && birth > death) issues.push("The date of birth must be on or before the date of death.");
  if (!/^\d{1,3}$/.test(form.ageAtDeath.trim()) || Number(form.ageAtDeath) > 130) {
    issues.push("Enter the age at death as a whole number from 0 to 130.");
  }
  if (!MARITAL_STATUSES.includes(form.maritalStatus as (typeof MARITAL_STATUSES)[number])) {
    issues.push("Select the marital status: Single, Married, Widowed, or Divorced.");
  }
  if (form.deceasedAddress.trim().length < 5 || form.deceasedAddress.trim().length > 200) {
    issues.push("Enter the permanent address (5 to 200 characters).");
  }
  if (form.causeOfDeath.trim().length < 3) issues.push("Enter the cause of death.");
  if (form.causeOfDeath.trim().length > 200) issues.push("The cause of death must be 200 characters or fewer.");
  return issues;
}

function personName(value: string) {
  const name = value.trim();
  return name.length >= 3 && name.length <= 100 && !/^\d+$/.test(name);
}

function nicOk(value: string) {
  const nic = value.trim().toUpperCase();
  return /^\d{12}$/.test(nic) || /^\d{9}[VX]$/.test(nic);
}

function phoneOk(value: string) {
  const phone = value.replace(/[\s-]/g, "");
  return /^(?:0\d{9}|\+94\d{9})$/.test(phone) && phone.length <= 15;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return date;
}

const MARITAL_STATUSES = ["Single", "Married", "Widowed", "Divorced"] as const;

function ageAtDemise(dateOfBirth: string, dateOfDemise: string) {
  const birth = parseIsoDate(dateOfBirth);
  const death = parseIsoDate(dateOfDemise) ?? startOfToday();
  if (!birth || birth > death) return null;
  let years = death.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    death.getMonth() < birth.getMonth() ||
    (death.getMonth() === birth.getMonth() && death.getDate() < birth.getDate());
  if (beforeBirthday) years -= 1;
  if (years < 0 || years > 130) return null;
  return String(years);
}

function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
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

        <InputField
          value={form.relationship}
          onChangeText={(value) => updateField("relationship", value)}
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

      </SectionCard>

      {/* Demise Context */}
      <SectionCard
        title="Demise Context"
        badge="INCIDENT DETAILS"
      >
        <FieldLabel text="Immediate Place of Demise" />

        <InputField
          value={form.placeOfDemise}
          onChangeText={(value) => updateField("placeOfDemise", value)}
        />

        <FieldLabel text="Date of Demise" />

        <DatePickerField
          value={form.dateOfDemise}
          onChangeText={(value) => updateField("dateOfDemise", value)}
          accessibilityLabel="Date of Demise"
        />

        <FieldLabel text="Time of Demise" />

        <InputField
          value={form.timeOfDemise}
          placeholder="HH:mm"
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

        </View>

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

        <DatePickerField
          value={form.dateOfBirth}
          onChangeText={(value) => updateField("dateOfBirth", value)}
          accessibilityLabel="Date of Birth"
        />

        {/* Age */}
        <FieldLabel text="Age at Demise" />

        <View className="h-[38px] justify-center rounded-md border border-[#DDE2E8] bg-[#F5F6F7] px-2">
          <Text className={`text-[14px] font-bold ${form.ageAtDeath ? "text-[#171717]" : "text-[#999999]"}`}>
            {form.ageAtDeath ? `${form.ageAtDeath} years` : "Fills when the date of birth is selected"}
          </Text>
        </View>

        {/* Marital Status */}
        <FieldLabel text="Marital Status" />

        <View className="flex-row flex-wrap">
          {MARITAL_STATUSES.map((status) => (
            <Pressable
              key={status}
              onPress={() => updateField("maritalStatus", status)}
              className={`mb-1 mr-1 rounded-md px-3 py-2 ${
                form.maritalStatus === status
                  ? "bg-[#0B2855]"
                  : "border border-[#D8DDE4] bg-white"
              }`}
            >
              <Text
                className={`text-[9px] font-medium ${
                  form.maritalStatus === status ? "text-white" : "text-[#333333]"
                }`}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </View>

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
