import { useState } from 'react';
import { StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { insertActivity } from '@/database/database';

export default function AddActivityScreen() {
  const [steps, setSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddActivity = async () => {
    // Validate input
    const stepsNumber = parseInt(steps);
    if (isNaN(stepsNumber) || stepsNumber <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of steps');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current timestamp (in seconds)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Insert into database
      await insertActivity(stepsNumber, currentTimestamp);
      
      Alert.alert('Success', 'Activity added successfully!');
      setSteps('');
      
      // Go back to home screen
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add activity');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Add Activity</ThemedText>
      <ThemedText style={styles.subtitle}>Record your daily steps</ThemedText>
      
      <ThemedView style={styles.formContainer}>
        <ThemedText style={styles.label}>Number of Steps:</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2837"
          keyboardType="numeric"
          value={steps}
          onChangeText={setSteps}
          placeholderTextColor="#999"
        />
      </ThemedView>

      <Pressable 
        style={[styles.button, styles.addButton, isSubmitting && styles.buttonDisabled]} 
        onPress={handleAddActivity}
        disabled={isSubmitting}
      >
        <ThemedText style={styles.buttonText}>
          {isSubmitting ? 'Adding...' : 'Add Activity'}
        </ThemedText>
      </Pressable>

      <Pressable style={[styles.button, styles.backButton]} onPress={() => router.back()}>
        <ThemedText style={styles.buttonText}>Go back</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginVertical: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  backButton: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});