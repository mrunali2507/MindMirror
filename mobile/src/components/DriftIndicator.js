import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, getDriftInfo } from '../utils/helpers';

export default function DriftIndicator({ driftScore, driftDirection, insight }) {
  const info = getDriftInfo(driftDirection);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Emotional Drift</Text>
        <View style={[styles.badge, { backgroundColor: info.color + '20' }]}>
          <Text style={[styles.badgeText, { color: info.color }]}>
            {info.icon} {info.label}
          </Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: info.color }]}>
          {driftScore > 0 ? '+' : ''}{driftScore.toFixed(3)}
        </Text>
        <Text style={styles.scoreLabel}>drift score</Text>
      </View>

      {insight && (
        <View style={styles.insightBox}>
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  score: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  insightBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
