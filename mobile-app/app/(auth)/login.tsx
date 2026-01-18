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
import Loading from '../../src/components/Loading';
import { router } from 'expo-router';
import { Mail, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  const handleLogin = () => {
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  if (loading) {
    return <Loading fullScreen message="Logging you in..." />;
  }

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

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <Text className="text-red-700 text-center">{error}</Text>
                </View>
              )}

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                icon="email"
                keyboardType="email-address"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon="password"
              />

              <View className="flex-row justify-end mb-4">
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="primary"
                size="large"
                fullWidth
                icon={<Mail size={20} color="#ffffff" />}
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
    </LinearGradient>
  );
}
