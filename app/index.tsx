import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [gameName, setGameName] = useState('');
  const [gameInfo, setGameInfo] = useState('');
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    db.execSync('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, info TEXT);');
  }, []);

  const saveInfo = () => {
    db.runSync('INSERT INTO games (name, info) VALUES (?, ?);', [gameName, gameInfo]);
    setStatus("Saved: " + gameName);
    setGameName(''); setGameInfo('');
  };

  const getInfo = () => {
    const result = db.getAllSync('SELECT info FROM games WHERE name = ?;', [gameName]);
    if (result.length > 0) {
      Speech.speak(result[0].info);
    } else {
      Speech.speak("Mala ya game baddal kahi mahiti nahi.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game AI Manager</Text>
      <TextInput placeholder="Game Name (e.g. Ludo)" value={gameName} onChangeText={setGameName} style={styles.input} />
      <TextInput placeholder="Information (e.g. strategy)" value={gameInfo} onChangeText={setGameInfo} style={styles.input} multiline />
      
      <TouchableOpacity style={styles.button} onPress={saveInfo}><Text>Save Info</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, {backgroundColor: '#00FF9D'}]} onPress={getInfo}><Text>Ask AI about Game</Text></TouchableOpacity>
      
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50, backgroundColor: '#0F0F0F' },
  title: { color: '#00FF9D', fontSize: 24, marginBottom: 20 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#DDD', padding: 15, borderRadius: 5, marginBottom: 10, alignItems: 'center' },
  status: { color: '#FFF', marginTop: 20 }
});
