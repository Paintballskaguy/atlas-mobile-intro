import { useEffect, useState, useCallback } from 'react';
import { Image, StyleSheet, Platform, FlatList, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { initializeDatabase, getAllActivities, deleteAllActivities } from '@/database/database';

interface Activity {
  id: number;
  steps: number;
  date: number;
}

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);

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
              Alert.alert('Success', 'All activities have been deleted.');
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your Activities</ThemedText>
        
        {activities.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            No activities yet. Add your first one!
          </ThemedText>
        ) : (
          <ThemedView style={styles.listContainer}>
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ThemedView style={styles.activityItem}>
                  <ThemedText style={styles.stepsText}>
                    🚶 {item.steps.toLocaleString()} steps
                  </ThemedText>
                  <ThemedText style={styles.dateText}>
                    {formatDate(item.date)}
                  </ThemedText>
                </ThemedView>
              )}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            />
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Manage Activities</ThemedText>
        
        <Link href="/add-activity" asChild>
          <Pressable style={styles.addButton}>
            <ThemedText style={styles.buttonText}>Add activity</ThemedText>
          </Pressable>
        </Link>

        <Pressable 
          style={styles.deleteButton}
          onPress={handleDeleteAll}
        >
          <ThemedText style={styles.buttonText}>Delete all activities</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    opacity: 0.6,
  },
  listContainer: {
    height: 300,
    marginVertical: 10,
  },
  activityItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
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
  addButton: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});