import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/styles';

const SavedWorkoutsScreen = ({ navigation }) => {
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Süreyi formatla (saniyeyi dakika:saniye formatına çevir)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Aralık değerini formatla
  const formatIntervalValue = (interval) => {
    if (interval.measurementType.includes('Süre')) {
      return `${formatTime(interval.value)} (dakika:saniye)`;
    } else {
      return `${interval.value} metre`;
    }
  };

  const loadWorkouts = async () => {
    try {
      const workoutsJson = await AsyncStorage.getItem('workouts');
      if (workoutsJson) {
        setSavedWorkouts(JSON.parse(workoutsJson));
      }
    } catch (error) {
      console.error('Programlar yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWorkouts();
    });
    return unsubscribe;
  }, [navigation]);

  const updateWorkout = async (updatedWorkout) => {
    try {
      const workouts = savedWorkouts.map(w => 
        w.id === updatedWorkout.id ? updatedWorkout : w
      );
      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      setSavedWorkouts(workouts);
    } catch (error) {
      console.error('Program güncellenirken hata:', error);
    }
  };

  const WorkoutModal = ({ workout }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{workout.name}</Text>
              <ScrollView>
                <Text style={styles.modalSubtitle}>Program Detayları:</Text>
                {workout.intervals.map((interval, index) => (
                  <View key={index} style={styles.intervalDetailItem}>
                    <Text style={styles.intervalDetailText}>
                      {index + 1}. Aralık: {formatIntervalValue(interval)}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Kapat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.editButton]}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('CreateWorkout', { 
                      workout,
                      onUpdate: updateWorkout
                    });
                  }}
                >
                  <Text style={styles.buttonText}>Düzenle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.startButton]}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Workout', { workout });
                  }}
                >
                  <Text style={styles.buttonText}>Antrenmanı Başlat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {savedWorkouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz kaydedilmiş program yok</Text>
        </View>
      ) : (
        <FlatList
          data={savedWorkouts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.workoutItem}
              onPress={() => {
                setSelectedWorkout(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.workoutName}>{item.name}</Text>
              <Text style={styles.workoutType}>
                {item.intervals[0].measurementType.includes('Süre') ? 'Süre Bazlı' : 'Mesafe Bazlı'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
      {selectedWorkout && <WorkoutModal workout={selectedWorkout} />}
    </View>
  );
};

export default SavedWorkoutsScreen; 