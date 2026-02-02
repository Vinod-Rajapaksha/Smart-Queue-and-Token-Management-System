import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Settings, ChevronRight, Heart, Languages, MapPin, Trash2, History, LogOut, User, Mail, Phone, KeyRound, Camera, ArrowLeft } from "lucide-react-native";
import { useAppDispatch } from "../../src/store/hooks";
import { logoutUser } from "../../src/store/slices/auth.slice";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import Loading from "../../src/components/Loading";
import { getMe, updateMe, changeMyPassword, type MeDto } from "../../src/services/userService";
import AppAlert from "../../src/components/Alert";

type Field = "name" | "email" | "telephone" | null;

export default function ProfileScreen() {
  const dispatch = useAppDispatch();

  const [me, setMe] = useState<MeDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const showAlert = (title: string, msg: string) => {
    setAlertTitle(title);
    setAlertMsg(msg);
    setAlertOpen(true);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isSetting, setIsSetting] = useState(false);

  const [editingField, setEditingField] = useState<Field>(null);

  // editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // password fields
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[A-Za-z ]{2,50}$/;
  const phoneRegex = /^\d{9,15}$/;

  const normalizePhone = (v: string) => v.replace(/\D/g, "");

  const canSaveField = (field: "name" | "email" | "telephone") => {
    if (!me) return false;

    if (field === "name") {
      const v = name.trim();
      return nameRegex.test(v) && v !== me.name;
    }

    if (field === "email") {
      const v = email.trim();
      return emailRegex.test(v) && v !== me.email;
    }

    const v = normalizePhone(telephone);
    return phoneRegex.test(v) && v !== me.telephone;
  };

  const hasChanges = useMemo(() => {
    if (!me) return false;

    const n = name.trim();
    const e = email.trim();
    const t = normalizePhone(telephone);

    return n !== me.name || e !== me.email || t !== me.telephone;
  }, [me, name, email, telephone]);

  const isAllValid = useMemo(() => {
    const n = name.trim();
    const e = email.trim();
    const t = normalizePhone(telephone);

    return nameRegex.test(n) && emailRegex.test(e) && phoneRegex.test(t);
  }, [name, email, telephone]);

  const canSaveAll = hasChanges && isAllValid && !saving;

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
      showAlert("Error", "Failed to load profile. Please try again.");
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

  const handleLogout = () => setLogoutOpen(true);

  const handleSave = async (field: "name" | "email" | "telephone") => {
    if (!canSaveField(field)) {
      showAlert("Invalid", `Please enter a valid ${field}.`);
      return;
    }

    setSaving(true);
    try {
      const payload =
        field === "name"
          ? { name: name.trim() }
          : field === "email"
          ? { email: email.trim() }
          : { telephone: normalizePhone(telephone) };

      const updated = await updateMe(payload);

      setMe(updated);
      setEditingField(null);
      showAlert("Success", `${field} updated.`);
    } catch (e: any) {
      console.log(e);
      showAlert("Error", e?.response?.data?.message || `Failed to update ${field}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
  const n = name.trim();
  const e = email.trim();
  const t = normalizePhone(telephone);

  if (!nameRegex.test(n)) return showAlert("Invalid", "Name must be 2–50 letters/spaces.");
  if (!emailRegex.test(e)) return showAlert("Invalid", "Enter a valid email.");
  if (!phoneRegex.test(t)) return showAlert("Invalid", "Telephone must be 9–15 digits.");

  setSaving(true);
    try {
      const updated = await updateMe({ name: n, email: e, telephone: t });
      setMe(updated);
      setIsEditing(false);
      showAlert("Success", "Profile updated.");
    } catch (err: any) {
      showAlert("Error", err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (currentPassword.trim().length < 4 || newPassword.trim().length < 8) {
      showAlert(
        "Invalid",
        "Enter your current password and a new password (min 8 chars)."
      );
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

      showAlert("Success", "Password changed.");
    } catch (e: any) {
      console.log(e);
      showAlert(
        "Error",
        e?.response?.data?.message || "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (fullName: string) => {
    const n = (fullName || "").trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  };

  const usernameText = useMemo(() => {
    const e = (me?.email || "").trim();
    if (!e) return "@user";
    return `@${e.split("@")[0]}`;
  }, [me?.email]);

  const TopBar = ({
    title,
    rightIcon,
    onRightPress,
    onBackPress,
  }: {
    title: string;
    rightIcon: React.ReactNode;
    onRightPress: () => void;
    onBackPress?: () => void;
  }) => (
    <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-gray-50">
      {onBackPress ? (
      <TouchableOpacity
        onPress={onBackPress}
        className="w-10 h-10 rounded-full items-center justify-center"
        activeOpacity={0.7}
      >
        <ArrowLeft size={22} color="#111827" />
      </TouchableOpacity>
      ) : (
        <View className="w-10 h-10" />
      )}

      <Text className="text-xl font-extrabold text-gray-900">{title}</Text>

      <TouchableOpacity
        onPress={onRightPress}
        className="w-10 h-10 rounded-full items-center justify-center"
        activeOpacity={0.7}
      >
        {rightIcon}
      </TouchableOpacity>
    </View>
  );

  const MenuRow = ({
    icon,
    label,
    danger,
    onPress,
    isLast,
  }: {
    icon: any;
    label: string;
    danger?: boolean;
    onPress?: () => void;
    isLast?: boolean;
  }) => {
    const Icon = icon;
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        className={`flex-row items-center justify-between px-4 py-4 ${
          isLast ? "" : "border-b border-gray-100"
        }`}
      >
        <View className="flex-row items-center">
          <Icon size={18} color={danger ? "#ef4444" : "#4f46e5"} />
          <Text
            className={`ml-3 text-[15px] ${
              danger ? "text-red-500 font-semibold" : "text-gray-900"
            }`}
          >
            {label}
          </Text>
        </View>
        <ChevronRight size={18} color={danger ? "#ef4444" : "#4f46e5"} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Loading message="Loading profile..." />
      </View>
    );
  }

  if (!me) {
    return (
      <View className="flex-1 bg-gray-50">
        <TopBar
          title="My Profile"
          rightIcon={<Settings size={20} color="#111827" />}
          onRightPress={() => {
            showAlert("Settings", "Try Again");
          }}
        />

        <View className="px-4 mt-8">
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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* TOP BAR */}
      {isSetting ? (
        <TopBar
          title="Settings"
          rightIcon={<User size={20} color="#111827" />}
          onRightPress={() => setIsSetting(false)}
          onBackPress={() => setIsSetting(false)}
        />
      ) : (
        <TopBar
          title="My Profile"
          rightIcon={<Settings size={20} color="#111827" />}
          onRightPress={() => {
            setIsSetting(true);
            setIsEditing(false);
            setShowPasswordBox(false);
          }}
        />
      )}
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* PROFILE HERO */}
        <View className="items-center px-4 pt-2">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center overflow-hidden">
              <Text className="text-2xl font-extrabold text-indigo-600">
                {getInitials(me.name)}
              </Text>
            </View>

            {!isSetting && (
              <TouchableOpacity
                onPress={() => showAlert("Photo", "🚀 Upload photo coming soon.")}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center"
                activeOpacity={0.7}
              >
                <Camera size={16} color="#4f46e5" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="mt-4 text-xl font-extrabold text-gray-900">{me.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">{usernameText}</Text>
        </View>

        {/* CONTENT */}
        {isSetting ? (
          <>
            <View className="mt-6 mx-4 bg-white border border-gray-100 rounded-3xl overflow-hidden">
              <MenuRow
                icon={Heart}
                label="Favourites"
                onPress={() => showAlert("Favourites", "🚀 Coming soon!\nThis feature will be available in the next update.")}
              />
              <MenuRow
                icon={Languages}
                label="Language"
                onPress={() => showAlert("Language", "🚀 Coming soon!\nThis feature will be available in the next update.")}
              />
              <MenuRow
                icon={MapPin}
                label="Location"
                onPress={() => showAlert("Location", "🚀 Coming soon!\nThis feature will be available in the next update.")}
                isLast
              />
            </View>

            <View className="mt-3 mx-4 bg-white border border-gray-100 rounded-3xl overflow-hidden">
              <MenuRow
                icon={Trash2}
                label="Clear cache"
                onPress={() => showAlert("Cache", "🚀 Coming soon!\nThis feature will be available in the next update.")}
              />
              <MenuRow
                icon={History}
                label="Clear history"
                onPress={() => showAlert("History", "🚀 Coming soon!\nThis feature will be available in the next update.")}
              />
            </View>

            <View className="mt-3 mx-4 bg-white border border-gray-100 rounded-3xl overflow-hidden">
              <MenuRow
                icon={LogOut}
                label="Log out"
                danger
                onPress={handleLogout}
                isLast
              />
            </View>

            <View className="h-10" />
          </>
        ) : (
          <>
            {/* Account card */}
            <View className="mx-4 mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white">
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100">
                    <User size={18} color="#4f46e5" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-base font-extrabold text-gray-900">Account</Text>
                    <Text className="text-xs font-semibold text-gray-500 mt-0.5">
                      Manage your profile details
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isEditing) {
                      setName(me.name);
                      setEmail(me.email);
                      setTelephone(me.telephone);
                      setShowPasswordBox(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setIsEditing(false);
                      return;
                    }

                    setName(me.name);
                    setEmail(me.email);
                    setTelephone(me.telephone);
                    setIsEditing(true);
                    setIsSetting(false);
                  }}
                  className={`px-3 py-2 rounded-full ${
                    isEditing ? "bg-indigo-100" : "bg-indigo-600"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isEditing ? "text-indigo-600" : "text-white"
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              {!isEditing ? (
                <View className="pb-4">
                  {/* Name */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      if (editingField) return;
                      setIsEditing(false);
                      setShowPasswordBox(false);
                      setName(me.name);
                      setEditingField("name");
                    }}
                    className="px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
                          <User size={16} color="#4f46e5" />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text className="text-[11px] font-bold text-gray-500 uppercase">Name</Text>

                          {editingField !== "name" ? (
                            <Text className="text-base font-semibold text-gray-900 mt-0.5">
                              {me.name}
                            </Text>
                          ) : (
                            <View className="mt-2">
                              <Input value={name} onChangeText={setName} placeholder="Your name" />

                              <View className="flex-row mt-3">
                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => setEditingField(null)}
                                  className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-3"
                                >
                                  <Text className="text-sm font-bold text-gray-900">Cancel</Text>
                                </TouchableOpacity>

                                <View className="w-3" />

                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => handleSave("name")}
                                  disabled={saving || !canSaveField("name")}
                                  className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                                    saving || !canSaveField("name") ? "bg-indigo-200" : "bg-indigo-600"
                                  }`}
                                >
                                  <Text className="text-sm font-bold text-white">
                                    {saving ? "Saving..." : "Save"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>

                      {editingField !== "name" && <ChevronRight size={18} color="#4f46e5" />}
                    </View>
                  </TouchableOpacity>

                  {/* Email */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      if (editingField) return;
                      setIsEditing(false);
                      setShowPasswordBox(false);
                      setEmail(me.email);
                      setEditingField("email");
                    }}
                    className="px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
                          <Mail size={16} color="#4f46e5" />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text className="text-[11px] font-bold text-gray-500 uppercase">
                            Email
                          </Text>

                          {editingField !== "email" ? (
                            <Text className="text-base font-semibold text-gray-900 mt-0.5">
                              {me.email}
                            </Text>
                          ) : (
                            <View className="mt-2">
                              <Input
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Your email"
                                keyboardType="email-address"
                              />

                              <View className="flex-row mt-3">
                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => setEditingField(null)}
                                  className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-3"
                                >
                                  <Text className="text-sm font-bold text-gray-900">Cancel</Text>
                                </TouchableOpacity>

                                <View className="w-3" />

                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => handleSave("email")}
                                  disabled={saving || !canSaveField("email")}
                                  className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                                    saving || !canSaveField("email") ? "bg-indigo-200" : "bg-indigo-600"
                                  }`}
                                >
                                  <Text className="text-sm font-bold text-white">
                                    {saving ? "Saving..." : "Save"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>

                      {editingField !== "email" && <ChevronRight size={18} color="#4f46e5" />}
                    </View>
                  </TouchableOpacity>

                  {/* Telephone */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      if (editingField) return;
                      setIsEditing(false);
                      setShowPasswordBox(false);
                      setTelephone(me.telephone);
                      setEditingField("telephone");
                    }}
                    className="px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
                          <Phone size={16} color="#4f46e5" />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text className="text-[11px] font-bold text-gray-500 uppercase">
                            Telephone
                          </Text>

                          {editingField !== "telephone" ? (
                            <Text className="text-base font-semibold text-gray-900 mt-0.5">
                              {me.telephone}
                            </Text>
                          ) : (
                            <View className="mt-2">
                              <Input
                                value={telephone}
                                onChangeText={setTelephone}
                                placeholder="Your telephone"
                                keyboardType="phone-pad"
                              />

                              <View className="flex-row mt-3">
                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => setEditingField(null)}
                                  className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-3"
                                >
                                  <Text className="text-sm font-bold text-gray-900">Cancel</Text>
                                </TouchableOpacity>

                                <View className="w-3" />

                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => handleSave("telephone")}
                                  disabled={saving || !canSaveField("telephone")}
                                  className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                                    saving || !canSaveField("telephone") ? "bg-indigo-200" : "bg-indigo-600"
                                  }`}
                                >
                                  <Text className="text-sm font-bold text-white">
                                    {saving ? "Saving..." : "Save"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>

                      {editingField !== "telephone" && <ChevronRight size={18} color="#4f46e5" />}
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="px-4 pb-4">
                  <Text className="text-[11px] font-bold text-gray-500 uppercase mb-3">
                    Edit details
                  </Text>

                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">Name</Text>
                    <Input value={name} onChangeText={setName} placeholder="Your name" />
                  </View>

                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">Email</Text>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Your email"
                      keyboardType="email-address"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">
                      Telephone
                    </Text>
                    <Input
                      value={telephone}
                      onChangeText={setTelephone}
                      placeholder="Your telephone"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View className="flex-row">
                    <View className="flex-1">
                      <Button
                        title={saving ? "Saving..." : "Save Changes"}
                        onPress={handleSaveAll}
                        disabled={!canSaveAll}
                        fullWidth
                      />
                    </View>

                    <View className="w-3" />

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setName(me.name);
                        setEmail(me.email);
                        setTelephone(me.telephone);
                        setIsEditing(false);
                      }}
                      className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50"
                    >
                      <Text className="text-sm font-bold text-gray-900">Discard</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Password card */}
            <View className="mx-4 mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white">
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50">
                    <KeyRound size={18} color="#4f46e5" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-base font-extrabold text-gray-900">Password</Text>
                    <Text className="text-xs font-semibold text-gray-500 mt-0.5">
                      Keep your account secure
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowPasswordBox((v) => !v)}
                  className={`px-3 py-2 rounded-full ${
                    showPasswordBox ? "bg-indigo-100" : "bg-indigo-600"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      showPasswordBox ? "text-indigo-600" : "text-white"
                    }`}
                  >
                    {showPasswordBox ? "Close" : "Change"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showPasswordBox ? (
                <View className="px-4 pb-4">
                  <Text className="text-[11px] font-bold text-gray-500 uppercase mb-3">
                    Update password
                  </Text>

                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">
                      Current password
                    </Text>
                    <Input
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Current password"
                      secureTextEntry
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">
                      New password
                    </Text>
                    <Input
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="New password (min 8 chars)"
                      secureTextEntry
                    />
                    <Text className="text-xs text-gray-500 mt-2">
                      Tip: use a long passphrase you don’t reuse elsewhere.
                    </Text>
                  </View>

                  <Button
                    title={saving ? "Updating..." : "Update Password"}
                    onPress={handleChangePassword}
                    disabled={saving}
                    fullWidth
                  />
                </View>
              ) : (
                <View className="px-4 pb-4">
                  <Text className="text-sm text-gray-500">
                    Change your password regularly to protect your account.
                  </Text>
                </View>
              )}
            </View>

            {/* Logout */}
            <View className="mt-4 mx-4 bg-white border border-gray-100 rounded-3xl overflow-hidden">
              <MenuRow
                icon={LogOut}
                label="Log out"
                danger
                onPress={handleLogout}
                isLast
              />
            </View>

            <View className="h-10" />
          </>
        )}
      </ScrollView>
      <AppAlert
        visible={alertOpen}
        title={alertTitle}
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
      <AppAlert
        visible={logoutOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onClose={() => setLogoutOpen(false)}
        confirmText="Yes"
        onConfirm={() => dispatch(logoutUser())}
      />
    </View>
  );
}
