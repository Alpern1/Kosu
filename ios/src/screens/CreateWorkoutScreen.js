import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CreateWorkoutScreen = () => {
  const [intervals, setIntervals] = useState([]);
  
  const addInterval = () => {
    setIntervals([...intervals, {
      type: 'sprint', // veya 'tempo'
      duration: 15, // saniye cinsinden
    }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Program Oluştur</Text>
      
      {intervals.map((interval, index) => (
        <View key={index} style={styles.intervalItem}>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="Süre (sn)"
            value={interval.duration.toString()}
          />
          <TouchableOpacity
            onPress={() => {
              // interval tipini değiştir (sprint/tempo)
            }}
          >
            <Text>{interval.type}</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={addInterval}
      >
        <Text>Aralık Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}; 