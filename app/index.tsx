import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [mode, setMode] = useState('voice'); // voice or chat
  const [aiName, setAiName] = useState('PFAAI');
  const [voiceType, setVoiceType] = useState('female'); // female, child, male
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    // सेटअप लोड करणे
    const loadData = async () => {
      const name = await AsyncStorage.getItem('aiName');
      if (name) setAiName(name);
    };
    loadData();

    Voice.onSpeechResults = (e) => {
      const cmd = e.value[0].toLowerCase();
      processCommand(cmd);
    };
  }, []);

  const processCommand = (cmd) => {
    if (cmd.includes("status")) {
      Speech.speak("सध्या सिस्टम सुरळीत आहे आणि बॅकग्राउंड स्कॅनिंग चालू आहे.");
    }
  };

  return (
    <View style={styles.container}>
      {/* ३ डॉट मेनू (सिम्युलेटेड) */}
      <View style={styles.header}>
        <Text style={styles.title}>{aiName} AI</Text>
        <TouchableOpacity><Text style={{color:'#FFF'}}>⋮</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.status}>Status: {status}</Text>
        
        {/* Dual Mode Switch */}
        <View style={styles.modeContainer}>
          <Text style={{color:'#FFF'}}>Mode: {mode}</Text>
          <Switch value={mode === 'chat'} onValueChange={(v) => setMode(v ? 'chat' : 'voice')} />
        </View>

        {/* मेन बटण */}
        <TouchableOpacity style={styles.mainBtn} onPress={() => Voice.start('mr-IN')}>
          <Text style={styles.btnText}>🎤 {mode === 'voice' ? 'Listen' : 'Type Command'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 40, marginTop: 20 },
  title: { color: '#00FF9D', fontSize: 24, fontWeight: 'bold' },
  content: { alignItems: 'center', padding: 20 },
  status: { color: '#FFF', marginBottom: 20 },
  modeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  mainBtn: { backgroundColor: '#00FF9D', padding: 30, borderRadius: 50, marginTop: 50 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});

