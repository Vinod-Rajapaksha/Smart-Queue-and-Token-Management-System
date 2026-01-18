import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
}

export default function Loading({
  message,
  fullScreen = false,
  size = 64,
}: LoadingProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const Spinner = () => (
    <View className="items-center justify-center">
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ rotate }],
        }}
      >
        <LinearGradient
          colors={["#6366f1", "#8b5cf6", "#ec4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: size / 2,
            padding: size * 0.1,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: size / 2,
            }}
          />
        </LinearGradient>
      </Animated.View>

      {message && (
        <Text className="mt-4 text-base font-medium text-gray-600">
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Spinner />
      </View>
    );
  }

  return <Spinner />;
}
