import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
  title: string;
  description: string;
  completed: boolean;
}

interface ActivityCardProps {
  icon: string;
  title: string;
  activity: Activity;
  onComplete: () => void;
  cardColor: string;
  loading?: boolean;
}

export default function ActivityCard({ icon, title, activity, onComplete, cardColor, loading = false }: ActivityCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {activity.completed && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        )}
      </View>
      
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <Text style={styles.activityDescription}>{activity.description}</Text>
      
      {!activity.completed && (
        <TouchableOpacity 
          style={[styles.completeButton, loading && styles.disabledButton]} 
          onPress={onComplete}
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          )}
        </TouchableOpacity>
      )}
      
      {activity.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark" size={16} color="#FFF" />
          <Text style={styles.completedText}>Completed!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: '#8B7355',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0A291',
    opacity: 0.7,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});