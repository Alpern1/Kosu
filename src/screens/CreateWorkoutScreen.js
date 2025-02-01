import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEASUREMENT_TYPES = ['Süre (saniye)', 'Mesafe (metre)'];

const CreateWorkoutScreen = ({ navigation, route }) => {
  const editingWorkout = route.params?.workout;
  const onUpdate = route.params?.onUpdate;

  const [intervals, setIntervals] = useState(editingWorkout?.intervals || []);
  const [workoutName, setWorkoutName] = useState(editingWorkout?.name || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState('0');
  const [selectedSeconds, setSelectedSeconds] = useState('0');

  // Dakika ve saniye için dizi oluştur
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString());
  const seconds = Array.from({ length: 60 }, (_, i) => i.toString());

  const addInterval = () => {
    setIntervals([...intervals, {
      value: '',
      measurementType: MEASUREMENT_TYPES[0]
    }]);
  };

  const openTimePicker = (index) => {
    const currentValue = intervals[index].value;
    if (currentValue) {
      const totalSeconds = parseInt(currentValue);
      setSelectedMinutes(Math.floor(totalSeconds / 60).toString());
      setSelectedSeconds((totalSeconds % 60).toString());
    } else {
      setSelectedMinutes('0');
      setSelectedSeconds('0');
    }
    setSelectedInterval(index);
    setTimePickerVisible(true);
  };

  const saveTime = () => {
    const totalSeconds = (parseInt(selectedMinutes) * 60) + parseInt(selectedSeconds);
    const newIntervals = [...intervals];
    newIntervals[selectedInterval].value = totalSeconds.toString();
    setIntervals(newIntervals);
    setTimePickerVisible(false);
  };

  const updateIntervalValue = (index, value, measurementType) => {
    const newIntervals = [...intervals];
    if (measurementType === MEASUREMENT_TYPES[0]) { // Süre seçiliyse
      openTimePicker(index);
    } else { // Mesafe seçiliyse
      newIntervals[index].value = value;
      setIntervals(newIntervals);
    }
  };

  const updateIntervalMeasurement = (index, measurementType) => {
    const newIntervals = [...intervals];
    newIntervals[index].measurementType = measurementType;
    setIntervals(newIntervals);
    if (Platform.OS === 'ios') {
      setModalVisible(false);
    }
  };

  const openPicker = (index) => {
    if (Platform.OS === 'ios') {
      setSelectedInterval(index);
      setModalVisible(true);
    }
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Uyarı', 'Lütfen program adı giriniz.');
      return;
    }

    if (intervals.length === 0) {
      Alert.alert('Uyarı', 'En az bir aralık eklemelisiniz.');
      return;
    }

    const hasEmptyValues = intervals.some(interval => !interval.value);
    if (hasEmptyValues) {
      Alert.alert('Uyarı', 'Lütfen tüm aralıklar için değer giriniz.');
      return;
    }

    const workout = {
      id: editingWorkout?.id || Date.now().toString(),
      name: workoutName,
      intervals,
    };
    
    try {
      if (editingWorkout) {
        // Düzenleme modu
        await onUpdate(workout);
        Alert.alert('Başarılı', 'Program güncellendi!', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        // Yeni program oluşturma modu
        const existingWorkoutsJson = await AsyncStorage.getItem('workouts');
        let workouts = [];
        if (existingWorkoutsJson) {
          workouts = JSON.parse(existingWorkoutsJson);
        }
        workouts.push(workout);
        await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
        Alert.alert('Başarılı', 'Program kaydedildi!', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      Alert.alert('Hata', 'Program kaydedilirken bir hata oluştu.');
    }
  };

  const removeInterval = (index) => {
    const newIntervals = [...intervals];
    newIntervals.splice(index, 1);
    setIntervals(newIntervals);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Program Bilgileri</Text>
        
        <Text style={styles.inputLabel}>Program Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Sabah Koşusu"
          value={workoutName}
          onChangeText={setWorkoutName}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Aralıklar</Text>
        <Text style={styles.sectionDescription}>
          Her bir aralık için süre veya mesafe değeri belirleyin.
        </Text>

        {intervals.map((interval, index) => (
          <View key={index} style={styles.intervalContainer}>
            <View style={styles.intervalHeader}>
              <Text style={styles.intervalTitle}>{index + 1}. Aralık</Text>
              <TouchableOpacity
                onPress={() => removeInterval(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.intervalContent}>
              {interval.measurementType === MEASUREMENT_TYPES[0] ? (
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => openTimePicker(index)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {interval.value ? 
                      `${Math.floor(parseInt(interval.value) / 60)}:${(parseInt(interval.value) % 60).toString().padStart(2, '0')}` 
                      : 'Süre Seç'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TextInput 
                  style={styles.intervalInput}
                  keyboardType="numeric"
                  placeholder="Mesafe (m)"
                  value={interval.value}
                  onChangeText={(value) => updateIntervalValue(index, value, interval.measurementType)}
                />
              )}
              
              {Platform.OS === 'android' ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={interval.measurementType}
                    onValueChange={(value) => updateIntervalMeasurement(index, value)}
                    style={styles.intervalPicker}
                  >
                    {MEASUREMENT_TYPES.map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.measurementButton}
                  onPress={() => openPicker(index)}
                >
                  <Text style={styles.measurementButtonText}>
                    {interval.measurementType}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={addInterval}
        >
          <Text style={styles.buttonText}>+ Yeni Aralık Ekle</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, !intervals.length && styles.disabledButton]}
        onPress={saveWorkout}
        disabled={!intervals.length}
      >
        <Text style={styles.buttonText}>Programı Kaydet</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalContainer} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent} onTouchStart={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ölçüm Tipi Seçin</Text>
              </View>
              <Picker
                selectedValue={selectedInterval !== null ? intervals[selectedInterval]?.measurementType : MEASUREMENT_TYPES[0]}
                onValueChange={(value) => selectedInterval !== null && updateIntervalMeasurement(selectedInterval, value)}
                style={styles.modalPicker}
                itemStyle={styles.modalPickerItem}
              >
                {MEASUREMENT_TYPES.map((type) => (
                  <Picker.Item 
                    key={type} 
                    label={type} 
                    value={type}
                    color="#000000"
                  />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Süre seçici modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timePickerVisible}
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <TouchableOpacity style={styles.modalContainer} onPress={() => setTimePickerVisible(false)}>
          <View style={styles.modalContent} onTouchStart={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Süre Seçin</Text>
            </View>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Dakika</Text>
                <Picker
                  selectedValue={selectedMinutes}
                  onValueChange={setSelectedMinutes}
                  style={styles.timePicker}
                  itemStyle={styles.timePickerItem}
                >
                  {minutes.map((minute) => (
                    <Picker.Item 
                      key={`minute-${minute}`}
                      label={minute}
                      value={minute}
                      color="#000000"
                    />
                  ))}
                </Picker>
              </View>
              <Text style={styles.timePickerSeparator}>:</Text>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Saniye</Text>
                <Picker
                  selectedValue={selectedSeconds}
                  onValueChange={setSelectedSeconds}
                  style={styles.timePicker}
                  itemStyle={styles.timePickerItem}
                >
                  {seconds.map((second) => (
                    <Picker.Item 
                      key={`second-${second}`}
                      label={second}
                      value={second}
                      color="#000000"
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setTimePickerVisible(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveTime}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

export default CreateWorkoutScreen; 