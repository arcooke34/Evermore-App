import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface DayActivities {
  date: string;
  activities: Array<{
    activity_type: string;
    activity_title: string;
    completed_at: string;
  }>;
  activity_count: number;
}

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  dayActivities: DayActivities | null;
}

export default function DayDetailModal({ visible, onClose, selectedDate, dayActivities }: DayDetailModalProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'dailyRitual':
        return '🌱';
      case 'weeklyGesture':
        return '💌';
      case 'monthlyBigGesture':
        return '🎉';
      default:
        return '✨';
    }
  };

  const getActivityTypeLabel = (activityType: string) => {
    switch (activityType) {
      case 'dailyRitual':
        return 'Daily Ritual';
      case 'weeklyGesture':
        return 'Weekly Gesture';
      case 'monthlyBigGesture':
        return 'Monthly Big Gesture';
      default:
        return 'Activity';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {dayActivities && (
            <Text style={styles.subtitle}>
              {dayActivities.activity_count === 0 
                ? 'No activities completed'
                : `${dayActivities.activity_count} ${dayActivities.activity_count === 1 ? 'activity' : 'activities'} completed`
              }
            </Text>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {dayActivities && dayActivities.activities.length > 0 ? (
            <View style={styles.activitiesContainer}>
              {dayActivities.activities.map((activity, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityIcon}>
                        {getActivityIcon(activity.activity_type)}
                      </Text>
                      <View>
                        <Text style={styles.activityType}>
                          {getActivityTypeLabel(activity.activity_type)}
                        </Text>
                        <Text style={styles.activityTime}>
                          {formatTime(activity.completed_at)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                  
                  <Text style={styles.activityTitle}>
                    {activity.activity_title}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌙</Text>
              <Text style={styles.emptyTitle}>No Activities</Text>
              <Text style={styles.emptyDescription}>
                No connection activities were completed on this day. Every small step counts in your journey together!
              </Text>
            </View>
          )}

          {/* Motivational Message */}
          {dayActivities && dayActivities.activities.length > 0 && (
            <View style={styles.motivationCard}>
              <Text style={styles.motivationIcon}>✨</Text>
              <Text style={styles.motivationTitle}>Beautiful Connection!</Text>
              <Text style={styles.motivationText}>
                {dayActivities.activity_count === 1 
                  ? "You took a meaningful step in your relationship journey on this day."
                  : `You completed ${dayActivities.activity_count} connection activities on this day. Your dedication to nurturing your relationship is inspiring!`
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  activitiesContainer: {
    paddingTop: 20,
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  motivationCard: {
    backgroundColor: '#F6F8F6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  motivationIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});