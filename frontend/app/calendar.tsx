import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import CalendarGrid from '../components/CalendarGrid';
import DayDetailModal from '../components/DayDetailModal';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface CalendarData {
  year: number;
  month: number;
  activities: Array<{
    date: string;
    activity_type: string;
    activity_title: string;
    completed_at: string;
  }>;
  activity_density: Record<string, any[]>;
  total_activities: number;
}

interface DayActivities {
  date: string;
  activities: Array<{
    activity_type: string;
    activity_title: string;
    completed_at: string;
  }>;
  activity_count: number;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayActivities, setDayActivities] = useState<DayActivities | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const coupleId = "demo-couple-123";
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`${BACKEND_URL}/api/couple-data/${coupleId}/calendar/${year}/${month}`);
      
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      } else {
        console.error('Failed to load calendar data');
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayActivities = async (date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const response = await fetch(`${BACKEND_URL}/api/couple-data/${coupleId}/calendar/${year}/${month}/${day}`);
      
      if (response.ok) {
        const data = await response.json();
        setDayActivities(data);
        setModalVisible(true);
      } else {
        console.error('Failed to load day activities');
      }
    } catch (error) {
      console.error('Error loading day activities:', error);
    }
  };

  const onDatePress = (date: Date) => {
    setSelectedDate(date);
    loadDayActivities(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
    setDayActivities(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Journey</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#8B7355" />
          </TouchableOpacity>
          
          <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            {calendarData && (
              <Text style={styles.activityCount}>
                {calendarData.total_activities} activities completed
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color="#8B7355" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Activity Types</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🌱</Text>
              <Text style={styles.legendText}>Daily Ritual</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>💌</Text>
              <Text style={styles.legendText}>Weekly Gesture</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🎉</Text>
              <Text style={styles.legendText}>Monthly Big Gesture</Text>
            </View>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <CalendarGrid
            currentDate={currentDate}
            calendarData={calendarData}
            onDatePress={onDatePress}
            loading={loading}
          />
        </View>

        {/* Stats Summary */}
        {calendarData && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>This Month's Connection</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{calendarData.total_activities}</Text>
                <Text style={styles.statLabel}>Total Activities</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Object.keys(calendarData.activity_density).length}
                </Text>
                <Text style={styles.statLabel}>Active Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round((Object.keys(calendarData.activity_density).length / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Consistency</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={modalVisible}
        onClose={closeModal}
        selectedDate={selectedDate}
        dayActivities={dayActivities}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  placeholder: {
    width: 40,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F3F0',
  },
  monthContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  activityCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  legend: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
    flex: 1,
  },
  legendIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  calendarContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B7355',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});