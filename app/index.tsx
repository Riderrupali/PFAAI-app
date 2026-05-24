import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

export default function App() {
  const [status, setStatus] = useState("Tap to talk");

  useEffect(() => {
    // ॲप उघडल्यावर व्हॉइस लिसनर सेट करणे
    Voice.onSpeechResults = (e) => {
      const command = e.value ? e.value[0] : "";
      setStatus("You said: " + command);
      
      if (command.toLowerCase().includes("hello")) {
        Speech.speak("Hello! I am your personal best friend.");
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setStatus("Listening...");
      await Voice.start('en-US'); // इंग्रजी कमांडसाठी
    } catch (e) {
      Alert.alert("Error", "Could not start listening");
    }
  };

  const talkToMe = () => {
    const greeting = "Hi! I am your personal best friend. Mi tuza personal AI friend aahe.";
    Speech.speak(greeting, { language: 'mr' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>P F A A I</Text>
      <Text style={styles.statusText}>{status}</Text>

      <TouchableOpacity style={styles.mainButton} onPress={talkToMe}>
        <Text style={styles.buttonText}>Talk to Best Friend</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voiceButton} onPress={startListening}>
        <Text style={styles.buttonText}>Voice Command</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' },
  appName: { color: '#00FF9D', fontSize: 30, marginBottom: 20, fontWeight: 'bold' },
  statusText: { color: '#FFF', marginBottom: 20 },
  mainButton: { backgroundColor: '#252525', padding: 20, borderRadius: 20, marginBottom: 15 },
  voiceButton: { backgroundColor: '#00FF9D', padding: 20, borderRadius: 20 },
  buttonText: { color: '#000', fontWeight: 'bold' }
});

