import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Clock, TrendingUp, Calendar, BookOpen, BarChart as BarChart } from 'lucide-react-native';
import { useReadingStore } from '../store/readingStore';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8'
};

export default function ReadingAnalytics() {
  const { 
    totalHours,
    weeklyHours,
    monthlyHours,
    addReadingSession,
    currentStreak,
    longestStreak,
    averageHoursPerDay
  } = useReadingStore();

  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const handleStartTracking = () => {
    setIsTracking(true);
    setSessionStartTime(new Date());
  };

  const handleStopTracking = () => {
    if (sessionStartTime) {
      const endTime = new Date();
      const durationInHours = (endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60 * 60);
      addReadingSession(durationInHours);
    }
    setIsTracking(false);
    setSessionStartTime(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reading Analytics</Text>
        <TouchableOpacity 
          style={[
            styles.trackButton,
            isTracking && styles.trackingButton
          ]}
          onPress={isTracking ? handleStopTracking : handleStartTracking}
        >
          <Clock size={18} color="white" />
          <Text style={styles.trackButtonText}>
            {isTracking ? 'Stop Tracking' : 'Start Reading'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {/* Total Hours */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <BookOpen size={20} color={THEME.accent} />
          </View>
          <Text style={styles.statValue}>{totalHours.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>

        {/* Current Streak */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color={THEME.accent} />
          </View>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        {/* Weekly Hours */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Calendar size={20} color={THEME.accent} />
          </View>
          <Text style={styles.statValue}>{weeklyHours.toFixed(1)}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>

        {/* Average Per Day */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <BarChart size={20} color={THEME.accent} />
          </View>
          <Text style={styles.statValue}>{averageHoursPerDay.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Hours/Day</Text>
        </View>
      </View>

      <View style={styles.additionalStats}>
        <View style={styles.additionalStat}>
          <Text style={styles.additionalStatLabel}>Monthly Hours</Text>
          <Text style={styles.additionalStatValue}>{monthlyHours.toFixed(1)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.additionalStat}>
          <Text style={styles.additionalStatLabel}>Longest Streak</Text>
          <Text style={styles.additionalStatValue}>{longestStreak} days</Text>
        </View>
      </View>

      {isTracking && sessionStartTime && (
        <View style={styles.activeSession}>
          <Clock size={16} color={THEME.accent} />
          <Text style={styles.activeSessionText}>
            Reading session started at {sessionStartTime.toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  trackingButton: {
    backgroundColor: '#BC6C25',
  },
  trackButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  statCard: {
    width: '50%',
    padding: 5,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: THEME.textLight,
  },
  additionalStats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  additionalStat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: THEME.border,
  },
  additionalStatLabel: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 4,
  },
  additionalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  activeSession: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  activeSessionText: {
    color: THEME.accent,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});