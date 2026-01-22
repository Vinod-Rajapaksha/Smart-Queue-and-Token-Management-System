import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { fetchMyTokensSplit } from "../../src/store/slices/token.slice";
import TokenCard from "../../src/components/TokenCard";
import Loading from "../../src/components/Loading";

export default function TokenHistoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { completedTokens, historyLoading } = useAppSelector((s) => s.token);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTokensSplit());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMyTokensSplit());
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="p-2 rounded-xl bg-white border border-gray-200"
          >
            <ArrowLeft size={18} color="#111827" />
          </Pressable>

          <View className="ml-3">
            <Text className="text-xl font-extrabold text-gray-900">
              Token History
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Completed / Cancelled tokens
            </Text>
          </View>
        </View>

        <View className="px-3 py-1 rounded-full bg-gray-200">
          <Text className="text-xs font-semibold text-gray-700">
            {completedTokens.length} total
          </Text>
        </View>
      </View>

      {/* Body */}
      {historyLoading && completedTokens.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Loading message="Loading history..." />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {completedTokens.length === 0 ? (
            <View className="bg-white rounded-2xl p-5 border border-gray-200 mt-2">
              <Text className="text-base font-bold text-gray-900">
                No completed tokens
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Completed tokens will appear here.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }} className="mt-2">
              {completedTokens.map((t: any) => (
                <TokenCard key={t._id || t.id} token={t} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
