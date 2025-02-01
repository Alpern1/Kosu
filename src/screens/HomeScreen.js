import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/styles';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.navigate('CreateWorkout')}
      >
        <Text style={styles.menuButtonText}>Yeni Program Oluştur</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.navigate('SavedWorkouts')}
      >
        <Text style={styles.menuButtonText}>Programlarım</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen; 