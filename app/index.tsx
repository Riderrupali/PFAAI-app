import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as ScreenCapture from 'expo-screen-capture';
import * as SQLite from 'expo-sqlite';
import Voice from '@react-native-voice/voice';

// नवीन लायब्ररी जी आपण उपकरणाच्या सेटिंगसाठी वापरू
import * as DeviceSetting from 'expo-device-setting'; 

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

  // व्हॉइस कमांड लॉजिक (इंटरनेट आणि ब्लूटूथसाठी)
  const processCommand = (command) => {
    if (command.includes("bluetooth on")) {
      DeviceSetting.on({ setting: 'BLUETOOTH' });
      Speech.speak("Bluetooth on kela aahe.");
    } else if (command.includes("bluetooth off")) {
      DeviceSetting.off({ setting: 'BLUETOOTH' });
      Speech.speak("Bluetooth off kela aahe.");
    } else if (command.includes("internet on") || command.includes("wifi on")) {
      DeviceSetting.on({ setting: 'WIFI' });
      Speech.speak("Internet on kela aahe.");
    } else if (command.includes("internet off") || command.includes("wifi off")) {
      DeviceSetting.off({ setting: 'WIFI' });
      Speech.speak("Internet off kela aahe.");
    } else {
      // गेमबद्दल माहिती शोधणे (जुनं लॉजिक)
      const result = db.getAllSync('SELECT info FROM games WHERE name = ?;', [command.split(' ')[0]]);
      if (result.length > 0) Speech.speak(result[0].info);
      else Speech.speak("Mala samajat nahi aahe.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PFAAI - Master AI</Text>
      
      {/* जुन्या सर्व गोष्टी तसेच आहेत... */}
      <TouchableOpacity style={styles.voiceBtn} onPress={() => Voice.start('en-US')}>
        <Text style={styles.btnText}>🎤 Speak (Bluetooth/Internet/Game)</Text>
      </TouchableOpacity>
    </View>
  );
}

// स्टाइल्स आधीसारख्याच...
const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#0F0F0F' },
  title: { color: '#00FF9D', fontSize: 24, marginBottom: 20 },
  voiceBtn: { backgroundColor: '#00FF9D', padding: 20, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#000', fontWeight: 'bold' }
});
