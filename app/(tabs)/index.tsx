import { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Alert, Pressable, View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';

import { SwipeableActivity, SwipeableActivityRef } from '@/components/swipeable-activity';
import { 
  initializeDatabase, 
  getAllActivities, 
  deleteAllActivities,
  deleteActivity 
} from '@/database/database';

interface Activity {
  id: number;
  steps: number;
  date: number;
}

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const openItemId = useRef<number | null>(null);
  const itemRefs = useRef<Map<number, SwipeableActivityRef>>(new Map());

  useEffect(() => {
    initializeDatabase();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    const data = await getAllActivities();
    setActivities(data as Activity[]);
  };

  const handleSwipeStart = (id: number) => {
    if (openItemId.current !== null && openItemId.current !== id) {
      const previousItem = itemRefs.current.get(openItemId.current);
      if (previousItem) {
        previousItem.close();
      }
    }
    openItemId.current = id;
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      await deleteActivity(id);
      await loadActivities();
      openItemId.current = null;
    } catch (error) {
      Alert.alert('Error', 'Failed to delete activity.');
      console.error(error);
    }
  };

  const handleDeleteAll = () => {
    if (activities.length === 0) {
      Alert.alert('No Activities', 'There are no activities to delete.');
      return;
    }

    Alert.alert(
      'Delete All Activities',
      'Are you sure you want to delete all activities? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllActivities();
              await loadActivities();
              openItemId.current = null;
            } catch (error) {
              Alert.alert('Error', 'Failed to delete activities.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No activities yet.</Text>
          ) : (
            <View style={styles.activitiesContainer}>
              {activities.map((item) => (
                <SwipeableActivity
                  key={item.id}
                  ref={(ref) => {
                    if (ref) {
                      itemRefs.current.set(item.id, ref);
                    } else {
                      itemRefs.current.delete(item.id);
                    }
                  }}
                  id={item.id}
                  steps={item.steps}
                  date={formatDate(item.date)}
                  onDelete={handleDeleteActivity}
                  onSwipeStart={handleSwipeStart}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/add-activity')}
          >
            <Text style={styles.buttonText}>Add activity</Text>
          </Pressable>

          <Pressable 
            style={styles.deleteButton}
            onPress={handleDeleteAll}
          >
            <Text style={styles.buttonText}>Delete all activities</Text>
          </Pressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  activitiesContainer: {
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
    backgroundColor: '#F5F5F5',
  },
  addButton: {
    backgroundColor: '#00BFA5',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});