import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as SQLite from 'expo-sqlite';
import Voice from '@react-native-voice/voice';
import * as IntentLauncher from 'expo-intent-launcher';

const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [loading, setLoading] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [aiName, setAiName] = useState('PFAAI');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkSetup();
    db.execSync('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, info TEXT);');
    
    Voice.onSpeechResults = (e) => {
      const command = e.value ? e.value[0].toLowerCase() : "";
      processCommand(command);
    };
  }, []);

  const checkSetup = async () => {
    const isDone = await AsyncStorage.getItem('setupDone');
    const name = await AsyncStorage.getItem('aiName');
    if (isDone === 'true') {
      setSetupDone(true);
      if (name) setAiName(name);
    }
    setLoading(false);
  };

  const completeSetup = async () => {
    await AsyncStorage.setItem('setupDone', 'true');
    await AsyncStorage.setItem('aiName', aiName);
    setSetupDone(true);
  };

  const processCommand = (command) => {
    if (command.includes("bluetooth")) IntentLauncher.startActivityAsync('android.settings.BLUETOOTH_SETTINGS');
    else if (command.includes("internet")) IntentLauncher.startActivityAsync('android.settings.WIFI_SETTINGS');
    else {
      const result = db.getAllSync('SELECT info FROM games WHERE name = ?;', [command.split(' ')[0]]);
      if (result.length > 0) Speech.speak(result[0].info);
      else Speech.speak("मला हे समजलं नाही.");
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#00FF9D" /></View>;

  if (!setupDone) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to PFAAI</Text>
        <TextInput placeholder="Your Name" onChangeText={setUserName} style={styles.input} />
        <TextInput placeholder="Set AI Name" onChangeText={setAiName} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={completeSetup}><Text style={styles.btnText}>Start</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, I am {aiName}!</Text>
      <TouchableOpacity style={styles.voiceBtn} onPress={() => Voice.start('mr-IN')}>
        <Text style={styles.btnText}>🎤 Speak to {aiName}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', padding: 20 },
  title: { color: '#00FF9D', fontSize: 28, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#00FF9D', padding: 15, borderRadius: 10 },
  voiceBtn: { backgroundColor: '#FF4757', padding: 20, borderRadius: 30, marginTop: 50 },
  btnText: { textAlign: 'center', fontWeight: 'bold' }
});
