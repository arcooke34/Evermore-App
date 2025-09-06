import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={20} color="#FF6B35" />
      <Text style={styles.streakText}>
        Day {streak} of your{'\n'}Connection Streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5DC',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 6,
    textAlign: 'center',
    lineHeight: 16,
  },
});