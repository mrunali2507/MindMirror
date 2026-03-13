import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { auth } from '../config/firebase';
import { getReflections, getLatestDrift, getUserProfile } from '../services/firestoreService';
import { COLORS, getDriftInfo, formatDate } from '../utils/helpers';
import EmotionChart from '../components/EmotionChart';
import DriftIndicator from '../components/DriftIndicator';

export default function DashboardScreen() {
  const [reflections, setReflections] = useState([]);
  const [drift, setDrift] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = auth.currentUser?.uid;

  const loadData = useCallback(async () => {
    try {
      const [refs, latestDrift, userProfile] = await Promise.all([
        getReflections(userId, 30),
        getLatestDrift(userId),
        getUserProfile(userId),
      ]);
      setReflections(refs);
      setDrift(latestDrift);
      setProfile(userProfile);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your insights...</Text>
      </View>
    );
  }

  const driftInfo = drift ? getDriftInfo(drift.driftDirection) : null;

  // Compute emotion distribution from recent reflections
  const emotionCounts = { joy: 0, sadness: 0, anger: 0, stress: 0, neutral: 0 };
  reflections.forEach((r) => {
    if (r.dominantEmotion && emotionCounts.hasOwnProperty(r.dominantEmotion)) {
      emotionCounts[r.dominantEmotion]++;
    }
  });
  const totalEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Your emotional journey at a glance
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reflections.length}</Text>
          <Text style={styles.summaryLabel}>Reflections</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {profile?.baselineScore?.toFixed(2) || '—'}
          </Text>
          <Text style={styles.summaryLabel}>Baseline</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text
            style={[
              styles.summaryNumber,
              driftInfo && { color: driftInfo.color },
            ]}
          >
            {drift
              ? `${driftInfo.icon}${drift.driftScore?.toFixed(2)}`
              : '—'}
          </Text>
          <Text style={styles.summaryLabel}>Drift</Text>
        </View>
      </View>

      {/* Emotional Trend Graph */}
      <View style={styles.section}>
        <EmotionChart reflections={reflections} />
      </View>

      {/* Drift Indicator */}
      {drift && (
        <View style={styles.section}>
          <DriftIndicator
            driftScore={drift.driftScore}
            driftDirection={drift.driftDirection}
            insight={drift.insight}
          />
        </View>
      )}

      {/* Emotion Distribution */}
      {totalEmotions > 0 && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🎭 Emotion Distribution</Text>
            <Text style={styles.sectionSubtitle}>
              Based on your last {reflections.length} reflections
            </Text>
            {Object.entries(emotionCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, count]) => {
                const pct = totalEmotions > 0 ? (count / totalEmotions) * 100 : 0;
                return (
                  <View key={emotion} style={styles.emotionRow}>
                    <Text style={styles.emotionEmoji}>
                      {emotion === 'joy' && '😊'}
                      {emotion === 'sadness' && '😢'}
                      {emotion === 'anger' && '😠'}
                      {emotion === 'stress' && '😰'}
                      {emotion === 'neutral' && '😐'}
                    </Text>
                    <Text style={styles.emotionName}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor:
                              emotion === 'joy'
                                ? COLORS.success
                                : emotion === 'sadness'
                                  ? '#2196F3'
                                  : emotion === 'anger'
                                    ? COLORS.error
                                    : emotion === 'stress'
                                      ? COLORS.warning
                                      : COLORS.textSecondary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.emotionPct}>{pct.toFixed(0)}%</Text>
                  </View>
                );
              })}
          </View>
        </View>
      )}

      {/* Recent Reflections */}
      {reflections.length > 0 && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📝 Recent Reflections</Text>
            {reflections.slice(0, 5).map((r, index) => (
              <View
                key={r.id || index}
                style={[
                  styles.reflectionItem,
                  index < 4 && styles.reflectionBorder,
                ]}
              >
                <View style={styles.reflectionHeader}>
                  <Text style={styles.reflectionDate}>
                    {r.createdAt ? formatDate(r.createdAt) : 'Just now'}
                  </Text>
                  <View
                    style={[
                      styles.sentimentBadge,
                      {
                        backgroundColor:
                          r.sentimentScore > 0.1
                            ? COLORS.success + '20'
                            : r.sentimentScore < -0.1
                              ? COLORS.error + '20'
                              : COLORS.textSecondary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sentimentText,
                        {
                          color:
                            r.sentimentScore > 0.1
                              ? COLORS.success
                              : r.sentimentScore < -0.1
                                ? COLORS.error
                                : COLORS.textSecondary,
                        },
                      ]}
                    >
                      {r.sentimentScore?.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reflectionText} numberOfLines={2}>
                  {r.text}
                </Text>
                {r.dominantEmotion && (
                  <Text style={styles.reflectionEmotion}>
                    {r.dominantEmotion === 'joy' && '😊'}
                    {r.dominantEmotion === 'sadness' && '😢'}
                    {r.dominantEmotion === 'anger' && '😠'}
                    {r.dominantEmotion === 'stress' && '😰'}
                    {r.dominantEmotion === 'neutral' && '😐'}{' '}
                    {r.dominantEmotion}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {reflections.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyText}>
            Start writing daily reflections to see your emotional trends and insights here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  emotionEmoji: {
    fontSize: 18,
    width: 24,
  },
  emotionName: {
    fontSize: 13,
    color: COLORS.text,
    width: 64,
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  emotionPct: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 36,
    textAlign: 'right',
    fontWeight: '600',
  },
  reflectionItem: {
    paddingVertical: 14,
  },
  reflectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reflectionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reflectionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    opacity: 0.9,
  },
  reflectionEmotion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});
