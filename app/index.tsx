import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isVisionActive, setIsVisionActive] = useState(false);

  // १. फासा ओळखण्याचे लॉजिक (Vision Simulation)
  const handleBarcodeScanned = (scanningResult) => {
    // इथे आपण स्क्रीनवरचे पिक्सेल्स स्कॅन करून फासा ओळखतो
    // सध्या आपण 'Simulated AI' वापरत आहोत
    Speech.speak("फासा 6 आला आहे. आता गोटी हलव!");
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{color:'white'}}>कॅमेरा परमिशन हवी आहे!</Text>
        <TouchableOpacity onPress={requestPermission}><Text style={styles.btnText}>Allow Access</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isVisionActive ? (
        <CameraView 
          style={StyleSheet.absoluteFillObject} 
          onBarcodeScanned={handleBarcodeScanned} // फासा स्कॅन करण्यासाठी
        />
      ) : (
        <View style={styles.menu}>
          <Text style={styles.title}>PFAAI Vision AI</Text>
          <TouchableOpacity style={styles.mainButton} onPress={() => setIsVisionActive(true)}>
            <Text style={styles.btnText}>Start Game Vision</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center' },
  menu: { alignItems: 'center' },
  title: { color: '#00FF9D', fontSize: 30, marginBottom: 50 },
  mainButton: { backgroundColor: '#00FF9D', padding: 20, borderRadius: 30 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});

