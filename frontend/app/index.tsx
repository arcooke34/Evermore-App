import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BonsaiTree from '../components/BonsaiTree';
import ProgressBar from '../components/ProgressBar';
import ActivityCard from '../components/ActivityCard';
import StreakCounter from '../components/StreakCounter';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

interface Progress {
  communication: number;
  intimacy: number;
  trust: number;
}

interface ActivityData {
  dailyRitual: {
    title: string;
    description: string;
    completed: boolean;
  };
  weeklyGesture: {
    title: string;
    description: string;
    completed: boolean;
  };
  monthlyBigGesture: {
    title: string;
    description: string;
    completed: boolean;
  };
}

export default function Dashboard() {
  const [progress, setProgress] = useState<Progress>({
    communication: 0,
    intimacy: 0,
    trust: 0,
  });
  const [streak, setStreak] = useState(0);
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [activities, setActivities] = useState<ActivityData>({
    dailyRitual: {
      title: "2-Minute Gratitude Hug",
      description: "Share a warm, mindful hug while expressing one thing you're grateful for about each other",
      completed: false,
    },
    weeklyGesture: {
      title: "Cook Together",
      description: "Prepare a meal together, trying a new recipe or recreating a favorite dish",
      completed: false,
    },
    monthlyBigGesture: {
      title: "Plan Weekend Adventure",
      description: "Design and plan a special weekend activity that you both will enjoy",
      completed: false,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('evermore_progress');
      const savedStreak = await AsyncStorage.getItem('evermore_streak');
      const savedActivities = await AsyncStorage.getItem('evermore_activities');
      const savedTreeGrowth = await AsyncStorage.getItem('evermore_tree_growth');

      if (savedProgress) setProgress(JSON.parse(savedProgress));
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedTreeGrowth) setTreeGrowth(parseFloat(savedTreeGrowth));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (newProgress: Progress, newStreak: number, newActivities: ActivityData, newTreeGrowth: number) => {
    try {
      await AsyncStorage.setItem('evermore_progress', JSON.stringify(newProgress));
      await AsyncStorage.setItem('evermore_streak', newStreak.toString());
      await AsyncStorage.setItem('evermore_activities', JSON.stringify(newActivities));
      await AsyncStorage.setItem('evermore_tree_growth', newTreeGrowth.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const completeActivity = async (activityType: keyof ActivityData) => {
    const newActivities = { ...activities };
    newActivities[activityType].completed = true;

    // Calculate progress increases
    const progressIncrease = {
      dailyRitual: { communication: 0.5, intimacy: 0.3, trust: 0.2 },
      weeklyGesture: { communication: 1.0, intimacy: 1.5, trust: 1.0 },
      monthlyBigGesture: { communication: 2.0, intimacy: 3.0, trust: 2.5 },
    };

    const increase = progressIncrease[activityType];
    const newProgress = {
      communication: Math.min(100, progress.communication + increase.communication),
      intimacy: Math.min(100, progress.intimacy + increase.intimacy),
      trust: Math.min(100, progress.trust + increase.trust),
    };

    // Update tree growth and streak
    const newTreeGrowth = Math.min(100, treeGrowth + (activityType === 'monthlyBigGesture' ? 15 : activityType === 'weeklyGesture' ? 8 : 3));
    const newStreak = activityType === 'dailyRitual' ? streak + 1 : streak;

    setActivities(newActivities);
    setProgress(newProgress);
    setTreeGrowth(newTreeGrowth);
    setStreak(newStreak);

    await saveData(newProgress, newStreak, newActivities, newTreeGrowth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Evermore</Text>
          <StreakCounter streak={streak} />
        </View>

        {/* Bonsai Tree Section */}
        <View style={styles.treeSection}>
          <BonsaiTree growth={treeGrowth} />
        </View>

        {/* Progress Bars */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Connection Journey</Text>
          <ProgressBar label="Communication" progress={progress.communication} color="#8B7355" />
          <ProgressBar label="Intimacy" progress={progress.intimacy} color="#C17767" />
          <ProgressBar label="Trust" progress={progress.trust} color="#6B8E6B" />
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Today's Journey</Text>
          
          <ActivityCard
            icon="🌱"
            title="Today's Ritual"
            activity={activities.dailyRitual}
            onComplete={() => completeActivity('dailyRitual')}
            cardColor="#F5F3F0"
          />
          
          <ActivityCard
            icon="💌"
            title="This Week's Gesture"
            activity={activities.weeklyGesture}
            onComplete={() => completeActivity('weeklyGesture')}
            cardColor="#F8F5F4"
          />
          
          <ActivityCard
            icon="🎉"
            title="This Month's Big Gesture"
            activity={activities.monthlyBigGesture}
            onComplete={() => completeActivity('monthlyBigGesture')}
            cardColor="#F6F8F6"
          />
        </View>

        {/* Upcoming Observances */}
        <View style={styles.observancesSection}>
          <Text style={styles.sectionTitle}>Upcoming Observances</Text>
          <View style={styles.observanceCard}>
            <Ionicons name="heart" size={20} color="#C17767" />
            <Text style={styles.observanceText}>Valentine's Day in 23 days</Text>
          </View>
        </View>

        {/* Bottom Navigation Placeholder */}
        <View style={styles.bottomNavPlaceholder}>
          <Text style={styles.placeholderText}>More features coming soon...</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="calendar-outline" size={24} color="#8B7355" />
              <Text style={styles.navButtonText}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#999" />
              <Text style={[styles.navButtonText, styles.disabled]}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="lock-closed-outline" size={24} color="#999" />
              <Text style={[styles.navButtonText, styles.disabled]}>Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    letterSpacing: -0.5,
  },
  treeSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FEFCFB',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  activitiesSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  observancesSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  observanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  observanceText: {
    fontSize: 16,
    color: '#2C2C2C',
    marginLeft: 12,
    fontWeight: '500',
  },
  bottomNavPlaceholder: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    alignItems: 'center',
    padding: 12,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: '#8B7355',
    fontWeight: '500',
  },
  disabled: {
    color: '#999',
  },
});