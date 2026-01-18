import { View, Text, ScrollView, RefreshControl, useWindowDimensions } from "react-native";
import { useEffect, useMemo, useState } from "react";
import Loading from "../../src/components/Loading";
import { useAppSelector } from "../../src/store/hooks";
import api from "../../src/services/api";
import { MapPin, Building2 } from "lucide-react-native";

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();

  const columns = useMemo(() => {
    if (width >= 900) return 3; 
    if (width >= 600) return 2; 
    return 1; 
  }, [width]);

  const cardWidth = useMemo(() => {
    const gap = 12;
    const containerPadding = 16 * 2;
    const totalGaps = gap * (columns - 1);
    return (width - containerPadding - totalGaps) / columns;
  }, [width, columns]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        process.env.EXPO_PUBLIC_API_BASE_URL + "/branches"
      );
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setBranches(list);
    } catch (err) {
      console.log(err);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get(
        process.env.EXPO_PUBLIC_API_BASE_URL + "/branches"
      );
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setBranches(list);
    } catch (err) {
      console.log(err);
      setBranches([]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-extrabold text-gray-900">
          Welcome, {user?.name || "User"}!
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Choose a branch to view details.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Loading message="Loading ..."/>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Section title */}
          <View className="flex-row items-center justify-between mb-3 mt-1">
            <View className="flex-row items-center">
              <Building2 size={18} color="#111827" />
              <Text className="ml-2 text-base font-bold text-gray-900">
                Branches
              </Text>
            </View>

            <View className="px-3 py-1 rounded-full bg-gray-200">
              <Text className="text-xs font-semibold text-gray-700">
                {branches.length} total
              </Text>
            </View>
          </View>

          {/* Empty state */}
          {branches.length === 0 ? (
            <View className="bg-white rounded-2xl p-5 border border-gray-200">
              <Text className="text-base font-bold text-gray-900">
                No branches available
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Pull down to refresh or try again later.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {branches.map((branch) => (
                <View
                  key={branch._id}
                  className="bg-white rounded-2xl p-4 border border-gray-200"
                  style={{ width: cardWidth }}
                >
                  <Text
                    className="text-lg font-extrabold text-gray-900"
                    numberOfLines={1}
                  >
                    {branch.name}
                  </Text>

                  <View className="flex-row items-start mt-2">
                    <MapPin size={16} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-600 flex-1">
                      {branch.address || "No address provided"}
                    </Text>
                  </View>

                  <View className="mt-3 self-start px-3 py-1 rounded-full bg-gray-100">
                    <Text className="text-xs font-semibold text-gray-700">
                      Branch
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
