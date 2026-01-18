import { Tabs } from "expo-router";
import { LogIn, UserPlus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen 
          name="login" 
          options={{ 
            title: "Login",
            tabBarIcon: ({ color, size }) => <LogIn size={size} color={color} />,
          }} 
        />
        <Tabs.Screen 
          name="register" 
          options={{ 
            title: "Register",
            tabBarIcon: ({ color, size }) => <UserPlus size={size} color={color} />,
          }} 
        />
      </Tabs>
    </SafeAreaView>
  );
}
