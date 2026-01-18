import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from "lucide-react-native";

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  icon?: "email" | "password" | "user" | "phone" | "building" | "none";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  multiline?: boolean;
  numberOfLines?: number;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  icon = "none",
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const icons = {
    email: Mail,
    password: Lock,
    user: User,
    phone: Phone,
    building: Building,
    none: null,
  };

  const IconComponent = icons[icon];

  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-medium mb-2 ml-1">{label}</Text>}

      <View
        className={`flex-row border rounded-2xl px-4 py-3 bg-white ${
          multiline ? "items-start" : "items-center"
        } ${isFocused ? "border-blue-500" : "border-gray-300"} ${
          error ? "border-red-500" : ""
        }`}
      >
        {IconComponent && (
          <View style={{ marginRight: 12, marginTop: multiline ? 4 : 0 }}>
            <IconComponent
              size={20}
              color={error ? "#ef4444" : isFocused ? "#3b82f6" : "#9ca3af"}
            />
          </View>
        )}

        <TextInput
          style={{
            flex: 1,
            color: "#111827",
            textAlignVertical: multiline ? "top" : "center",
          }}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor="#3b82f6"
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{ marginLeft: 8 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#9ca3af" />
            ) : (
              <Eye size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
}
