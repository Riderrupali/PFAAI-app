import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as ScreenCapture from 'expo-screen-capture';
import * as SQLite from 'expo-sqlite';

// १. डेटाबेस सेटअप
const db = SQLite.openDatabaseSync('gamesDB');

export default function App() {
  const [status, setStatus] = useState("AI Ready");

  useEffect(() => {
    // डेटाबेस टेबल तयार करा
    db.execSync('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, info TEXT);');
    
    // स्क्रीन कॅप्चर (Screen Sharing) सुरु करण्यासाठी परवानगी
    const startCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync(); // सुरक्षिततेसाठी
    };
    startCapture();
  }, []);

  // २. स्क्रीन स्कॅन लॉजिक (सिम्युलेटेड)
  const scanScreen = () => {
    setStatus("Scanning screen...");
    // इथे आपण स्क्रीनचा डेटा वाचतोय असे समजू
    setTimeout(() => {
      Speech.speak("Screen scan zali. Ludo madhe tuza 6 aala aahe, aata gotti halal.");
      setStatus("Scan Complete");
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PFAAI - Live Screen AI</Text>
      
      <TouchableOpacity style={styles.scanBtn} onPress={scanScreen}>
        <Text style={styles.btnText}>Scan & Help (Screen Share)</Text>
      </TouchableOpacity>

      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' },
  title: { color: '#00FF9D', fontSize: 24, marginBottom: 50 },
  scanBtn: { backgroundColor: '#00FF9D', padding: 25, borderRadius: 30 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  status: { color: '#FFF', marginTop: 20 }
});
