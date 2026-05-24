import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ॲप लोड झाल्यावर सुरक्षा तपासणी
    try {
      setIsReady(true);
    } catch (error) {
      console.log("Error loading app:", error);
      Alert.alert("Error", "Something went wrong, but the app is still running!");
    }
  }, []);

  const talkToMe = async () => {
    try {
      const greeting = "Hi! I am your personal best friend. Mi tuza personal AI friend aahe.";
      // स्पीच सुरू करण्यापूर्वी ते आधीचं बोलणं थांबवेल (क्रॅश टाळण्यासाठी)
      await Speech.stop(); 
      Speech.speak(greeting, { language: 'mr' });
    } catch (err) {
      console.log("Speech Error:", err);
    }
  };

  if (!isReady) return <View style={styles.container}><Text style={{color: 'white'}}>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>P F A A I</Text>
      <TouchableOpacity style={styles.mainButton} onPress={talkToMe}>
        <Text style={styles.buttonText}>Talk to your Best Friend</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' },
  appName: { color: '#00FF9D', fontSize: 30, marginBottom: 20 },
  mainButton: { backgroundColor: '#252525', padding: 20, borderRadius: 20 },
  buttonText: { color: '#00FF9D' }
});
