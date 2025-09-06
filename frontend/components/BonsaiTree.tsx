import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

interface BonsaiTreeProps {
  growth: number; // 0-100 percentage of growth
}

export default function BonsaiTree({ growth }: BonsaiTreeProps) {
  // Calculate different growth stages
  const trunkOpacity = Math.min(1, growth / 20);
  const mainBranchOpacity = Math.min(1, Math.max(0, (growth - 10) / 30));
  const secondaryBranchOpacity = Math.min(1, Math.max(0, (growth - 30) / 30));
  const leavesOpacity = Math.min(1, Math.max(0, (growth - 40) / 40));
  const flowersOpacity = Math.min(1, Math.max(0, (growth - 70) / 30));

  // Dynamic leaf colors based on growth
  const leafColor = growth > 80 ? '#4A7C4A' : growth > 60 ? '#5B8B5B' : '#6B8E6B';
  const flowerColor = '#C17767';

  return (
    <View style={styles.container}>
      <Svg width="280" height="220" viewBox="0 0 280 220">
        {/* Pot */}
        <Path
          d="M80 180 L200 180 L195 200 L85 200 Z"
          fill="#8B7355"
          opacity={0.9}
        />
        <Ellipse cx="140" cy="180" rx="60" ry="8" fill="#6B5B47" />

        {/* Trunk */}
        <Path
          d="M135 180 Q138 160 145 140 Q148 120 140 100 Q138 85 142 70"
          stroke="#5D4E37"
          strokeWidth="6"
          fill="none"
          opacity={trunkOpacity}
        />

        {/* Main branches */}
        <Path
          d="M142 70 Q150 65 165 60 Q175 58 185 62"
          stroke="#5D4E37"
          strokeWidth="3"
          fill="none"
          opacity={mainBranchOpacity}
        />
        <Path
          d="M140 85 Q130 80 115 75 Q105 73 95 77"
          stroke="#5D4E37"
          strokeWidth="3"
          fill="none"
          opacity={mainBranchOpacity}
        />
        <Path
          d="M145 100 Q155 95 170 90 Q180 88 190 92"
          stroke="#5D4E37"
          strokeWidth="3"
          fill="none"
          opacity={mainBranchOpacity}
        />

        {/* Secondary branches */}
        <Path
          d="M185 62 Q190 58 200 55 Q210 53 220 57"
          stroke="#5D4E37"
          strokeWidth="2"
          fill="none"
          opacity={secondaryBranchOpacity}
        />
        <Path
          d="M95 77 Q85 72 70 67 Q60 65 50 69"
          stroke="#5D4E37"
          strokeWidth="2"
          fill="none"
          opacity={secondaryBranchOpacity}
        />
        <Path
          d="M190 92 Q200 87 215 82 Q225 80 235 84"
          stroke="#5D4E37"
          strokeWidth="2"
          fill="none"
          opacity={secondaryBranchOpacity}
        />

        {/* Leaves - Main clusters */}
        <Circle
          cx="220"
          cy="57"
          r="15"
          fill={leafColor}
          opacity={leavesOpacity}
        />
        <Circle
          cx="50"
          cy="69"
          r="12"
          fill={leafColor}
          opacity={leavesOpacity}
        />
        <Circle
          cx="235"
          cy="84"
          r="18"
          fill={leafColor}
          opacity={leavesOpacity}
        />
        <Circle
          cx="165"
          cy="60"
          r="10"
          fill={leafColor}
          opacity={leavesOpacity}
        />
        <Circle
          cx="115"
          cy="75"
          r="14"
          fill={leafColor}
          opacity={leavesOpacity}
        />

        {/* Additional small leaf clusters */}
        <Circle
          cx="205"
          cy="45"
          r="8"
          fill={leafColor}
          opacity={leavesOpacity * 0.8}
        />
        <Circle
          cx="65"
          cy="60"
          r="9"
          fill={leafColor}
          opacity={leavesOpacity * 0.8}
        />
        <Circle
          cx="250"
          cy="90"
          r="12"
          fill={leafColor}
          opacity={leavesOpacity * 0.7}
        />

        {/* Flowers - appear at higher growth */}
        <Circle
          cx="225"
          cy="52"
          r="3"
          fill={flowerColor}
          opacity={flowersOpacity}
        />
        <Circle
          cx="215"
          cy="60"
          r="3"
          fill={flowerColor}
          opacity={flowersOpacity}
        />
        <Circle
          cx="240"
          cy="78"
          r="3"
          fill={flowerColor}
          opacity={flowersOpacity}
        />
        <Circle
          cx="55"
          cy="65"
          r="3"
          fill={flowerColor}
          opacity={flowersOpacity}
        />
        <Circle
          cx="118"
          cy="70"
          r="3"
          fill={flowerColor}
          opacity={flowersOpacity}
        />

        {/* Growth sparkles at very high growth */}
        {growth > 90 && (
          <>
            <Circle cx="180" cy="40" r="2" fill="#FFD700" opacity={0.8} />
            <Circle cx="100" cy="50" r="1.5" fill="#FFD700" opacity={0.6} />
            <Circle cx="260" cy="70" r="2" fill="#FFD700" opacity={0.7} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});