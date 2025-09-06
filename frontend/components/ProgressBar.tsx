import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  label: string;
  progress: number; // 0-100
  color: string;
}

export default function ProgressBar({ label, progress, color }: ProgressBarProps) {
  const animatedWidth = new Animated.Value(progress);

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
        <View style={styles.progressBarBackground} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  progressBarContainer: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
    zIndex: 1,
  },
});