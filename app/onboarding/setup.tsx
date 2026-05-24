import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import type { Language, VoiceType } from "@/context/AppContext";
import { t } from "@/constants/strings";

const VOICE_OPTIONS: { type: VoiceType; enLabel: string; mrLabel: string; hiLabel: string; icon: string }[] = [
  { type: "female", enLabel: "Female", mrLabel: "महिला", hiLabel: "महिला", icon: "👩" },
  { type: "male", enLabel: "Male", mrLabel: "पुरुष", hiLabel: "पुरुष", icon: "👨" },
  { type: "child", enLabel: "Child", mrLabel: "मुलगा/मुलगी", hiLabel: "बच्चा", icon: "👦" },
];

function getVoiceLabel(v: (typeof VOICE_OPTIONS)[0], lang: Language): string {
  if (lang === "mr") return v.mrLabel;
  if (lang === "hi") return v.hiLabel;
  return v.enLabel;
}

export default function SetupScreen() {
  const { language, completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState("");
  const [aiName, setAiName] = useState("PFAAI");
  const [voiceType, setVoiceType] = useState<VoiceType>("female");

  function handleDone() {
    if (!userName.trim()) {
      Alert.alert(
        language === "mr" ? "नाव सांगा" : language === "hi" ? "नाम बताएं" : "Name required",
        language === "mr"
          ? "कृपया तुमचे नाव सांगा"
          : language === "hi"
          ? "कृपया अपना नाम बताएं"
          : "Please enter your name"
      );
      return;
    }
    if (!aiName.trim()) {
      Alert.alert(
        language === "mr" ? "नाव सांगा" : language === "hi" ? "नाम बताएं" : "Name required",
        language === "mr"
          ? "AI मित्राला एक नाव द्या"
          : language === "hi"
          ? "AI दोस्त को एक नाम दें"
          : "Please give your AI friend a name"
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding({
      userName: userName.trim(),
      aiName: aiName.trim(),
      voiceType,
      language,
    });
    router.replace("/home");
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 24,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.logoSmall}>
          <Text style={styles.logoEmoji}>🤖</Text>
        </View>
        <Text style={styles.title}>{t(language, "setupTitle")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t(language, "yourName")}</Text>
        <View style={styles.inputWrap}>
          <Feather name="user" size={18} color="#8B95A8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t(language, "yourNamePlaceholder")}
            placeholderTextColor="#8B95A8"
            value={userName}
            onChangeText={setUserName}
            autoFocus
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t(language, "aiName")}</Text>
        <View style={styles.inputWrap}>
          <Feather name="cpu" size={18} color="#8B95A8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t(language, "aiNamePlaceholder")}
            placeholderTextColor="#8B95A8"
            value={aiName}
            onChangeText={setAiName}
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t(language, "voiceType")}</Text>
        <View style={styles.voiceRow}>
          {VOICE_OPTIONS.map((v) => (
            <Pressable
              key={v.type}
              style={[styles.voiceBtn, voiceType === v.type && styles.voiceBtnActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setVoiceType(v.type);
              }}
            >
              <Text style={styles.voiceEmoji}>{v.icon}</Text>
              <Text
                style={[
                  styles.voiceLabel,
                  voiceType === v.type && styles.voiceLabelActive,
                ]}
              >
                {getVoiceLabel(v, language)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={styles.doneBtn} onPress={handleDone}>
        <Text style={styles.doneBtnText}>{t(language, "next")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  container: {
    paddingHorizontal: 24,
    gap: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#8B95A8",
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1E3A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D3561",
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
  },
  voiceRow: {
    flexDirection: "row",
    gap: 12,
  },
  voiceBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#1A1E3A",
    borderWidth: 2,
    borderColor: "transparent",
    gap: 6,
  },
  voiceBtnActive: {
    borderColor: "#4A90D9",
    backgroundColor: "#1A2A4A",
  },
  voiceEmoji: {
    fontSize: 28,
  },
  voiceLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#8B95A8",
  },
  voiceLabelActive: {
    color: "#4A90D9",
    fontFamily: "Inter_600SemiBold",
  },
  doneBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 12,
  },
  doneBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
