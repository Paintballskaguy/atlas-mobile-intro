import { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Animated, Pressable, View, Text } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

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
      },
    }));

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
      const { translationX, state } = event.nativeEvent;

      if (state === State.BEGAN) {
        translateX.setOffset(offsetX.current);
        translateX.setValue(0);
        onSwipeStart(id);
      }

      if (state === State.END) {
        translateX.flattenOffset();
        const finalPosition = offsetX.current + translationX;

        if (finalPosition < -50) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }).start();
          offsetX.current = -80;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }).start();
          offsetX.current = 0;
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
        <View style={styles.deleteButtonWrapper}>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
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
              { transform: [{ translateX }] },
            ]}
          >
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.stepsText}>Steps: {steps}</Text>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
);

SwipeableActivity.displayName = 'SwipeableActivity';

const styles = StyleSheet.create({
  container: {
    height: 70,
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
    backgroundColor: '#F44336',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    height: 70,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  stepsText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});