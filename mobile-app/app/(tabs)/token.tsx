import { View, Text, ScrollView, RefreshControl, useWindowDimensions, Pressable } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { createToken, fetchMyToken } from "../../src/store/slices/token.slice";
import Button from "../../src/components/Button";
import TokenCard from "../../src/components/TokenCard";
import Loading from "../../src/components/Loading";
import api from "../../src/services/api";
import { Building2, ListChecks, Ticket } from "lucide-react-native";

export default function Token() {
  const dispatch = useAppDispatch();
  const { myToken, error } = useAppSelector((state) => state.token);

  const [branchId, setBranchId] = useState<string>("");
  const [counterId, setCounterId] = useState<string>("");

  const [branches, setBranches] = useState<any[]>([]);
  const [counters, setCounters] = useState<any[]>([]);

  const [activeQueue, setActiveQueue] = useState<any>(null);
  const [checkingQueue, setCheckingQueue] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.get(process.env.EXPO_PUBLIC_API_BASE_URL + "/branches", {
          headers: { "Cache-Control": "no-cache" },
        }),
        api.get(process.env.EXPO_PUBLIC_API_BASE_URL + "/counters", {
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      const bList = Array.isArray(bRes.data?.data) ? bRes.data.data : [];
      const cList = Array.isArray(cRes.data?.data?.items) ? cRes.data.data.items : [];

      setBranches(bList);
      setCounters(cList);

      if (!branchId && bList.length > 0) {
        setBranchId(bList[0]._id || bList[0].id);
      }
    } catch (e) {
      console.log(e);
      setBranches([]);
      setCounters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCounterId("");
    setActiveQueue(null);
  }, [branchId]);

  const countersForBranch = useMemo(() => {
    if (!branchId) return [];
    return counters.filter((c) => {
      const counterBranchId =
        typeof c.branch === "string" ? c.branch : c.branch?._id;
      return counterBranchId === branchId;
    });
  }, [counters, branchId]);

  useEffect(() => {
    dispatch(fetchMyToken());

    const i = setInterval(() => {
      dispatch(fetchMyToken());
    }, 3000);

    return () => clearInterval(i);
  }, [dispatch]);

  useEffect(() => {
    const run = async () => {
      if (!counterId) {
        setActiveQueue(null);
        return;
      }

      setCheckingQueue(true);
      try {
        const res = await api.get(
          process.env.EXPO_PUBLIC_API_BASE_URL + "/queues/active/" + counterId,
          { headers: { "Cache-Control": "no-cache" } }
        );
        setActiveQueue(res.data?.data ?? null);
      } catch (e: any) {
        setActiveQueue(null);
      } finally {
        setCheckingQueue(false);
      }
    };

    run();
  }, [counterId]);

  const selectedBranch = useMemo(
    () => branches.find((b) => (b._id || b.id) === branchId),
    [branches, branchId]
  );

  const selectedCounter = useMemo(
    () => countersForBranch.find((c) => (c._id || c.id) === counterId),
    [countersForBranch, counterId]
  );

  const selectionComplete = !!branchId && !!counterId;
  const isQueueOpen = activeQueue?.status === "OPEN";

  const statusText = !selectionComplete
    ? "Pending"
    : checkingQueue
    ? "Checking..."
    : isQueueOpen
    ? "Ready"
    : "Closed";

  const statusBg =
    statusText === "Ready"
      ? "bg-green-100"
      : statusText === "Closed"
      ? "bg-red-100"
      : "bg-gray-100";

  const statusColor =
    statusText === "Ready"
      ? "text-green-700"
      : statusText === "Closed"
      ? "text-red-700"
      : "text-gray-700";

  const queueId = activeQueue?._id || activeQueue?.id || "";
  const canCreate = selectionComplete && isQueueOpen && !!queueId && !loading;

  const handleCreateToken = async () => {
  if (!canCreate) return;
  await dispatch(createToken({ branchId, queueId }));
  dispatch(fetchMyToken());
};

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-extrabold text-gray-900">Token</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Select a branch and counter. If queue is open, create your token.
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
          {error ? (
            <View className="mb-3 bg-white border border-red-200 rounded-2xl p-4">
              <Text className="text-red-600 font-semibold">{error}</Text>
            </View>
          ) : null}

          {/* Current Selection */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ticket size={18} color="#111827" />
                <Text className="ml-2 text-base font-bold text-gray-900">
                  Current Selection
                </Text>
              </View>

              <View className={`px-3 py-1 rounded-full ${statusBg}`}>
                <Text className={`text-xs font-semibold ${statusColor}`}>
                  {statusText}
                </Text>
              </View>
            </View>

            <View className="mt-3">
              <Text className="text-xs text-gray-500">Branch</Text>
              <Text className="text-sm font-semibold text-gray-900 mt-1">
                {selectedBranch?.name || "Not selected"}
              </Text>
            </View>

            <View className="mt-3">
              <Text className="text-xs text-gray-500">Counter</Text>
              <Text className="text-sm font-semibold text-gray-900 mt-1">
                {selectedCounter?.name || "Not selected"}
              </Text>
            </View>

            <View className="mt-3">
              <Text className="text-xs text-gray-500">Queue</Text>
              <Text className="text-sm font-semibold text-gray-900 mt-1">
                {checkingQueue
                  ? "Checking..."
                  : isQueueOpen
                  ? "Open"
                  : selectionComplete
                  ? "Closed"
                  : "—"}
              </Text>
            </View>

            <View className="mt-4">
              <Button
                title={
                  loading
                    ? "Creating..."
                    : !selectionComplete
                    ? "Select branch & counter"
                    : checkingQueue
                    ? "Checking queue..."
                    : isQueueOpen
                    ? "Create Token"
                    : "Queue is closed"
                }
                onPress={handleCreateToken}
                disabled={!canCreate}
              />
            </View>

            {loading || checkingQueue ? (
              <View className="mt-3">
                <Loading />
              </View>
            ) : null}
          </View>

          {/* Branches */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Building2 size={18} color="#111827" />
              <Text className="ml-2 text-base font-bold text-gray-900">
                Choose Branch
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-gray-200">
              <Text className="text-xs font-semibold text-gray-700">
                {branches.length} total
              </Text>
            </View>
          </View>

          {branches.length === 0 ? (
            <View className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
              <Text className="text-base font-bold text-gray-900">
                No branches available
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Pull down to refresh.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap mb-4" style={{ gap: 12 }}>
              {branches.map((branch) => {
                const id = branch._id || branch.id;
                const active = id === branchId;

                return (
                  <Pressable
                    key={id}
                    onPress={() => setBranchId(id)}
                    className={`rounded-2xl p-4 border ${
                      active
                        ? "bg-violet-700 border-violet-700"
                        : "bg-white border-gray-200"
                    }`}
                    style={{ width: cardWidth }}
                  >
                    <Text
                      className={`text-base font-extrabold ${
                        active ? "text-white" : "text-gray-900"
                      }`}
                      numberOfLines={1}
                    >
                      {branch.name}
                    </Text>
                    <Text
                      className={`text-sm mt-1 ${
                        active ? "text-gray-200" : "text-gray-500"
                      }`}
                      numberOfLines={2}
                    >
                      {branch.address || "No address"}
                    </Text>

                    <View
                      className={`mt-3 self-start px-3 py-1 rounded-full ${
                        active ? "bg-white/20" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {active ? "Selected" : "Tap to select"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Counters */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <ListChecks size={18} color="#111827" />
              <Text className="ml-2 text-base font-bold text-gray-900">
                Choose Counter
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-gray-200">
              <Text className="text-xs font-semibold text-gray-700">
                {countersForBranch.length} total
              </Text>
            </View>
          </View>

          {!branchId ? (
            <View className="bg-white rounded-2xl p-5 border border-gray-200">
              <Text className="text-base font-bold text-gray-900">
                Select a branch first
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Counters will appear after selecting a branch.
              </Text>
            </View>
          ) : countersForBranch.length === 0 ? (
            <View className="bg-white rounded-2xl p-5 border border-gray-200">
              <Text className="text-base font-bold text-gray-900">
                No counters available
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                This branch has no counters.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {countersForBranch.map((counter) => {
                const id = counter._id || counter.id;
                const active = id === counterId;

                return (
                  <Pressable
                    key={id}
                    onPress={() => setCounterId(id)}
                    className={`rounded-2xl p-4 border ${
                      active
                        ? "bg-violet-700 border-violet-700"
                        : "bg-white border-gray-200"
                    }`}
                    style={{ width: cardWidth }}
                  >
                    <Text
                      className={`text-base font-extrabold ${
                        active ? "text-white" : "text-gray-900"
                      }`}
                      numberOfLines={1}
                    >
                      {counter.code
                        ? `${counter.name} (${counter.code})`
                        : counter.name}
                    </Text>

                    <View
                      className={`mt-3 self-start px-3 py-1 rounded-full ${
                        active ? "bg-white/20" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {active ? "Selected" : "Tap to select"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {myToken ? (
            <View className="mt-5">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Your Token
              </Text>
              <TokenCard token={myToken?.data ?? myToken} />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
