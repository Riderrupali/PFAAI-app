import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import * as Speech from 'expo-speech';
import * as ScreenCapture from 'expo-screen-capture';
import * as SQLite from 'expo-sqlite';
import Voice from '@react-native-voice/voice';
// 'expo-device-setting' ऐवजी आपण Linking वापरतोय जेणेकरून ॲप क्रॅश न होता सेटिंग उघडू शकेल
import * as IntentLauncher from 'expo-intent-launcher'; 

const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [gameName, setGameName] = useState('');
  const [gameInfo, setGameInfo] = useState('');

  useEffect(() => {
    db.execSync('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, info TEXT);');
    
    Voice.onSpeechResults = (e) => {
      const command = e.value ? e.value[0].toLowerCase() : "";
      processCommand(command);
    };

    return () => { Voice.destroy().then(Voice.removeAllListeners); };
  }, []);

  const processCommand = (command) => {
    // १. सिस्टम कंट्रोल (Settings)
    if (command.includes("bluetooth")) {
      IntentLauncher.startActivityAsync('android.settings.BLUETOOTH_SETTINGS');
      Speech.speak("Bluetooth settings ughadtay.");
    } 
    else if (command.includes("internet") || command.includes("wifi")) {
      IntentLauncher.startActivityAsync('android.settings.WIFI_SETTINGS');
      Speech.speak("Internet settings ughadtay.");
    }
    // २. ॲप उघडणे (Open App)
    else if (command.includes("open")) {
      const appName = command.replace("open ", "");
      Speech.speak(appName + " ughadtay.");
      Linking.openURL(`market://details?id=com.${appName}`);
    }
    // ३. गेम माहिती (Database)
    else {
      const result = db.getAllSync('SELECT info FROM games WHERE name = ?;', [command.split(' ')[0]]);
      if (result.length > 0) Speech.speak(result[0].info);
      else Speech.speak("Mala hi gosht samajat nahi.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PFAAI - Advanced AI</Text>
      
      <TextInput placeholder="Game Name" value={gameName} onChangeText={setGameName} style={styles.input} />
      <TextInput placeholder="Information" value={gameInfo} onChangeText={setGameInfo} style={styles.input} />
      
      <TouchableOpacity style={styles.button} onPress={() => db.runSync('INSERT INTO games (name, info) VALUES (?, ?);', [gameName, gameInfo])}>
        <Text style={styles.btnText}>Save Info</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voiceBtn} onPress={() => Voice.start('en-US')}>
        <Text style={styles.btnText}>🎤 Speak (Command AI)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#0F0F0F' },
  title: { color: '#00FF9D', fontSize: 24, marginBottom: 20 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#444', padding: 15, borderRadius: 5, alignItems: 'center' },
  voiceBtn: { backgroundColor: '#00FF9D', padding: 20, borderRadius: 30, marginTop: 20, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' }
});
