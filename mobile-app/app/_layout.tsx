import "../tailwind.css";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store/store";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
