import { Audio } from 'expo-av';

const WorkoutScreen = ({ route }) => {
  // ... diğer state'ler ...

  useEffect(() => {
    const playSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/beep.mp3')
      );
      await sound.playAsync();
    };

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          playSound();
          setCurrentInterval(curr => curr + 1);
          return workout[currentInterval + 1]?.duration || 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentInterval, workout]);

  // ... return ...
}; 