import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateWorkoutScreen from './src/screens/CreateWorkoutScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import SavedWorkoutsScreen from './src/screens/SavedWorkoutsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Ana Sayfa' }}
        />
        <Stack.Screen 
          name="CreateWorkout" 
          component={CreateWorkoutScreen}
          options={{ title: 'Program Oluştur' }}
        />
        <Stack.Screen 
          name="SavedWorkouts" 
          component={SavedWorkoutsScreen}
          options={{ title: 'Programlarım' }}
        />
        <Stack.Screen 
          name="Workout" 
          component={WorkoutScreen}
          options={{ title: 'Antrenman' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 