import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { registerUser } from "../../src/store/slices/auth.slice";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import Loading from "../../src/components/Loading";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.telephone.trim())
      newErrors.telephone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateStep1() || !validateStep2()) return;

    const { confirmPassword, ...registerData } = formData;

    try {
      await dispatch(
        registerUser({ ...registerData, role: "CUSTOMER" })
      ).unwrap();
      router.replace("/(auth)/login");
    } catch (e) {
      console.log(e);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }
    if (step === 2) {
      if (validateStep2()) handleRegister();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (loading) {
    return <Loading fullScreen message="Creating your account..." />;
  }

  const StepDot = ({ active, number }: { active: boolean; number: number }) => {
    if (active) {
      return (
        <LinearGradient
          colors={["#4f46e5", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>{number}</Text>
        </LinearGradient>
      );
    }

    return (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e5e7eb",
        }}
      >
        <Text style={{ color: "#9ca3af", fontWeight: "700" }}>{number}</Text>
      </View>
    );
  };

  const StepLine = ({ active }: { active: boolean }) => {
    if (active) {
      return (
        <LinearGradient
          colors={["#4f46e5", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 64, height: 4, borderRadius: 999 }}
        />
      );
    }

    return (
      <View
        style={{
          width: 64,
          height: 4,
          borderRadius: 999,
          backgroundColor: "#e5e7eb",
        }}
      />
    );
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 32 }}>
      {[1, 2].map((stepNumber) => (
        <View key={stepNumber} style={{ flexDirection: "row", alignItems: "center" }}>
          <StepDot active={step >= stepNumber} number={stepNumber} />
          {stepNumber < totalSteps && <StepLine active={step > stepNumber} />}
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ flex: 1, paddingHorizontal: 24, marginBottom: 24, marginTop: 32 }}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={{ marginBottom: 32, alignItems: "center" }}>
                <LinearGradient
                  colors={["#4f46e5", "#7c3aed"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <User size={32} color="#ffffff" />
                </LinearGradient>

                <Text style={{ fontSize: 30, fontWeight: "800", color: "#111827" }}>
                  Join ZeroQ
                </Text>
                <Text style={{ color: "#4b5563", marginTop: 8 }}>
                  Create your account in {totalSteps} simple steps
                </Text>
              </View>

              {renderStepIndicator()}

              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 24,
                  padding: 24,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                {!!error && (
                  <View
                    style={{
                      backgroundColor: "#fef2f2",
                      borderColor: "#fecaca",
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 24,
                    }}
                  >
                    <Text style={{ color: "#b91c1c", textAlign: "center", fontWeight: "600" }}>
                      {error}
                    </Text>
                  </View>
                )}

                {step === 1 ? (
                  <>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 24 }}>
                      Personal Information
                    </Text>

                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChangeText={(text) => handleInputChange("name", text)}
                      icon="user"
                      error={errors.name}
                    />

                    <Input
                      label="Email Address"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange("email", text)}
                      icon="email"
                      keyboardType="email-address"
                      error={errors.email}
                    />

                    <Input
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      value={formData.telephone}
                      onChangeText={(text) => handleInputChange("telephone", text)}
                      icon="phone"
                      keyboardType="phone-pad"
                      error={errors.telephone}
                    />
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 24 }}>
                      Security Details
                    </Text>

                    <Input
                      label="Password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChangeText={(text) => handleInputChange("password", text)}
                      secureTextEntry
                      icon="password"
                      error={errors.password}
                    />

                    <View style={{ marginBottom: 24 }}>
                      <Text style={{ color: "#4b5563", fontSize: 12, marginBottom: 8 }}>
                        Password must contain:
                      </Text>

                      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 999,
                            marginRight: 8,
                            marginBottom: 8,
                            backgroundColor:
                              formData.password.length >= 6 ? "#dcfce7" : "#f3f4f6",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color:
                                formData.password.length >= 6 ? "#15803d" : "#6b7280",
                            }}
                          >
                            • 6+ characters
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Input
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange("confirmPassword", text)}
                      secureTextEntry
                      icon="password"
                      error={errors.confirmPassword}
                    />
                  </>
                )}

                <View style={{ marginTop: 32 }}>
                  <Button
                    title={step === totalSteps ? "Create Account" : "Continue"}
                    onPress={handleNextStep}
                    variant="primary"
                    size="large"
                    fullWidth
                    icon={step === totalSteps ? <User size={20} color="#ffffff" /> : null}
                  />

                  {step > 1 && (
                    <Button
                      title="Back"
                      onPress={() => setStep(step - 1)}
                      variant="outline"
                      size="medium"
                      fullWidth
                      className="mt-4"
                    />
                  )}
                </View>
              </View>

              <View style={{ marginTop: 32 }}>
                <Text style={{ color: "#4b5563", textAlign: "center", fontSize: 12 }}>
                  By registering, you agree to our{" "}
                  <Text style={{ color: "#2563eb", fontWeight: "700" }}>Terms of Service</Text>{" "}
                  and{" "}
                  <Text style={{ color: "#2563eb", fontWeight: "700" }}>Privacy Policy</Text>
                </Text>
              </View>

              <View style={{ alignItems: "center", marginTop: 32 }}>
                <Text style={{ color: "#4b5563" }}>
                  Already have an account?{" "}
                  <Text
                    onPress={() => router.replace('/(auth)/login')}
                    style={{ color: "#2563eb", fontWeight: "700" }}
                  >
                    Sign In
                  </Text>
                </Text>
                <Text className="text-gray-400 text-xs mt-1">v1.0.0 • Queue Management System</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
