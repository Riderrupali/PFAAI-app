import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [step, setStep] = useState(1); // 1: Splash, 2: Language, 3: Name Setup

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const isDone = await AsyncStorage.getItem('setupDone');
    setTimeout(() => {
      setLoading(false);
      if (isDone === 'true') setSetupDone(true);
    }, 2000); // 2 सेकंद Splash Screen
  };

  const completeSetup = async () => {
    await AsyncStorage.setItem('setupDone', 'true');
    setSetupDone(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>PFAAI</Text>
        <Text style={styles.subtitle}>Hi 👋☺️ I am your personal best friend</Text>
        <ActivityIndicator size="large" color="#00FF9D" />
      </View>
    );
  }

  if (!setupDone) {
    return (
      <View style={styles.container}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Select Language</Text>
            {['English', 'मराठी', 'हिंदी'].map((lang) => (
              <TouchableOpacity key={lang} style={styles.button} onPress={() => setStep(2)}>
                <Text style={styles.btnText}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.title}>Setup Names</Text>
            <TextInput placeholder="Your Name" style={styles.input} />
            <TextInput placeholder="AI Buddy Name (e.g. PFAAI)" style={styles.input} />
            <TouchableOpacity style={styles.button} onPress={completeSetup}>
              <Text style={styles.btnText}>Complete Setup</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PFAAI Home</Text>
      <Text style={styles.subtitle}>Ready to assist you!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', padding: 20 },
  title: { color: '#00FF9D', fontSize: 32, textAlign: 'center', marginBottom: 20 },
  subtitle: { color: '#FFF', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#00FF9D', padding: 15, borderRadius: 10, marginBottom: 10 },
  btnText: { textAlign: 'center', fontWeight: 'bold' }
});
