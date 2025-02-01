import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { styles } from '../styles/styles';

const startBeepSound = require('../../assets/sounds/beep-start.mp3');
const endBeepSound = require('../../assets/sounds/beep-end.mp3');

const WorkoutScreen = ({ route, navigation }) => {
  const { workout } = route.params;
  const [currentInterval, setCurrentInterval] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [distance, setDistance] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);

  useEffect(() => {
    if (workout && workout.intervals && workout.intervals.length > 0) {
      if (workout.intervals[0].measurementType.includes('Süre')) {
        setTimeLeft(parseInt(workout.intervals[0].value));
      } else {
        setTimeLeft(parseInt(workout.intervals[0].value));
      }
    }
  }, [workout]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Mesafe ölçümü için konum izni gereklidir.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
      return false;
    }
    return true;
  };

  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 1,
        timeInterval: 1000,
      },
      (location) => {
        if (lastLocation) {
          const newDistance = calculateDistance(
            lastLocation.coords.latitude,
            lastLocation.coords.longitude,
            location.coords.latitude,
            location.coords.longitude
          );
          setDistance(prev => {
            const updatedDistance = prev + newDistance;
            if (workout.intervals[currentInterval].measurementType.includes('Mesafe')) {
              checkDistanceGoal(updatedDistance);
            }
            return updatedDistance;
          });
          setTotalDistance(prev => prev + newDistance);
        }
        setLastLocation(location);
      }
    );
    setLocationSubscription(subscription);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Dünya yarıçapı (metre)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const checkDistanceGoal = (currentDistance) => {
    if (!isActive) return;

    const targetDistance = parseInt(workout.intervals[currentInterval].value);
    if (targetDistance - currentDistance <= 1 && targetDistance - currentDistance > 0) {
      playEndSound();
    }
    
    if (currentDistance >= targetDistance) {
      if (currentInterval < workout.intervals.length - 1) {
        setCurrentInterval(curr => curr + 1);
        setTimeout(() => {
          playStartSound();
        }, 1000);
      } else {
        stopWorkout();
      }
    }
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3' },
        { shouldPlay: true }
      );
      await sound.playAsync();
      sound.unloadAsync();
    } catch (error) {
      console.log('Ses çalma hatası:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (isActive && workout.intervals[currentInterval].measurementType.includes('Süre')) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 2) {
            playEndSound();
          }
          
          if (prev <= 1) {
            if (currentInterval < workout.intervals.length - 1) {
              setCurrentInterval(curr => curr + 1);
              setTimeout(() => {
                playStartSound();
              });
              return parseInt(workout.intervals[currentInterval + 1].value);
            } else {
              stopWorkout();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentInterval]);

  // Ses ayarlarını başlat
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Ses ayarları hatası:', error);
      }
    };
    
    setupAudio();
  }, []);

  const playStartSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        startBeepSound,
        { shouldPlay: true }
      );
      await sound.playAsync();
      setTimeout(async () => {
        await sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error('Başlangıç sesi çalma hatası:', error);
    }
  };

  const playEndSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        endBeepSound,
        { shouldPlay: true }
      );
      await sound.playAsync();
      setTimeout(async () => {
        await sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error('Bitiş sesi çalma hatası:', error);
    }
  };

  const startWorkout = async () => {
    await startLocationTracking();
    setIsActive(true);
    playStartSound();
  };

  const stopWorkout = async () => {
    setIsActive(false);
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    await playEndSound();
    
    setTimeout(() => {
      Alert.alert(
        'Antrenman Tamamlandı',
        `Toplam kat edilen mesafe: ${totalDistance.toFixed(1)} metre`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters) => {
    return `${meters.toFixed(1)} m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.workoutTitle}>{workout.name}</Text>
      
      <View style={styles.currentActivityContainer}>
        <Text style={styles.currentActivity}>
          {currentInterval + 1}. Aralık
        </Text>
        <Text style={styles.timerText}>
          {workout.intervals[currentInterval].measurementType.includes('Süre')
            ? formatTime(timeLeft)
            : `${formatDistance(distance)} / ${workout.intervals[currentInterval].value}m`}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Toplam Mesafe:</Text>
          <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mevcut Aralık:</Text>
          <Text style={styles.statValue}>
            {workout.intervals[currentInterval].measurementType.includes('Süre')
              ? formatTime(timeLeft)
              : `${formatDistance(distance)}`}
          </Text>
        </View>
      </View>

      <View style={styles.nextActivityContainer}>
        <Text style={styles.nextActivityLabel}>Sıradaki:</Text>
        <Text style={styles.nextActivity}>
          {currentInterval < workout.intervals.length - 1 
            ? `${currentInterval + 2}. Aralık`
            : 'Program Sonu'}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.controlButton, !isActive ? styles.startButton : styles.pauseButton]}
        onPress={() => isActive ? setIsActive(false) : startWorkout()}
      >
        <Text style={styles.buttonText}>
          {!isActive ? 'Başlat' : 'Duraklat'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.controlButton, styles.stopButton]}
        onPress={stopWorkout}
      >
        <Text style={styles.buttonText}>Bitir</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutScreen; 