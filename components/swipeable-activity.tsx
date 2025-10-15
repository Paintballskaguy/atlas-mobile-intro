import { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Animated, Pressable, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/themed-text';

interface SwipeableActivityProps {
  id: number;
  steps: number;
  date: string;
  onDelete: (id: number) => void;
  onSwipeStart: (id: number) => void;
}

export interface SwipeableActivityRef {
  close: () => void;
}

export const SwipeableActivity = forwardRef<SwipeableActivityRef, SwipeableActivityProps>(
  ({ id, steps, date, onDelete, onSwipeStart }, ref) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const offsetX = useRef(0);
    const isOpen = useRef(false);

    // Expose close method to parent
    useImperativeHandle(ref, () => ({
      close: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
        translateX.setOffset(0);
        translateX.setValue(0);
        offsetX.current = 0;
        isOpen.current = false;
      },
    }));

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
      const { translationX, state } = event.nativeEvent;

      if (state === State.BEGAN) {
        // Set offset so gesture continues from current position
        translateX.setOffset(offsetX.current);
        translateX.setValue(0);
        // Notify parent that this item is being swiped
        onSwipeStart(id);
      }

      if (state === State.END) {
        // Flatten the offset into the value
        translateX.flattenOffset();
        
        const finalPosition = offsetX.current + translationX;

        if (finalPosition < -50) {
          // Swiped left - Open (show delete)
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }).start();
          offsetX.current = -80;
          isOpen.current = true;
        } else {
          // Swiped right or not enough - Close (hide delete)
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }).start();
          offsetX.current = 0;
          isOpen.current = false;
        }
      }
    };

    const handleDelete = () => {
      Animated.timing(translateX, {
        toValue: -400,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onDelete(id));
    };

    return (
      <View style={styles.container}>
        {/* Delete button (behind item) */}
        <View style={styles.deleteButtonWrapper}>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
          </Pressable>
        </View>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-10, 10]}
        >
          <Animated.View
            style={[
              styles.activityItem,
              {
                transform: [{ translateX }],
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
);

// Add display name to fix ESLint warning
SwipeableActivity.displayName = 'SwipeableActivity';

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