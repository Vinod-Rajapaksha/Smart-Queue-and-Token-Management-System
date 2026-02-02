import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { loginUser } from '../../src/store/slices/auth.slice';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { router } from 'expo-router';
import { Mail, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from "@expo/vector-icons";
import AppAlert from "../../src/components/Alert";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const showAlert = (title: string, msg: string) => {
    setAlertTitle(title);
    setAlertMsg(msg);
    setAlertOpen(true);
  };
  
  const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isFormValid = isValidEmail(email) && password.length >= 8;

  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  const handleLogin = () => {
    setTouched(true);

    if (!isFormValid) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <LinearGradient
      colors={['#EFF6FF', '#FFFFFF']}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center" style={{ marginTop: 32 }}>
            {/* Header */}
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
                Smart Queue Management System
              </Text>
            </View>

            {/* Form */}
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <Text className="text-xl font-bold text-gray-900 mb-1">Welcome Back</Text>
              <Text className="text-gray-500 mb-4">Sign in to manage your queues efficiently</Text>

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

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                icon="email"
                keyboardType="email-address"
                error={touched && !isValidEmail(email) ? "Please enter a valid email address" : ""}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="password"
                error={touched && password.length < 8 ? "Password must be at least 8 characters" : ""}
              />

              <View className="flex-row justify-end mb-4">
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title={loading ? "Signing In..." : "Sign In"}
                onPress={handleLogin}
                variant="primary"
                size="large"
                fullWidth
                disabled={loading}
                icon={!loading && <Mail size={20} color="#ffffff" />}
              />

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-3 text-gray-500">Or continue with</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <Button
                title="Google"
                variant="outline"
                size="medium"
                fullWidth
                onPress={() => showAlert("Sign in with Google","🚀 Coming soon! This feature will be available in the next update.")}
                icon={<FontAwesome name="google" size={18} color="#EA4335" />}
              />
            </View>

            {/* Footer */}
            <View className="items-center mt-6">
              <Text className="text-gray-500">
                Don't have an account?{' '}
                <Text
                  onPress={() => router.replace('/(auth)/register')}
                  style={{ color: "#2563eb", fontWeight: "700" }}
                >
                  Register
                </Text>
              </Text>
              <Text className="text-gray-400 text-xs mt-1">v1.0.0 • Queue Management System</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppAlert
        visible={alertOpen}
        title={alertTitle}
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
    </LinearGradient>
  );
}
