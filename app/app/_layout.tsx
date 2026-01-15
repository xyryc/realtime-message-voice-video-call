import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "./global.css";
import { Provider, useSelector } from "react-redux";
import { persistor, RootState, store } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  function NavigationContent() {
    const router = useRouter();
    const segments = useSegments();
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
      const inAuthGroup = segments[0] === "(auth)";

      if (!token && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (token && inAuthGroup) {
        router.replace("/(tabs)");
      }
    }, [token, segments]);

    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          value={colorScheme === "light" ? DefaultTheme : DarkTheme}
        >
          <NavigationContent />
          <StatusBar style="auto" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
