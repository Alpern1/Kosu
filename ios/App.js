import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateWorkoutScreen from './src/screens/CreateWorkoutScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="CreateWorkout" 
          component={CreateWorkoutScreen}
          options={{ title: 'Program Oluştur' }}
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