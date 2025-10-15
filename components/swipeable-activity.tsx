import { useRef } from 'react';
import { StyleSheet, Animated, Pressable, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/themed-text';

interface SwipeableActivityProps {
  id: number;
  steps: number;
  date: string;
  onDelete: (id: number) => void;
}

export function SwipeableActivity({ id, steps, date, onDelete }: SwipeableActivityProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    // State 5 is END
    if (state === 5) {
      if (translationX < -50) {
        // Swiped left enough - show delete button
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
      } else if (translationX > 50) {
        // Swiped right enough - hide delete button
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
      } else {
        // Not swiped enough - return to current state
        const currentValue = (translateX as any)._value;
        Animated.spring(translateX, {
          toValue: currentValue < -40 ? -80 : 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
      }
    }
  };

  const handleDelete = () => {
    // Animate out before deleting
    Animated.timing(translateX, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(id);
    });
  };

  return (
    <View style={styles.container}>
      {/* Delete button container - positioned behind */}
      <View style={styles.deleteButtonWrapper}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
        </Pressable>
      </View>

      {/* Swipeable activity item - covers delete button by default */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.activityItem,
            {
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-1000, 0],
                    outputRange: [-1000, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedText style={styles.stepsText}>
            🚶 {steps.toLocaleString()} steps
          </ThemedText>
          <ThemedText style={styles.dateText}>{date}</ThemedText>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    height: 80,
    overflow: 'hidden',
  },
  deleteButtonWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    height: 80,
    justifyContent: 'center',
  },
  stepsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
});