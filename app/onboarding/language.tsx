import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import type { Language } from "@/context/AppContext";

const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
];

function LanguageCard({
  item,
  selected,
  onSelect,
}: {
  item: (typeof LANGUAGES)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect();
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.cardText}>
          <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
            {item.native}
          </Text>
          <Text style={styles.cardSub}>{item.label}</Text>
        </View>
        {selected && (
          <View style={styles.checkCircle}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function LanguageScreen() {
  const { language, setLanguage } = useApp();
  const insets = useSafeAreaInsets();

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/onboarding/setup");
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 24,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoSmall}>
          <Text style={styles.logoEmoji}>🤖</Text>
        </View>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>
          भाषा निवडा / भाषा चुनें
        </Text>
      </View>

      <View style={styles.cards}>
        {LANGUAGES.map((lang) => (
          <LanguageCard
            key={lang.code}
            item={lang}
            selected={language === lang.code}
            onSelect={() => setLanguage(lang.code)}
          />
        ))}
      </View>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Next →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8B95A8",
    textAlign: "center",
  },
  cards: {
    gap: 14,
    flex: 1,
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1E3A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 16,
  },
  cardSelected: {
    borderColor: "#4A90D9",
    backgroundColor: "#1A2A4A",
  },
  flag: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: "#C8D6E5",
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: "#FFFFFF",
  },
  cardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8B95A8",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  nextBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
