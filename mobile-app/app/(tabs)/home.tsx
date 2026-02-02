import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, RefreshControl, Pressable, Animated, Dimensions, Platform } from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "../../src/store/hooks";
import api from "../../src/services/api";
import Loading from "../../src/components/Loading";
import { Ticket, Sparkles, Clock, UserCircle, MapPin, ChevronRight, QrCode, AlertCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fetchMyTokens } from "../../src/services/tokenService";
import TokenCard from "../../src/components/TokenCard";
import AppAlert from "../../src/components/Alert";

const { width } = Dimensions.get("window");

type Branch = {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  isOpenNow?: boolean;
  estimatedWaitMins?: number;
};

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState({ today: 0, active: 0, done: 0 });
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const showAlert = (title: string, msg: string) => {
    setAlertTitle(title);
    setAlertMsg(msg);
    setAlertOpen(true);
  };
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const ACTIVE_STATUSES = useMemo(
    () => new Set(["CREATED", "WAITING", "CALLING", "SERVING", "SKIPPED"]),
    []
  );
  const DONE_STATUSES = useMemo(
    () => new Set(["COMPLETED", "CANCELLED"]),
    []
  );

  const createGradient = useCallback((colors: string[]): readonly [string, string] => {
    return [colors[0], colors[1]] as const;
  }, []);

  const headerOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, 90],
        outputRange: [0, 1],
        extrapolate: "clamp",
      }),
    [scrollY]
  );

  const headerTranslateY = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, 90],
        outputRange: [20, 0],
        extrapolate: "clamp",
      }),
    [scrollY]
  );

  const getSubtitle = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Let’s start your day right ☀️";
    if (hour < 17) return "Hope your day is going great!";
    if (hour < 20) return "Winding down? We’ve got you.";
    return "Have a peaceful night 🌙";
  };

  const startOfToday = useCallback(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isToday = useCallback(
    (dateLike: any) => {
      if (!dateLike) return false;
      const d = new Date(dateLike);
      return d >= startOfToday();
    },
    [startOfToday]
  );

  const stats = useMemo(
    () => [
      {
        label: "Today",
        value: String(overview.today),
        icon: Clock,
        gradient: createGradient(["#4f46e5", "#6366f1"]),
      },
      {
        label: "Active",
        value: String(overview.active),
        icon: Ticket,
        gradient: createGradient(["#10b981", "#34d399"]),
      },
      {
        label: "Done",
        value: String(overview.done),
        icon: Clock,
        gradient: createGradient(["#8b5cf6", "#a78bfa"]),
      },
    ],
    [overview, createGradient]
  );

  const fetchMyOverviewAndActiveTokens = useCallback(async () => {
    const payload = await fetchMyTokens();
    const tokens = Array.isArray(payload?.data) ? payload.data : [];

    let today = 0;
    let active = 0;
    let done = 0;
    const activeList: any[] = [];

    for (const t of tokens) {
      const status = String(t?.status || "").toUpperCase();
      const dateRef = t?.issuedAt || t?.createdAt;

      if (!isToday(dateRef)) continue;

      today++;

      if (ACTIVE_STATUSES.has(status)) {
        active++;
        activeList.push(t);
      }

      if (DONE_STATUSES.has(status)) done++;
    }

    activeList.sort((a, b) => {
      const da = new Date(a?.issuedAt || a?.createdAt || 0).getTime();
      const db = new Date(b?.issuedAt || b?.createdAt || 0).getTime();
      return db - da;
    });

    setOverview({ today, active, done });
    setActiveTokens(activeList);
  }, [ACTIVE_STATUSES, DONE_STATUSES, isToday]);

  const fetchBranches = useCallback(async () => {
    const base = process.env.EXPO_PUBLIC_API_BASE_URL;
    const url = base ? `${base}/branches` : "/branches";

    const res = await api.get(url);
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    setBranches(list);
  }, []);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([fetchBranches(), fetchMyOverviewAndActiveTokens()]);
    } catch (e: any) {
      console.log("Home loadAll error", e);
      setBranches([]);
      setActiveTokens([]);
      setOverview({ today: 0, active: 0, done: 0 });
      setError(e?.message || "Something went wrong. Please try again.");
    }
  }, [fetchBranches, fetchMyOverviewAndActiveTokens]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const handleScroll = useMemo(() => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: true,
        listener: () => {},
      }
    );
  }, [scrollY]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Loading message="Loading..." />
      </View>
    );
  }

  const firstName = user?.name?.split(" ")?.[0] || "User";

  return (
    <View className="flex-1 bg-gray-50">

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled
        removeClippedSubviews={Platform.OS === "android"}
      >
        {error && (
          <View className="mx-4 mt-4 bg-white border border-red-200 rounded-2xl p-4 flex-row items-start">
            <View className="bg-red-50 p-2 rounded-xl">
              <AlertCircle size={20} color="#ef4444" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900">Couldn’t load data</Text>
              <Text className="text-gray-600 mt-1">{error}</Text>
              <Pressable onPress={loadAll} className="mt-3 bg-red-600 px-4 py-2 rounded-full self-start">
                <Text className="text-white font-semibold">Retry</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Hero Section */}
        <LinearGradient
          colors={createGradient(["#4f46e5", "#6366f1"])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-8 pb-8"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">
                {getSubtitle()},{"\n"}
                <Text className="text-indigo-100">{firstName}!</Text>
              </Text>
              <Text className="text-indigo-100 mt-2">
                Ready to manage your queue today?
              </Text>
            </View>
            <Pressable
              className="bg-white/20 p-3 rounded-full"
              onPress={() => router.push("/profile")}
            >
              <UserCircle size={28} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View className="flex-row mt-8" style={{ gap: 12 }}>
            <Pressable
              className="flex-1"
              android_ripple={{ color: "rgba(255,255,255,0.25)", foreground: true }}
              onPress={() => router.push("/token")}
            >
              <View className="bg-white rounded-2xl p-4 items-center">
                <View className="bg-indigo-100 p-3 rounded-full">
                  <Ticket size={24} color="#4f46e5" />
                </View>
                <Text className="text-gray-900 font-semibold mt-2">New Token</Text>
                <Text className="text-gray-500 text-xs mt-1">Get in line</Text>
              </View>
            </Pressable>

            <Pressable
              className="flex-1"
              android_ripple={{ color: "rgba(255,255,255,0.25)", foreground: true }}
              onPress={() => showAlert("Scan QR","🚀 Coming soon! This feature will be available in the next update.")}
              hitSlop={16}
            >
              <View className="bg-white rounded-2xl p-4 items-center">
                <View className="bg-indigo-100 p-3 rounded-full">
                  <QrCode size={24} color="#4f46e5" />
                </View>
                <Text className="text-gray-900 font-semibold mt-2">Scan QR</Text>
                <Text className="text-gray-500 text-xs mt-1">Check-in</Text>
              </View>
            </Pressable>

            <Pressable
              className="flex-1"
              android_ripple={{ color: "rgba(255,255,255,0.25)", foreground: true }}
              onPress={() => showAlert("Find Locations","🚀 Coming soon! This feature will be available in the next update.")}
              hitSlop={16}
            >
              <View className="bg-white rounded-2xl p-4 items-center">
                <View className="bg-indigo-100 p-3 rounded-full">
                  <MapPin size={24} color="#4f46e5" />
                </View>
                <Text className="text-gray-900 font-semibold mt-2">Branches</Text>
                <Text className="text-gray-500 text-xs mt-1">Find locations</Text>
              </View>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View className="px-4 -mt-4">
          <View className="flex-row" style={{ gap: 12 }}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                className="flex-1"
              >
                <LinearGradient
                  colors={stat.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-white text-2xl font-bold">{stat.value}</Text>
                      <Text className="text-white/80 text-sm mt-1">{stat.label}</Text>
                    </View>
                    <View className="bg-white/20 p-2 rounded-full">
                      <stat.icon size={20} color="#FFFFFF" />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Active Tokens Section */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Active Tokens</Text>
            {activeTokens.length > 0 && (
              <Pressable className="flex-row items-center" onPress={() => router.push("/tokens")}>
                <Text className="text-indigo-600 font-medium mr-1">View All</Text>
                <ChevronRight size={16} color="#4f46e5" />
              </Pressable>
            )}
          </View>

          {activeTokens.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-gray-200">
              <View className="bg-gray-100 p-4 rounded-full">
                <Ticket size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mt-4">No active tokens</Text>
              <Text className="text-gray-500 text-center mt-2">
                Get a token to join a queue and track your position
              </Text>
              <Pressable
                onPress={() => router.push("/token")}
                className="mt-4 bg-indigo-600 py-3 px-6 rounded-full"
              >
                <Text className="text-white font-semibold">Get Your First Token</Text>
              </Pressable>
            </View>
          ) : (
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-4"
              contentContainerStyle={{ paddingHorizontal: 16 }}
              nestedScrollEnabled
            >
              {activeTokens.map((t: any) => (
                <View key={t._id || t.id} className="mr-4" style={{ width: width * 0.8 }}>
                  <TokenCard token={t?.data ?? t} />
                </View>
              ))}
            </Animated.ScrollView>
          )}
        </View>

        {/* Nearby Branches Section */}
        {branches.length > 0 && (
          <View className="px-4 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Nearby Branches</Text>
              <Pressable className="flex-row items-center" onPress={() => router.push("/token")}>
                <Text className="text-indigo-600 font-medium mr-1">See All</Text>
                <ChevronRight size={16} color="#4f46e5" />
              </Pressable>
            </View>

            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-4"
              contentContainerStyle={{ paddingHorizontal: 16 }}
              nestedScrollEnabled
            >
              {branches.slice(0, 5).map((branch, index) => {
                const id = branch._id || branch.id || String(index);
                const openNow =
                  typeof branch.isOpenNow === "boolean" ? branch.isOpenNow : undefined;
                const wait =
                  typeof branch.estimatedWaitMins === "number"
                    ? branch.estimatedWaitMins
                    : undefined;

                return (
                  <Pressable
                    key={id}
                    onPress={() => router.push("/token")}
                    className="bg-white rounded-2xl p-4 mr-4 border border-gray-200"
                    style={{ width: width * 0.7 }}
                  >
                    <View className="flex-row items-start">
                      <View className="bg-indigo-50 p-3 rounded-xl">
                        <MapPin size={20} color="#4f46e5" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-bold text-gray-900">{branch.name || "Branch"}</Text>
                        <Text className="text-gray-500 text-sm mt-1" numberOfLines={2 as any}>
                          {branch.address || "—"}
                        </Text>

                        {(openNow !== undefined || wait !== undefined) && (
                          <View className="flex-row items-center mt-2">
                            {openNow !== undefined && (
                              <View className={`px-2 py-1 rounded-full ${openNow ? "bg-green-100" : "bg-red-100"}`}>
                                <Text className={`text-xs font-medium ${openNow ? "text-green-800" : "text-red-800"}`}>
                                  {openNow ? "Open Now" : "Closed"}
                                </Text>
                              </View>
                            )}
                            {wait !== undefined && (
                              <Text className="text-gray-500 text-xs ml-2">• {wait} min wait</Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Animated.ScrollView>
          </View>
        )}

        {/* Quick Tips */}
        <View className="px-4 mt-8 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Tips</Text>
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1 bg-blue-50 rounded-2xl p-4">
              <Text className="font-semibold text-gray-900">Save Time</Text>
              <Text className="text-gray-600 text-sm mt-1">
                Get tokens remotely and check wait times
              </Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-2xl p-4">
              <Text className="font-semibold text-gray-900">Notifications</Text>
              <Text className="text-gray-600 text-sm mt-1">
                Enable alerts for your token status
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Action Button */}
      {activeTokens.length === 0 && (
        <Pressable
          onPress={() =>
            showAlert(
              "AI Assistant",
              "🚀 Coming soon!\nOur smart AI assistant will be available in the next update."
            )
          }
          className="absolute bottom-6 right-6 z-20"
          hitSlop={16}
        >
          <LinearGradient
            colors={createGradient(["#6366f1", "#8b5cf6"])}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#8b5cf6",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Sparkles size={28} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      )}
      <AppAlert
        visible={alertOpen}
        title={alertTitle}
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
    </View>
  );
}
