import { useEffect, useState, useCallback } from 'react';
import { Image, StyleSheet, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { initializeDatabase, getAllActivities } from '@/database/database';

interface Activity {
  id: number;
  steps: number;
  date: number;
}

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Initialize database when component mounts
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Load activities whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    const data = await getAllActivities();
    setActivities(data as Activity[]);
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
            <FlashList
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
              estimatedItemSize={80}
              showsVerticalScrollIndicator={true}
            />
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Add New Activity</ThemedText>
        <Link href="/add-activity" asChild>
          <ThemedText style={styles.link}>Add activity</ThemedText>
        </Link>
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
  link: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#007AFF',
    color: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    opacity: 0.6,
  },
  listContainer: {
    height: 300, // Fixed height for scrolling
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
});