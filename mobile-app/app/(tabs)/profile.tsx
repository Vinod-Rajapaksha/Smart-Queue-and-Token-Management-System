import { useEffect, useMemo, useState } from "react";
import { View, Text, Alert, ScrollView, RefreshControl } from "react-native";
import { useAppDispatch } from "../../src/store/hooks";
import { logoutUser } from "../../src/store/slices/auth.slice";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import Loading from "../../src/components/Loading";
import { User, Mail, Phone, KeyRound, LogOut } from "lucide-react-native";
import { getMe, updateMe, changeMyPassword, type MeDto } from "../../src/services/userService";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();

  const [me, setMe] = useState<MeDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // password fields
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const canSave = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().includes("@") &&
      telephone.trim().length >= 7
    );
  }, [name, email, telephone]);

  const loadMe = async (showPageLoader = true) => {
    const shouldShow = showPageLoader || !me;
    if (shouldShow) setLoading(true);
    try {
      const data = await getMe();
      setMe(data);
      setName(data?.name ?? "");
      setEmail(data?.email ?? "");
      setTelephone(data?.telephone ?? "");
    } catch (e: any) {
      console.log(e);
      Alert.alert("Error", "Failed to load profile. Please try again.");
      setMe(null);
    } finally {
      if (shouldShow) setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMe(false);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => dispatch(logoutUser()) },
    ]);
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert("Invalid", "Please fill all fields correctly.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMe({
        name: name.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
      });

      setMe(updated);
      setIsEditing(false);

      Alert.alert("Success", "Profile updated.");
    } catch (e: any) {
      console.log(e);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (currentPassword.trim().length < 4 || newPassword.trim().length < 6) {
      Alert.alert("Invalid", "Enter your current password and a new password (min 6 chars).");
      return;
    }

    setSaving(true);
    try {
      await changeMyPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordBox(false);

      Alert.alert("Success", "Password changed.");
    } catch (e: any) {
      console.log(e);
      Alert.alert("Error", "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-extrabold text-gray-900">Profile</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Manage your account details.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Loading message="Loading ..."/>
        </View>
      ) : !me ? (
      <View className="px-4">
        <View className="bg-white rounded-2xl border border-gray-200 p-5">
          <Text className="text-lg font-extrabold text-gray-900">
            Profile not available
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Pull down to refresh or login again.
          </Text>
          <View className="mt-4">
            <Button title="Try Again" onPress={() => loadMe(true)} />
          </View>
        </View>
      </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {/* Account card */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <User size={18} color="#111827" />
                <Text className="ml-2 text-base font-bold text-gray-900">Account</Text>
              </View>
              <Text
                className="text-sm font-semibold text-gray-700"
                onPress={() => {
                  if (isEditing) {
                    setName(me.name);
                    setEmail(me.email);
                    setTelephone(me.telephone);
                  }
                  setIsEditing((v) => !v);
                }}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </View>
            {!isEditing ? (
              <View className="mt-4">
                <View className="flex-row items-center">
                  <User size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-500">Name</Text>
                </View>
                <Text className="text-base font-semibold text-gray-900 mt-1">{me.name}</Text>
                <View className="mt-4 flex-row items-center">
                  <Mail size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-500">Email</Text>
                </View>
                <Text className="text-base font-semibold text-gray-900 mt-1">{me.email}</Text>
                <View className="mt-4 flex-row items-center">
                  <Phone size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-500">Telephone</Text>
                </View>
                <Text className="text-base font-semibold text-gray-900 mt-1">{me.telephone}</Text>
                <View className="mt-4 self-start px-3 py-1 rounded-full bg-gray-100">
                  <Text className="text-xs font-semibold text-gray-700">
                    {me.role} • {me.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mt-4">
                <Text className="text-xs font-semibold text-gray-500 mb-2">
                  Edit details
                </Text>
                <View className="mb-3">
                  <Text className="text-xs text-gray-500 mb-1">Name</Text>
                  <Input value={name} onChangeText={setName} placeholder="Your name" />
                </View>
                <View className="mb-3">
                  <Text className="text-xs text-gray-500 mb-1">Email</Text>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Your email"
                    keyboardType="email-address"
                  />
                </View>
                <View className="mb-3">
                  <Text className="text-xs text-gray-500 mb-1">Telephone</Text>
                  <Input
                    value={telephone}
                    onChangeText={setTelephone}
                    placeholder="Your telephone"
                    keyboardType="phone-pad"
                  />
                </View>
                <Button
                  title={saving ? "Saving..." : "Save Changes"}
                  onPress={handleSave}
                  disabled={saving || !canSave}
                />
              </View>
            )}
          </View>
          {/* Password card */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4 mt-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <KeyRound size={18} color="#111827" />
                <Text className="ml-2 text-base font-bold text-gray-900">
                  Password
                </Text>
              </View>
              <Text
                className="text-sm font-semibold text-gray-700"
                onPress={() => setShowPasswordBox((v) => !v)}
              >
                {showPasswordBox ? "Close" : "Change"}
              </Text>
            </View>
            {showPasswordBox ? (
              <View className="mt-4">
                <View className="mb-3">
                  <Text className="text-xs text-gray-500 mb-1">Current password</Text>
                  <Input
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current password"
                    secureTextEntry
                  />
                </View>
                <View className="mb-3">
                  <Text className="text-xs text-gray-500 mb-1">New password</Text>
                  <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password (min 6 chars)"
                    secureTextEntry
                  />
                </View>
                <Button
                  title={saving ? "Updating..." : "Update Password"}
                  onPress={handleChangePassword}
                  disabled={saving}
                />
              </View>
            ) : (
              <Text className="text-sm text-gray-500 mt-3">
                Change your password to keep your account secure.
              </Text>
            )}
          </View>
          {/* Logout card */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4 mt-4">
            <View className="flex-row items-center mb-3">
              <LogOut size={18} color="#111827" />
              <Text className="ml-2 text-base font-bold text-gray-900">Logout</Text>
            </View>
            <Text className="text-sm text-gray-500 mb-3">
              You will need to login again to access your account.
            </Text>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
