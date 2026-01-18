import { Tabs, Redirect } from "expo-router";
import { useAppSelector } from "../../src/store/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { Home, Ticket, User } from "lucide-react-native";

export default function TabsLayout() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="token"
          options={{
            title: "Token",
            tabBarIcon: ({ color, size }) => (
              <Ticket size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
