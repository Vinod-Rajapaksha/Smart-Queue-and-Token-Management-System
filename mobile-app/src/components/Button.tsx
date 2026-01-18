import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ColorValue } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  fullWidth = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const sizes = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24 },
    large: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const textVariants = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-blue-600",
    danger: "text-white",
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  const gradientColors: readonly [ColorValue, ColorValue] =
    variant === "primary"
      ? ["#4f46e5", "#7c3aed"]
      : variant === "secondary"
      ? ["#374151", "#111827"]
      : ["#ef4444", "#dc2626"];

  const Content = () => (
    <View className="flex-row items-center justify-center">
      {icon && !loading ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#3b82f6" : "#ffffff"} />
      ) : (
        <Text className={`font-semibold ${textVariants[variant]} ${textSizes[size]}`}>
          {title}
        </Text>
      )}
    </View>
  );

  const baseClasses = `rounded-2xl ${fullWidth ? "w-full" : ""} ${
    disabled ? "opacity-50" : ""
  }`;

  // Gradient button
  if (variant === "primary" || variant === "secondary" || variant === "danger") {
    return (
      <TouchableOpacity
        className={baseClasses}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            {
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            },
            sizes[size],
          ]}
        >
          <Content />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outline button
  return (
    <TouchableOpacity
      className={`border border-blue-500 ${baseClasses}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[sizes[size], style]}
      {...props}
    >
      <Content />
    </TouchableOpacity>
  );
}
