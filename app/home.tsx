import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import type { AppMode, Language, Message, VoiceType } from "@/context/AppContext";
import { t } from "@/constants/strings";
import { processMessage } from "@/utils/aiEngine";

function MessageBubble({ msg }: { msg: Message }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        msg.isUser ? styles.bubbleRowUser : styles.bubbleRowAI,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!msg.isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarEmoji}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          msg.isUser ? styles.bubbleUser : styles.bubbleAI,
        ]}
      >
        <Text style={[styles.bubbleText, msg.isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {msg.text}
        </Text>
      </View>
    </Animated.View>
  );
}

const VOICE_TYPES: { type: VoiceType; label: string; icon: string }[] = [
  { type: "female", label: "Female", icon: "👩" },
  { type: "male", label: "Male", icon: "👨" },
  { type: "child", label: "Child", icon: "👦" },
];

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिंदी" },
];

export default function HomeScreen() {
  const {
    language,
    userName,
    aiName,
    voiceType,
    mode,
    messages,
    addMessage,
    clearMessages,
    setMode,
    setLanguage,
    setVoiceType,
    wakeWord,
    setWakeWord,
    resetApp,
  } = useApp();

  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wakeWordInput, setWakeWordInput] = useState(wakeWord);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeId =
        Date.now().toString() + Math.random().toString(36).slice(2, 8);
      addMessage({
        id: welcomeId,
        text: t(language, "welcomeMessage"),
        isUser: false,
        timestamp: Date.now(),
      });
    }
  }, []);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isThinking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText("");

    const userMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      text,
      isUser: true,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setIsThinking(true);

    try {
      const response = await processMessage(text, {
        userName,
        aiName,
        language,
      });

      await new Promise((r) => setTimeout(r, 600));

      const aiMsg: Message = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        text: response,
        isUser: false,
        timestamp: Date.now(),
      };
      addMessage(aiMsg);

      if (mode === "voice") {
        speakText(response);
      }
    } catch {
      // ignore
    } finally {
      setIsThinking(false);
    }
  }

  function speakText(text: string) {
    if (Platform.OS === "web") return;
    try {
      const Speech = require("expo-speech");
      const langMap: Record<Language, string> = {
        en: "en-US",
        mr: "mr-IN",
        hi: "hi-IN",
      };
      const pitch =
        voiceType === "child" ? 1.6 : voiceType === "female" ? 1.1 : 0.85;
      Speech.speak(text, {
        language: langMap[language],
        pitch,
        rate: 0.9,
      });
    } catch {
      // expo-speech not available
    }
  }

  function stopSpeech() {
    if (Platform.OS === "web") return;
    try {
      const Speech = require("expo-speech");
      Speech.stop();
    } catch {}
  }

  function handleClearChat() {
    Alert.alert(
      language === "mr" ? "चॅट साफ करायची?" : language === "hi" ? "चैट साफ करें?" : "Clear chat?",
      language === "mr"
        ? "सगळे messages मिटतील."
        : language === "hi"
        ? "सभी messages मिट जाएंगे।"
        : "All messages will be deleted.",
      [
        { text: t(language, "cancel"), style: "cancel" },
        {
          text: t(language, "clearChat"),
          style: "destructive",
          onPress: () => {
            clearMessages();
            setShowSettings(false);
          },
        },
      ]
    );
  }

  function handleResetApp() {
    Alert.alert(
      t(language, "resetApp"),
      t(language, "confirmReset"),
      [
        { text: t(language, "no"), style: "cancel" },
        {
          text: t(language, "yes"),
          style: "destructive",
          onPress: async () => {
            setShowSettings(false);
            stopSpeech();
            await resetApp();
            router.replace("/splash");
          },
        },
      ]
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.menuBtn}
          onPress={() => {
            setShowSettings(true);
            setWakeWordInput(wakeWord);
          }}
        >
          <Feather name="menu" size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{aiName}</Text>
            <Text style={styles.headerSub}>
              {isThinking
                ? t(language, "processing")
                : language === "mr"
                ? "ऑनलाइन आहे"
                : language === "hi"
                ? "ऑनलाइन है"
                : "Online"}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.liveScreenBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              stopSpeech();
              router.push("/screenshare");
            }}
          >
            <Feather name="monitor" size={16} color="#4A90D9" />
          </Pressable>
          <Pressable
            style={[styles.modeToggle]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              stopSpeech();
              setMode(mode === "chat" ? "voice" : "chat");
            }}
          >
            <Feather
              name={mode === "voice" ? "mic" : "message-circle"}
              size={18}
              color={mode === "voice" ? "#4A90D9" : "#8B95A8"}
            />
          </Pressable>
        </View>
      </View>

      {/* Wake word hint */}
      <View style={styles.wakeWordBar}>
        <Feather name="zap" size={12} color="#4A90D9" />
        <Text style={styles.wakeWordText}> {wakeWord}</Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          inverted
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isThinking ? (
              <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarEmoji}>🤖</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAI, styles.thinkingBubble]}>
                  <Text style={styles.bubbleTextAI}>...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View
          style={[styles.inputBar, { paddingBottom: botPad + 8 }]}
        >
          {mode === "voice" && (
            <Text style={styles.voiceHint}>{t(language, "voiceHint")}</Text>
          )}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={
                mode === "voice"
                  ? t(language, "listening")
                  : t(language, "typeMessage")
              }
              placeholderTextColor="#8B95A8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <Pressable
              style={[
                styles.sendBtn,
                (!inputText.trim() || isThinking) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isThinking}
            >
              <Feather
                name={mode === "voice" ? "mic" : "send"}
                size={20}
                color={inputText.trim() && !isThinking ? "#FFFFFF" : "#8B95A8"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSettings(false)}
        />
        <View style={[styles.settingsSheet, { paddingBottom: botPad + 16 }]}>
          <View style={styles.settingsHandle} />
          <Text style={styles.settingsTitle}>{t(language, "settings")}</Text>

          {/* Language */}
          <Text style={styles.settingsSectionLabel}>{t(language, "changeLanguage")}</Text>
          <View style={styles.settingsRow}>
            {LANGUAGES.map((l) => (
              <Pressable
                key={l.code}
                style={[
                  styles.chipBtn,
                  language === l.code && styles.chipBtnActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLanguage(l.code);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    language === l.code && styles.chipTextActive,
                  ]}
                >
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Voice type */}
          <Text style={styles.settingsSectionLabel}>{t(language, "changeVoice")}</Text>
          <View style={styles.settingsRow}>
            {VOICE_TYPES.map((v) => (
              <Pressable
                key={v.type}
                style={[
                  styles.chipBtn,
                  voiceType === v.type && styles.chipBtnActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setVoiceType(v.type);
                }}
              >
                <Text style={styles.chipEmoji}>{v.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    voiceType === v.type && styles.chipTextActive,
                  ]}
                >
                  {v.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Wake word */}
          <Text style={styles.settingsSectionLabel}>{t(language, "wakeWord")}</Text>
          <View style={styles.wakeWordRow}>
            <TextInput
              style={styles.wakeWordInput}
              value={wakeWordInput}
              onChangeText={setWakeWordInput}
              onBlur={() => setWakeWord(wakeWordInput)}
              placeholder="Hey PFAAI"
              placeholderTextColor="#8B95A8"
            />
          </View>
          <Text style={styles.wakeWordNote}>{t(language, "wakeWordNote")}</Text>

          {/* Actions */}
          <View style={styles.settingsActions}>
            <Pressable style={styles.actionBtn} onPress={handleClearChat}>
              <Feather name="trash-2" size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>
                {t(language, "clearChat")}
              </Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleResetApp}>
              <Feather name="refresh-cw" size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>
                {t(language, "resetApp")}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.closeBtn}
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.closeBtnText}>{t(language, "close")}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1E3A",
    backgroundColor: "#0A0E27",
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#1A1E3A",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#4CAF50",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveScreenBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#1A2A4A",
    borderWidth: 1,
    borderColor: "#4A90D955",
  },
  modeToggle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#1A1E3A",
  },
  wakeWordBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#0D1128",
  },
  wakeWordText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#4A90D9",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowAI: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aiAvatarEmoji: {
    fontSize: 15,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#4A90D9",
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: "#1A1E3A",
    borderBottomLeftRadius: 4,
  },
  thinkingBubble: {
    paddingVertical: 12,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  bubbleTextUser: {
    color: "#FFFFFF",
  },
  bubbleTextAI: {
    color: "#C8D6E5",
  },
  inputBar: {
    backgroundColor: "#0A0E27",
    borderTopWidth: 1,
    borderTopColor: "#1A1E3A",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  voiceHint: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#8B95A8",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#1A1E3A",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2D3561",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: "#1A1E3A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
  },
  settingsSheet: {
    backgroundColor: "#0F1328",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: "80%",
  },
  settingsHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2D3561",
    alignSelf: "center",
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  settingsSectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#8B95A8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  settingsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  chipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1E3A",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipBtnActive: {
    borderColor: "#4A90D9",
    backgroundColor: "#1A2A4A",
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#8B95A8",
  },
  chipTextActive: {
    color: "#4A90D9",
  },
  wakeWordRow: {
    marginBottom: 8,
  },
  wakeWordInput: {
    backgroundColor: "#1A1E3A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2D3561",
  },
  wakeWordNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#8B95A8",
    marginBottom: 20,
    lineHeight: 16,
  },
  settingsActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1A1E3A",
    borderWidth: 1,
    borderColor: "#EF444433",
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  closeBtn: {
    backgroundColor: "#1A1E3A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
