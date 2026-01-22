import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Stack
        screenOptions={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </SafeAreaView>
  );
}
