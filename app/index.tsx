import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function App() {
  const talkToMe = () => {
    // तुझी सांगितलेली ओळख
    const greeting = "Hi! I am your personal best friend. Mi tuza personal AI friend aahe. Sang, aaj mi tula kashi madat karu shakto?";
    Speech.speak(greeting, { language: 'mr' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>P F A A I</Text>
      <Text style={styles.tagline}>Personal Best Friend & Assistant AI</Text>

      <TouchableOpacity style={styles.mainButton} onPress={talkToMe}>
        <Text style={styles.buttonText}>Click to talk to your Best Friend</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Mi hamesha tuzi madat karnyaasathi taiyar aahe!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' },
  appName: { color: '#00FF9D', fontSize: 42, fontWeight: 'bold', letterSpacing: 5 },
  tagline: { color: '#A0A0A0', fontSize: 16, marginBottom: 50, textAlign: 'center' },
  mainButton: { backgroundColor: '#252525', paddingVertical: 20, paddingHorizontal: 30, borderRadius: 30, borderWidth: 1, borderColor: '#00FF9D' },
  buttonText: { color: '#00FF9D', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 50, color: '#555' }
});
