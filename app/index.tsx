import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, AppState } from 'react-native';
import * as Speech from 'expo-speech';
import * as SQLite from 'expo-sqlite';
import Voice from '@react-native-voice/voice';

// १. डेटाबेस सेटअप
const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [gameName, setGameName] = useState('');
  const [gameInfo, setGameInfo] = useState('');
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    // टेबल तयार करणे
    db.execSync('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, info TEXT);');
    
    // व्हॉइस लिसनिंग सेटअप
    Voice.onSpeechResults = (e) => {
      const command = e.value ? e.value[0].toLowerCase() : "";
      handleVoiceCommand(command);
    };

    return () => { Voice.destroy().then(Voice.removeAllListeners); };
  }, []);

  // २. व्हॉइस कमांड लॉजिक
  const handleVoiceCommand = (command) => {
    // जर युजरने विचारलं "Ludo बद्दल सांग"
    const words = command.split(' ');
    const searchGame = words[0]; // उदा. Ludo

    const result = db.getAllSync('SELECT info FROM games WHERE name = ?;', [searchGame]);
    if (result.length > 0) {
      Speech.speak("Tuzya माहितीनुसार: " + result[0].info);
    } else {
      Speech.speak("Mala ya game baddal kahi mahiti nahi, ॲपमध्ये जाऊन सेव्ह कर.");
    }
  };

  const saveInfo = () => {
    db.runSync('INSERT INTO games (name, info) VALUES (?, ?);', [gameName, gameInfo]);
    Alert.alert("Success", "Information Saved!");
    setGameName(''); setGameInfo('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PFAAI - Game AI</Text>
      
      <TextInput placeholder="Game Name" value={gameName} onChangeText={setGameName} style={styles.input} />
      <TextInput placeholder="Strategy/Info" value={gameInfo} onChangeText={setGameInfo} style={styles.input} multiline />
      
      <TouchableOpacity style={styles.button} onPress={saveInfo}><Text style={styles.btnText}>Save Info</Text></TouchableOpacity>
      
      <TouchableOpacity style={styles.voiceBtn} onPress={() => Voice.start('en-US')}>
        <Text style={styles.btnText}>🎤 Ask AI (Voice)</Text>
      </TouchableOpacity>
      
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#0F0F0F' },
  title: { color: '#00FF9D', fontSize: 28, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, marginBottom: 10, borderRadius: 10 },
  button: { backgroundColor: '#444', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  voiceBtn: { backgroundColor: '#00FF9D', padding: 20, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#000', fontWeight: 'bold' },
  status: { color: '#FFF', textAlign: 'center', marginTop: 20 }
});
