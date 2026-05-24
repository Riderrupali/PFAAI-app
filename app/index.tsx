import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

export default function App() {
  const [setupDone, setSetupDone] = useState(false);
  const [aiName, setAiName] = useState('pfaai'); // डिफॉल्ट नाव
  const [language, setLanguage] = useState('mr-IN'); // मराठी डिफॉल्ट

  useEffect(() => {
    loadSettings();
    Voice.onSpeechResults = (e) => {
      const command = e.value ? e.value[0].toLowerCase() : "";
      // जर कमांडमध्ये तुझं नाव असेल तरच ऐक
      if (command.includes(aiName.toLowerCase())) {
        Speech.speak("हो, मी ऐकतोय!", { language: language });
        // इथे तू कमांड प्रोसेस करण्यासाठी फंक्शन कॉल करू शकतोस
      }
    };
  }, [aiName, language]);

  const loadSettings = async () => {
    const name = await AsyncStorage.getItem('aiName');
    const lang = await AsyncStorage.getItem('language');
    if (name) setAiName(name.toLowerCase());
    if (lang) setLanguage(lang);
    if (name) setSetupDone(true);
  };

  const saveSettings = async (name, lang) => {
    await AsyncStorage.setItem('aiName', name);
    await AsyncStorage.setItem('language', lang);
    setAiName(name.toLowerCase());
    setLanguage(lang);
    setSetupDone(true);
  };

  if (!setupDone) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Setup PFAAI</Text>
        <TextInput placeholder="AI Name (e.g. Buddy)" onChangeText={setAiName} style={styles.input} />
        {['en-US', 'mr-IN', 'hi-IN'].map((lang) => (
          <TouchableOpacity key={lang} style={styles.button} onPress={() => saveSettings(aiName, lang)}>
            <Text style={styles.btnText}>Language: {lang}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi, I am {aiName}!</Text>
      <Text style={styles.subtitle}>मी आता ऐकतोय. फक्त माझं नाव घे!</Text>
      <TouchableOpacity style={styles.voiceBtn} onPress={() => Voice.start(language)}>
        <Text style={styles.btnText}>🎤 (Passive Listening)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', padding: 20 },
  title: { color: '#00FF9D', fontSize: 28, textAlign: 'center', marginBottom: 20 },
  subtitle: { color: '#FFF', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#00FF9D', padding: 15, borderRadius: 10, marginBottom: 10 },
  voiceBtn: { backgroundColor: '#FF4757', padding: 20, borderRadius: 30, marginTop: 50 },
  btnText: { textAlign: 'center', fontWeight: 'bold' }
});
