import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

const PHRASES = [
  "Hi! 👋 I am your Personal Best Friend",
  "हाय! 👋 मी तुमचा खास मित्र आहे",
  "नमस्ते! 👋 मैं आपका खास दोस्त हूँ",
];

export default function SplashScreen() {
  const { isOnboarded } = useApp();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Phrase cycling
    animatePhrase();

    const timer = setTimeout(() => {
      if (isOnboarded) {
        router.replace("/home");
      } else {
        router.replace("/onboarding/language");
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [isOnboarded]);

  function animatePhrase() {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.85);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setPhraseIndex((i) => {
            const next = (i + 1) % PHRASES.length;
            animatePhrase();
            return next;
          });
        });
      }, 900);
    });
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🤖</Text>
        </View>
        <Text style={styles.appName}>PFAAI</Text>
        <Text style={styles.appSubtitle}>Personal Friend Assistant AI</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.phraseContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.phraseText}>{PHRASES[phraseIndex]}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {PHRASES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === phraseIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "web" ? 67 : 0,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#4A90D9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 4,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8B95A8",
    letterSpacing: 1,
  },
  phraseContainer: {
    paddingHorizontal: 32,
    alignItems: "center",
    minHeight: 64,
    justifyContent: "center",
  },
  phraseText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: "#C8D6E5",
    textAlign: "center",
    lineHeight: 28,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2D3561",
  },
  dotActive: {
    backgroundColor: "#4A90D9",
    width: 24,
  },
});
