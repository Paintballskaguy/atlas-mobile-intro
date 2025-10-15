import { useState } from 'react';
import { StyleSheet, Pressable, TextInput, Alert, View, Text } from 'react-native';
import { router } from 'expo-router';
import { insertActivity } from '@/database/database';

export default function AddActivityScreen() {
  const [steps, setSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddActivity = async () => {
    const stepsNumber = parseInt(steps);
    if (isNaN(stepsNumber) || stepsNumber <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of steps');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      await insertActivity(stepsNumber, currentTimestamp);
      setSteps('');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add activity');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Activity</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter steps"
        keyboardType="numeric"
        value={steps}
        onChangeText={setSteps}
        placeholderTextColor="#999"
      />

      <Pressable 
        style={[styles.button, styles.addButton, isSubmitting && styles.buttonDisabled]} 
        onPress={handleAddActivity}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Adding...' : 'Add Activity'}
        </Text>
      </Pressable>

      <Pressable 
        style={[styles.button, styles.backButton]} 
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#00BFA5',
  },
  backButton: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});