import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 48) / 7; // 7 days per week, with padding

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

interface CalendarGridProps {
  currentDate: Date;
  calendarData: CalendarData | null;
  onDatePress: (date: Date) => void;
  loading: boolean;
}

export default function CalendarGrid({ currentDate, calendarData, onDatePress, loading }: CalendarGridProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    // Generate 6 weeks (42 days) to ensure consistent grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getActivityIcons = (date: Date) => {
    if (!calendarData) return [];

    const dateString = date.toISOString().split('T')[0];
    const dayActivities = calendarData.activity_density[dateString] || [];
    
    const icons: string[] = [];
    const activityTypes = new Set();
    
    dayActivities.forEach((activity) => {
      if (!activityTypes.has(activity.activity_type)) {
        activityTypes.add(activity.activity_type);
        switch (activity.activity_type) {
          case 'dailyRitual':
            icons.push('🌱');
            break;
          case 'weeklyGesture':
            icons.push('💌');
            break;
          case 'monthlyBigGesture':
            icons.push('🎉');
            break;
        }
      }
    });

    return icons;
  };

  const getHeatmapIntensity = (date: Date) => {
    if (!calendarData) return 0;

    const dateString = date.toISOString().split('T')[0];
    const dayActivities = calendarData.activity_density[dateString] || [];
    
    // Return intensity based on number of activities (0-3)
    return Math.min(dayActivities.length, 3);
  };

  const getHeatmapColor = (intensity: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return '#F8F8F8';
    
    const colors = [
      '#FEFCFB',    // 0 activities
      '#F5F3F0',    // 1 activity
      '#E8E3DC',    // 2 activities
      '#D4C7B8',    // 3+ activities
    ];
    
    return colors[intensity] || colors[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B7355" />
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Days of week header */}
      <View style={styles.weekHeader}>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map((date, index) => {
          const currentMonthDay = isCurrentMonth(date);
          const today = isToday(date);
          const intensity = getHeatmapIntensity(date);
          const heatmapColor = getHeatmapColor(intensity, currentMonthDay);
          const icons = getActivityIcons(date);

          return (
            <TouchableOpacity
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              style={[
                styles.dayCell,
                { backgroundColor: heatmapColor },
                today && styles.today,
                !currentMonthDay && styles.otherMonth,
              ]}
              onPress={() => onDatePress(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  !currentMonthDay && styles.otherMonthText,
                  today && styles.todayText,
                ]}
              >
                {date.getDate()}
              </Text>
              
              {/* Activity icons */}
              <View style={styles.iconsContainer}>
                {icons.slice(0, 3).map((icon, iconIndex) => (
                  <Text key={iconIndex} style={styles.activityIcon}>
                    {icon}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  today: {
    borderWidth: 2,
    borderColor: '#8B7355',
  },
  otherMonth: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  otherMonthText: {
    color: '#CCC',
  },
  todayText: {
    fontWeight: '700',
    color: '#8B7355',
  },
  iconsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 8,
    marginHorizontal: 1,
  },
});