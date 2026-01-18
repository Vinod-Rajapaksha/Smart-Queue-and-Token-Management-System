import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  SkipForward,
  HelpCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type TokenStatus =
  | "CREATED"
  | "WAITING"
  | "CALLING"
  | "SERVING"
  | "COMPLETED"
  | "CANCELLED"
  | "SKIPPED"
  | string;

interface TokenCardProps {
  token: any;
  onPress?: () => void;
}

const STATUS_UI: Record<
  string,
  { text: string; icon: any; colors: [string, string] }
> = {
  CREATED: {
    text: "Created",
    icon: PauseCircle,
    colors: ["#f59e0b", "#eab308"],
  },
  WAITING: {
    text: "Waiting",
    icon: Clock,
    colors: ["#f59e0b", "#eab308"],
  },
  CALLING: {
    text: "Calling Now",
    icon: AlertCircle,
    colors: ["#8b5cf6", "#6366f1"],
  },
  SERVING: {
    text: "Now Serving",
    icon: AlertCircle,
    colors: ["#3b82f6", "#06b6d4"],
  },
  COMPLETED: {
    text: "Completed",
    icon: CheckCircle,
    colors: ["#10b981", "#22c55e"],
  },
  CANCELLED: {
    text: "Cancelled",
    icon: XCircle,
    colors: ["#ef4444", "#f87171"],
  },
  SKIPPED: {
    text: "Skipped",
    icon: SkipForward,
    colors: ["#6b7280", "#9ca3af"],
  },
};

export default function TokenCard({ token, onPress }: TokenCardProps) {
  const statusKey = useMemo(
    () => String((token?.status as TokenStatus) ?? "").toUpperCase(),
    [token?.status]
  );

  const cfg = STATUS_UI[statusKey] ?? {
    text: statusKey || "Unknown",
    icon: HelpCircle,
    colors: ["#6b7280", "#9ca3af"] as [string, string],
  };

  const StatusIcon = cfg.icon;
  
  const tokenNumber = token?.tokenNumber ?? token?.number ?? "-";
  const branchName = token?.branch?.name ?? token?.branchName ?? "-";
  const counterText =
    token?.counter?.code ?? token?.counter?.name ?? token?.counterNumber ?? null;
  const createdAt = token?.createdAt ?? null;

  const CardContent = () => (
    <LinearGradient
      colors={cfg.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6 shadow-xl"
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-white text-sm font-medium opacity-90">
            Token #{String(tokenNumber)}
          </Text>
        </View>
        <StatusIcon size={24} color="#ffffff" />
      </View>

      {/* Token Number */}
      <View className="items-center my-4">
        <Text className="text-white text-6xl font-black tracking-wider">
          {String(tokenNumber)}
        </Text>
        <Text className="text-white text-sm font-medium mt-2 opacity-90">
          {cfg.text}
        </Text>
        <Text className="text-white/70 text-xs mt-1">
          Status: {statusKey || "UNKNOWN"}
        </Text>
      </View>

      {/* Details */}
      <View className="bg-white/10 rounded-2xl p-4">
        <View className="flex-row items-center mb-2">
          <MapPin size={16} color="#ffffff" />
          <Text className="text-white ml-2 font-medium">{branchName}</Text>
        </View>

        {counterText ? (
          <View className="flex-row items-center mb-2">
            <View className="w-4 h-4 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white text-xs font-bold">C</Text>
            </View>
            <Text className="text-white ml-2 font-medium">
              {String(counterText)}
            </Text>
          </View>
        ) : null}

        {createdAt ? (
          <Text className="text-white/75 text-xs mt-3">
            Created:{" "}
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        ) : null}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="mb-4 mx-2"
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View className="mb-4 mx-2">
      <CardContent />
    </View>
  );
}
