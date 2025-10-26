import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useXP } from '../useXP';
import { getTierName, getPercentile } from '../utils/xpPercentileMapper';
import { LinearGradient } from 'expo-linear-gradient';

const getEmoji = (tierName: string): string => {
  switch (tierName) {
    case 'Apex': return '👑';
    case 'Legend': return '⚡';
    case 'Visionary': return '🌟';
    case 'Luminary': return '💫';
    case 'Champion': return '🏆';
    case 'Innovator': return '💡';
    case 'Pioneer': return '🚀';
    case 'Achiever': return '⭐';
    case 'Explorer': return '🌎';
    case 'Pathfinder': return '🎯';
    default: return '✨';
  }
};

const getTierGradient = (tierName: string): string[] => {
  switch (tierName) {
    case 'Apex': return ['#FFD700', '#B8860B', '#8B6914']; // Gold gradient
    case 'Legend': return ['#E8E8E8', '#A4A4A4', '#707070']; // Silver gradient
    case 'Visionary': return ['#9C27B0', '#4A148C', '#2A0845']; // Purple gradient
    case 'Luminary': return ['#2196F3', '#0D47A1', '#052455']; // Blue gradient
    case 'Champion': return ['#4CAF50', '#1B5E20', '#0A2810']; // Green gradient
    case 'Innovator': return ['#00BCD4', '#006064', '#002F32']; // Cyan gradient
    case 'Pioneer': return ['#FF5722', '#BF360C', '#5F1B06']; // Orange gradient
    case 'Achiever': return ['#FFC107', '#FF8F00', '#7F4700']; // Amber gradient
    case 'Explorer': return ['#8BC34A', '#33691E', '#1A350F']; // Light Green gradient
    case 'Pathfinder': return ['#03A9F4', '#01579B', '#012D4E']; // Light Blue gradient
    default: return ['#9C27B0', '#4A148C', '#2A0845']; // Default Purple gradient
  }
};

export const XPDetailsDisplay: React.FC = () => {
  const { totalXP } = useXP();
  const tierName = getTierName(totalXP);
  const emoji = getEmoji(tierName);
  const gradientColors = getTierGradient(tierName);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>Self Improvement Level</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.xpText}>
          {emoji} XP {totalXP}
        </Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.tierText}>
          {tierName} {emoji}
        </Text>
      </View>
      <Text style={styles.percentileText}>
        Top {getPercentile(totalXP)}% of Self-Improvers Worldwide
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  separator: {
    fontSize: 15,
    color: '#FFFFFF',
    marginHorizontal: 8,
    opacity: 0.8,
  },
  tierText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  percentileText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 