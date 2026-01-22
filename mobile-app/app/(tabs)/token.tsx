import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { createToken, fetchMyTokensSplit, submitTokenRating, clearSuccessMessage, clearError } from "../../src/store/slices/token.slice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RatingModal from "../(modals)/rating";
import Button from "../../src/components/Button";
import TokenCard from "../../src/components/TokenCard";
import Loading from "../../src/components/Loading";
import PickerModal from "../(modals)/picker";
import api from "../../src/services/api";
import { Building2, ListChecks, Ticket, History, ChevronDown } from "lucide-react-native";

export default function Token() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeTokens, completedTokens, loading: creatingToken, error } = useAppSelector((state) => state.token);

  const { successMessage } = useAppSelector((state) => state.token);

  const [branchId, setBranchId] = useState<string>("");
  const [counterId, setCounterId] = useState<string>("");

  const [branches, setBranches] = useState<any[]>([]);
  const [counters, setCounters] = useState<any[]>([]);

  const [activeQueue, setActiveQueue] = useState<any>(null);
  const [checkingQueue, setCheckingQueue] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [counterPickerOpen, setCounterPickerOpen] = useState(false);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingToken, setRatingToken] = useState<any | null>(null);

  const PROMPT_KEY = "PROMPTED_RATING_TOKENS";

  const getPromptedIds = async (): Promise<string[]> => {
    const raw = await AsyncStorage.getItem(PROMPT_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const markPrompted = async (tokenId: string) => {
    const list = await getPromptedIds();
    if (list.includes(tokenId)) return;
    list.push(tokenId);
    await AsyncStorage.setItem(PROMPT_KEY, JSON.stringify(list));
  };

  useEffect(() => {
    if (!completedTokens?.length) return;
    if (ratingOpen) return;

    const run = async () => {
      const prompted = await getPromptedIds();

      const target = completedTokens
        .map((x: any) => x?.data ?? x)
        .find((t: any) => {
          const id = t._id || t.id;
          if (!id) return false;

          const isCompleted = t.status === "COMPLETED"; 

          return isCompleted && !prompted.includes(id);
        });

      if (target) {
        const id = target._id || target.id;
        await markPrompted(id);
        setRatingToken(target);
        setRatingOpen(true);
      }
    };

    run();
  }, [completedTokens, ratingOpen]);

  const handleSubmitRating = async (payload: any) => {
    if (!ratingToken) throw new Error("No token");

    const tokenId = ratingToken._id || ratingToken.id;

    const res = await dispatch(
      submitTokenRating({
        tokenId,
        rating: payload?.rating,
        comment: payload?.comment,
      })
    );

    if (submitTokenRating.fulfilled.match(res)) {
      dispatch(fetchMyTokensSplit());
      return true;
    }
    throw new Error("Submit failed");
  };

  const fetchData = async (showPageLoader = true) => {
    if (showPageLoader) setPageLoading(true);
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

    } catch (e) {
      console.log(e);
      setBranches([]);
      setCounters([]);
    } finally {
      if (showPageLoader) setPageLoading(false);
    }
  };

  const fetchActiveQueue = async () => {
    if (!counterId) {
      setActiveQueue(null);
      return;
    }
    setCheckingQueue(true);
    try {
      const res = await api.get(
        process.env.EXPO_PUBLIC_API_BASE_URL + "/queues/active/" + counterId,
        {
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
          params: { t: Date.now() },
        }
      );
      setActiveQueue(res.data?.data ?? null);
    } catch (e) {
      setActiveQueue(null);
    } finally {
      setCheckingQueue(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!successMessage && !error) return;

    const t = setTimeout(() => {
      if (successMessage) dispatch(clearSuccessMessage());
      if (error) dispatch(clearError());
    }, 2800);

    return () => clearTimeout(t);
  }, [successMessage, error, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData(false);
      await dispatch(fetchMyTokensSplit());
      await fetchActiveQueue();
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
    dispatch(fetchMyTokensSplit());

    const i = setInterval(() => {
      dispatch(fetchMyTokensSplit());
    }, 3000);

    return () => clearInterval(i);
  }, [dispatch]);

  useEffect(() => {
    fetchActiveQueue();
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
  const canCreate = selectionComplete && isQueueOpen && !!queueId && !creatingToken;

  const handleCreateToken = async () => {
  if (!canCreate) return;
  await dispatch(createToken({ branchId, queueId }));
  dispatch(fetchMyTokensSplit());
};

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-start justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-gray-900">Token</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Select a branch and counter. If queue is open, create your token.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/token-history")}
          className="p-2 rounded-xl bg-white border border-gray-200"
        >
          <History size={18} color="#111827" />
        </Pressable>
      </View>

      {pageLoading ? (
        <View className="flex-1 items-center justify-center">
          <Loading message="Loading ..." />
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

          {successMessage ? (
            <View className="mb-3 bg-white border border-green-200 rounded-2xl p-4">
              <Text className="text-green-600 font-semibold">{successMessage}</Text>
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
                  creatingToken
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

          <View className="mb-4">
            <Pressable
              onPress={() => setBranchPickerOpen(true)}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-xs text-gray-500">Branch</Text>
                <Text className="text-base font-extrabold text-gray-900 mt-1" numberOfLines={1}>
                  {selectedBranch?.name || "Select Branch"}
                </Text>
                <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                  {selectedBranch?.address || "Tap to choose a branch"}
                </Text>
              </View>

              <ChevronDown size={18} color="#111827" />
            </Pressable>
          </View>

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

          <View className="mb-4">
            <Pressable
              onPress={() => {
                if (!branchId) return;
                setCounterPickerOpen(true);
              }}
              className={`border rounded-2xl p-4 flex-row items-center justify-between ${
                branchId ? "bg-white border-gray-200" : "bg-gray-100 border-gray-200"
              }`}
            >
              <View className="flex-1 pr-3">
                <Text className="text-xs text-gray-500">Counter</Text>
                <Text className="text-base font-extrabold text-gray-900 mt-1" numberOfLines={1}>
                      {selectedCounter
                        ? selectedCounter.code
                          ? `${selectedCounter.name} (${selectedCounter.code})`
                          : selectedCounter.name
                        : "Select Counter"
                      }
                </Text>

                {!branchId ? (
                  <Text className="text-sm text-gray-500 mt-1">
                    Select a branch first
                  </Text>
                ) : !selectedCounter ? (
                  <Text className="text-sm text-gray-500 mt-1">
                    Tap to choose a counter
                  </Text>
                ) : (
                  <>
                    {!!selectedCounter.description && (
                      <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                        {selectedCounter.description}
                      </Text>
                    )}
                    <Text className="text-sm text-gray-400 mt-1">
                      Tap to change counter
                    </Text>
                  </>
                )}
              </View>

              <ChevronDown size={18} color="#111827" />
            </Pressable>

            {!branchId ? (
              <Text className="text-xs text-gray-500 mt-2">
                Select a branch first to see counters.
              </Text>
            ) : null}
          </View>

          <View className="mt-5">
            <Text className="text-base font-bold text-gray-900 mb-3">
              Your Current Tokens
            </Text>

            {activeTokens.length === 0 ? (
              <View className="bg-white rounded-2xl p-5 border border-gray-200">
                <Text className="text-base font-bold text-gray-900">
                  No active tokens
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Create a token when queue is open.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {activeTokens.map((t: any) => (
                  <TokenCard key={t._id || t.id} token={t?.data ?? t} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <PickerModal
        visible={branchPickerOpen}
        title="Select Branch"
        items={branches}
        selectedId={branchId}
        onClose={() => setBranchPickerOpen(false)}
        onSelect={(branch) => {
          const id = branch._id || branch.id;
          setBranchId(id);
        }}
        getId={(b: any) => (b._id || b.id) as string}
        getTitle={(b: any) => b.name}
        getSubtitle={(b: any) => b.address}
        searchPlaceholder="Search branch by name / address"
        emptyTitle="No branches found"
        emptySubtitle="Pull to refresh or check again."
      />

      <PickerModal
        visible={counterPickerOpen}
        title="Select Counter"
        items={countersForBranch}
        selectedId={counterId}
        onClose={() => setCounterPickerOpen(false)}
        onSelect={(counter) => {
          const id = counter._id || counter.id;
          setCounterId(id);
        }}
        getId={(c: any) => (c._id || c.id) as string}
        getTitle={(c: any) =>
          c.code ? `${c.name} (${c.code})` : c.name
        }
        getSubtitle={(c: any) => (c.description ? c.description : "")}
        searchPlaceholder="Search counter by name / code"
        emptyTitle={!branchId ? "Select a branch first" : "No counters found"}
        emptySubtitle={!branchId ? "Choose a branch to see counters." : "This branch has no counters."}
      />

      <RatingModal
        visible={ratingOpen}
        token={ratingToken}
        onClose={() => {
          setRatingOpen(false);
          setRatingToken(null);
        }}
        onSubmit={handleSubmitRating}
      />
    </View>
  );
}
