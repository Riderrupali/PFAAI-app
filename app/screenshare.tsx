import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { processMessage } from "@/utils/aiEngine";
import type { Language } from "@/context/AppContext";

const APP_KNOWLEDGE: Record<string, Record<Language, string>> = {
  youtube: {
    en: "YouTube app: Tap the search icon (magnifying glass) at the top to search videos. Tap the red play button to watch. Use the bottom tabs: Home, Shorts, Add, Subscriptions, Library.",
    mr: "YouTube app: वरती search icon (भिंग) दाबा. लाल play button दाबून video पाहा. खाली: Home, Shorts, Add, Subscriptions, Library आहेत.",
    hi: "YouTube app: ऊपर search icon (आवर्धक) दबाएं। लाल play button दबाकर video देखें। नीचे: Home, Shorts, Add, Subscriptions, Library हैं।",
  },
  chrome: {
    en: "Chrome browser: Tap the address bar at the top to search or enter a URL. Tap the 3-dot menu for options. Use tabs button to open multiple pages.",
    mr: "Chrome browser: वरची address bar दाबून search करा किंवा URL टाका. 3-dot menu मध्ये options आहेत. Tabs button ने अनेक pages उघडता येतात.",
    hi: "Chrome browser: ऊपर की address bar में search करें या URL डालें। 3-dot menu में options हैं। Tabs button से कई pages खोल सकते हैं।",
  },
  whatsapp: {
    en: "WhatsApp: Green chat icon to start new chat. Camera icon to send photos. Microphone to send voice messages. Bottom tabs: Chats, Status, Calls.",
    mr: "WhatsApp: हिरवा chat icon नवा chat सुरू करतो. Camera icon photo पाठवते. Microphone voice message पाठवते. खाली: Chats, Status, Calls.",
    hi: "WhatsApp: हरा chat icon से नया chat शुरू करें। Camera icon से photo भेजें। Microphone से voice message भेजें। नीचे: Chats, Status, Calls।",
  },
  settings: {
    en: "Settings: Search bar at top to find any setting. WiFi, Bluetooth, Display, Sound, Battery, Apps, Storage — all available here.",
    mr: "Settings: वरची search bar कोणतीही setting शोधते. WiFi, Bluetooth, Display, Sound, Battery, Apps, Storage — सगळं इथे आहे.",
    hi: "Settings: ऊपर की search bar से कोई भी setting खोजें। WiFi, Bluetooth, Display, Sound, Battery, Apps, Storage — सब यहाँ हैं।",
  },
  ludo: {
    en: "Ludo strategy: Always try to bring all 4 tokens out. Block opponents near their home. Keep tokens together for safety. Move the token that is closest to winning first.",
    mr: "Ludo strategy: सगळ्या 4 tokens बाहेर काढा. opponent च्या घराजवळ block करा. tokens एकत्र ठेवा. जिंकण्याच्या जवळ असलेली token आधी हलवा.",
    hi: "Ludo strategy: सभी 4 tokens बाहर निकालें। opponent के घर के पास block करें। tokens को साथ रखें। जीत के करीब वाला token पहले चलाएं।",
  },
};

function detectApp(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("youtube") || lower.includes("yt")) return "youtube";
  if (lower.includes("chrome") || lower.includes("browser")) return "chrome";
  if (lower.includes("whatsapp") || lower.includes("wa")) return "whatsapp";
  if (lower.includes("settings") || lower.includes("setting") || lower.includes("seting")) return "settings";
  if (lower.includes("ludo") || lower.includes("game")) return "ludo";
  return null;
}

function getScreenResponse(userInput: string, lang: Language, userName: string, aiName: string): string {
  const appKey = detectApp(userInput);
  if (appKey && APP_KNOWLEDGE[appKey]) {
    return APP_KNOWLEDGE[appKey][lang];
  }
  const greetings: Record<Language, string> = {
    en: `I can see your screen! 👁️ Point the camera at your phone screen, book, or paper. Ask me anything about what you see — I'll guide you step by step!`,
    mr: `मी तुमची screen बघतोय! 👁️ Camera तुमच्या phone, book किंवा paper वर धरा. जे दिसतंय त्याबद्दल विचारा — मी step by step सांगेन!`,
    hi: `मैं आपकी screen देख रहा हूँ! 👁️ Camera अपने phone, book या paper पर रखें। जो दिखे उसके बारे में पूछें — मैं step by step बताऊंगा!`,
  };
  return greetings[lang];
}

function speakText(text: string, lang: Language, voiceType: string) {
  if (Platform.OS === "web") return;
  try {
    const Speech = require("expo-speech");
    const langMap: Record<Language, string> = { en: "en-US", mr: "mr-IN", hi: "hi-IN" };
    const pitch = voiceType === "child" ? 1.6 : voiceType === "female" ? 1.1 : 0.85;
    Speech.stop();
    Speech.speak(text, { language: langMap[lang], pitch, rate: 0.9 });
  } catch {}
}

function stopSpeech() {
  if (Platform.OS === "web") return;
  try { require("expo-speech").stop(); } catch {}
}

export default function ScreenShareScreen() {
  const { language, userName, aiName, voiceType } = useApp();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [inputText, setInputText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const responseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initialMsg = getScreenResponse("", language, userName, aiName);
    setAiResponse(initialMsg);
    Animated.timing(responseOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  async function handleAsk() {
    const text = inputText.trim();
    if (!text || isThinking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText("");
    setIsThinking(true);

    let response = getScreenResponse(text, language, userName, aiName);
    if (!detectApp(text)) {
      response = await processMessage(text, { userName, aiName, language });
    }

    await new Promise((r) => setTimeout(r, 500));
    setHistory((prev) => [{ q: text, a: response }, ...prev]);
    setAiResponse(response);
    responseOpacity.setValue(0);
    Animated.timing(responseOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    setIsSpeaking(true);
    speakText(response, language, voiceType);
    const est = Math.max(2000, response.length * 55);
    setTimeout(() => setIsSpeaking(false), est);
    setIsThinking(false);
  }

  function handleStopSpeak() {
    stopSpeech();
    setIsSpeaking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { stopSpeech(); router.back(); }} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {language === "mr" ? "Live Screen AI" : language === "hi" ? "Live Screen AI" : "Live Screen AI"}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.webCamPlaceholder}>
          <Feather name="monitor" size={48} color="#4A90D9" />
          <Text style={styles.webCamText}>
            {language === "mr"
              ? "Camera Android phone वर काम करतो"
              : language === "hi"
              ? "Camera Android phone पर काम करता है"
              : "Camera works on Android phone"}
          </Text>
        </View>
        <WebInputBar
          language={language}
          inputText={inputText}
          setInputText={setInputText}
          isThinking={isThinking}
          handleAsk={handleAsk}
          botPad={botPad}
          aiResponse={aiResponse}
          isSpeaking={isSpeaking}
          handleStopSpeak={handleStopSpeak}
          responseOpacity={responseOpacity}
          pulseAnim={pulseAnim}
        />
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#4A90D9" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: topPad }]}>
        <Feather name="camera-off" size={56} color="#4A90D9" style={{ marginBottom: 20 }} />
        <Text style={styles.permText}>
          {language === "mr"
            ? "Camera permission द्या — screen बघण्यासाठी"
            : language === "hi"
            ? "Camera permission दें — screen देखने के लिए"
            : "Allow camera to enable live screen AI"}
        </Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>
            {language === "mr" ? "Permission द्या" : language === "hi" ? "Permission दें" : "Allow Camera"}
          </Text>
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>
            {language === "mr" ? "← मागे जा" : language === "hi" ? "← वापस जाएं" : "← Go Back"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live camera feed */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => { stopSpeech(); router.back(); }} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.headerTitle}>Live Screen AI</Text>
        </View>
        {isSpeaking ? (
          <Pressable onPress={handleStopSpeak} style={styles.stopBtn}>
            <Feather name="volume-x" size={18} color="#EF4444" />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* AI Response overlay */}
      <Animated.View style={[styles.responseCard, { opacity: responseOpacity }]}>
        <View style={styles.responseHeader}>
          <Animated.View style={[styles.aiAvatarSmall, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </Animated.View>
          <Text style={styles.aiNameLabel}>{aiName}</Text>
          {isSpeaking && (
            <View style={styles.speakingBadge}>
              <Feather name="volume-2" size={11} color="#4A90D9" />
              <Text style={styles.speakingText}>
                {language === "mr" ? "बोलतोय" : language === "hi" ? "बोल रहा हूँ" : "Speaking"}
              </Text>
            </View>
          )}
        </View>
        <ScrollView style={{ maxHeight: 140 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.responseText}>{aiResponse || "..."}</Text>
        </ScrollView>
      </Animated.View>

      {/* History */}
      {history.length > 0 && (
        <ScrollView
          style={styles.historyScroll}
          showsVerticalScrollIndicator={false}
          horizontal
        >
          {history.slice(0, 5).map((h, i) => (
            <View key={i} style={styles.historyChip}>
              <Text style={styles.historyChipText} numberOfLines={1}>{h.q}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <WebInputBar
        language={language}
        inputText={inputText}
        setInputText={setInputText}
        isThinking={isThinking}
        handleAsk={handleAsk}
        botPad={botPad}
        aiResponse={aiResponse}
        isSpeaking={isSpeaking}
        handleStopSpeak={handleStopSpeak}
        responseOpacity={responseOpacity}
        pulseAnim={pulseAnim}
        transparent
      />
    </View>
  );
}

function WebInputBar({
  language, inputText, setInputText, isThinking, handleAsk,
  botPad, isSpeaking, handleStopSpeak, transparent,
}: {
  language: Language; inputText: string; setInputText: (t: string) => void;
  isThinking: boolean; handleAsk: () => void; botPad: number;
  aiResponse: string; isSpeaking: boolean; handleStopSpeak: () => void;
  responseOpacity: Animated.Value; pulseAnim: Animated.Value; transparent?: boolean;
}) {
  const placeholder =
    language === "mr"
      ? "Screen बद्दल विचारा... (YouTube, Chrome, Ludo...)"
      : language === "hi"
      ? "Screen के बारे में पूछें... (YouTube, Chrome, Ludo...)"
      : "Ask about screen... (YouTube, Chrome, Ludo...)";

  return (
    <View style={[styles.inputBar, transparent && styles.inputBarTransparent, { paddingBottom: botPad + 10 }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.textInput, transparent && styles.textInputTransparent]}
          placeholder={placeholder}
          placeholderTextColor="#8B95A8"
          value={inputText}
          onChangeText={setInputText}
          returnKeyType="send"
          onSubmitEditing={handleAsk}
          blurOnSubmit={false}
        />
        {isSpeaking ? (
          <Pressable style={styles.stopSpeakBtn} onPress={handleStopSpeak}>
            <Feather name="volume-x" size={20} color="#EF4444" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.askBtn, (!inputText.trim() || isThinking) && styles.askBtnDisabled]}
            onPress={handleAsk}
            disabled={!inputText.trim() || isThinking}
          >
            {isThinking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="mic" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E27" },
  center: { alignItems: "center", justifyContent: "center", padding: 32 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000055",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#00000055",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  headerTitle: {
    fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFFFFF",
  },
  liveDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444",
  },
  stopBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#EF444433",
    alignItems: "center", justifyContent: "center",
  },
  responseCard: {
    margin: 16,
    backgroundColor: "#0A0E27EE",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#4A90D955",
    zIndex: 10,
  },
  responseHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10,
  },
  aiAvatarSmall: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#4A90D9",
    alignItems: "center", justifyContent: "center",
  },
  aiNameLabel: {
    fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#4A90D9", flex: 1,
  },
  speakingBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#4A90D922", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  speakingText: {
    fontSize: 11, fontFamily: "Inter_500Medium", color: "#4A90D9",
  },
  responseText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#C8D6E5", lineHeight: 22,
  },
  historyScroll: {
    paddingHorizontal: 16, maxHeight: 44, zIndex: 10,
  },
  historyChip: {
    backgroundColor: "#1A1E3A", borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
    marginRight: 8, maxWidth: 160,
  },
  historyChipText: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: "#8B95A8",
  },
  inputBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#0A0E27",
    borderTopWidth: 1, borderTopColor: "#1A1E3A",
    paddingHorizontal: 16, paddingTop: 10, zIndex: 20,
  },
  inputBarTransparent: {
    backgroundColor: "#0A0E27CC",
  },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  textInput: {
    flex: 1, height: 46,
    backgroundColor: "#1A1E3A",
    borderRadius: 23, paddingHorizontal: 16,
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#FFFFFF",
    borderWidth: 1, borderColor: "#2D3561",
  },
  textInputTransparent: {
    backgroundColor: "#1A1E3ACC",
  },
  askBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#4A90D9",
    alignItems: "center", justifyContent: "center",
  },
  askBtnDisabled: { backgroundColor: "#1A1E3A" },
  stopSpeakBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#EF444422",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#EF444466",
  },
  webCamPlaceholder: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 16,
  },
  webCamText: {
    fontSize: 15, fontFamily: "Inter_400Regular", color: "#8B95A8",
    textAlign: "center", paddingHorizontal: 32,
  },
  permText: {
    fontSize: 16, fontFamily: "Inter_400Regular", color: "#C8D6E5",
    textAlign: "center", marginBottom: 24, lineHeight: 24,
  },
  permBtn: {
    backgroundColor: "#4A90D9", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
    marginBottom: 16,
  },
  permBtnText: {
    fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF",
  },
  backLink: { padding: 12 },
  backLinkText: {
    fontSize: 14, fontFamily: "Inter_500Medium", color: "#8B95A8",
  },
});
