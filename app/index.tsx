import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as SQLite from 'expo-sqlite';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [setupDone, setSetupDone] = useState(false);
  const [aiName, setAiName] = useState('');
  const [language, setLanguage] = useState('mr-IN'); // मराठी बाय डिफॉल्ट

  useEffect(() => {
    checkSetup();
    Voice.onSpeechResults = (e) => {
      const command = e.value ? e.value[0].toLowerCase() : "";
      if (command.includes(aiName.toLowerCase())) {
        Speech.speak("Ho, mi aiktoy!");
      }
    };
  }, [aiName]);

  const checkSetup = async () => {
    const savedName = await AsyncStorage.getItem('aiName');
    if (savedName) {
      setAiName(savedName);
      setSetupDone(true);
      Voice.start('mr-IN'); // ॲप उघडताच ऐकायला सुरुवात करेल
    }
  };

  const completeSetup = async () => {
    await AsyncStorage.setItem('aiName', aiName);
    setSetupDone(true);
    Voice.start('mr-IN');
  };

  if (!setupDone) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Setup your AI Buddy</Text>
        <TextInput placeholder="AI che naav dya (e.g. Buddy)" value={aiName} onChangeText={setAiName} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={completeSetup}><Text>Set Name & Start</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, I am {aiName}!</Text>
      <Text style={{color: '#FFF'}}>Bhakta, fakt maza naav ghe ani mi active hoin.</Text>
      <TouchableOpacity style={styles.voiceBtn} onPress={() => Voice.start('mr-IN')}>
        <Text style={styles.btnText}>🎤 Always Listening</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#0F0F0F', justifyContent: 'center' },
  title: { color: '#00FF9D', fontSize: 28, marginBottom: 20 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, marginBottom: 10, borderRadius: 10 },
  button: { backgroundColor: '#00FF9D', padding: 15, borderRadius: 10, alignItems: 'center' },
  voiceBtn: { backgroundColor: '#FF4757', padding: 20, borderRadius: 30, marginTop: 50, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});
