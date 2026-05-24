import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Switch, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';

const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [loading, setLoading] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [aiName, setAiName] = useState('PFAAI');
  const [mode, setMode] = useState('voice');
  
  // नवीन फिचर्ससाठी स्टेट
  const [gameName, setGameName] = useState('');
  const [gameInfo, setGameInfo] = useState('');

  useEffect(() => {
    initApp();
    db.execSync('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, info TEXT);');
    
    Voice.onSpeechResults = (e) => {
      const cmd = e.value ? e.value[0].toLowerCase() : "";
      if (cmd.includes(aiName.toLowerCase())) processCommand(cmd);
    };
  }, [aiName]);

  const initApp = async () => {
    const savedName = await AsyncStorage.getItem('aiName');
    const done = await AsyncStorage.getItem('setupDone');
    setTimeout(() => {
      setLoading(false);
      if (done === 'true') {
        setSetupDone(true);
        setAiName(savedName || 'PFAAI');
      }
    }, 2000);
  };

  const saveGameInfo = () => {
    db.runSync('INSERT INTO games (name, info) VALUES (?, ?);', [gameName, gameInfo]);
    Alert.alert("Success", "मी हे शिकलो आहे!");
    setGameName(''); setGameInfo('');
  };

  const processCommand = (command) => {
    if (command.includes("bluetooth")) IntentLauncher.startActivityAsync('android.settings.BLUETOOTH_SETTINGS');
    else if (command.includes("internet")) IntentLauncher.startActivityAsync('android.settings.WIFI_SETTINGS');
    else {
      // डेटाबेसमधून माहिती शोधणे
      const result = db.getAllSync('SELECT info FROM games WHERE name = ?;', [command.split(' ')[0]]);
      if (result.length > 0) Speech.speak(result[0].info);
      else Speech.speak("हे मला माहित नाही, कृपया मला शिकव.");
    }
  };

  if (loading) return (
    <View style={styles.container}>
      <Text style={styles.splashText}>Hi 👋☺️ I am your personal best friend</Text>
      <ActivityIndicator size="large" color="#00FF9D" />
    </View>
  );

  if (!setupDone) return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup PFAAI</Text>
      <TextInput placeholder="AI Name" onChangeText={setAiName} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={async () => {
        await AsyncStorage.setItem('aiName', aiName);
        await AsyncStorage.setItem('setupDone', 'true');
        setSetupDone(true);
      }}><Text style={styles.btnText}>Start Now</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{aiName} AI</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* शिकवण्यासाठी UI */}
        <TextInput placeholder="Game/Topic Name" value={gameName} onChangeText={setGameName} style={styles.input} />
        <TextInput placeholder="Information (Strategy/Notes)" value={gameInfo} onChangeText={setGameInfo} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={saveGameInfo}><Text style={styles.btnText}>AI ला शिकव</Text></TouchableOpacity>

        <TouchableOpacity style={styles.mainBtn} onPress={() => Voice.start('mr-IN')}>
          <Text style={styles.btnText}>🎤 Talk to {aiName}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  splashText: { color: '#FFF', fontSize: 20, textAlign: 'center', marginTop: 200 },
  header: { padding: 40, marginTop: 20 },
  title: { color: '#00FF9D', fontSize: 28, fontWeight: 'bold' },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, borderRadius: 10, marginHorizontal: 20, marginBottom: 10 },
  button: { backgroundColor: '#00FF9D', padding: 15, borderRadius: 10, marginHorizontal: 20 },
  mainBtn: { backgroundColor: '#FF4757', padding: 30, borderRadius: 50, marginTop: 30 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  content: { alignItems: 'center' }
});
          
