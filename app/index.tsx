import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useApp } from "@/context/AppContext";

export default function IndexScreen() {
  const { isLoading, isOnboarded } = useApp();

  useEffect(() => {
    if (isLoading) return;
    router.replace("/splash");
  }, [isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E27", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#4A90D9" />
    </View>
  );
}
