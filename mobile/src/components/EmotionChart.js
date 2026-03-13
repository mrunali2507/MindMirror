import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, formatShortDate } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width - 40;

export default function EmotionChart({ reflections }) {
  if (!reflections || reflections.length < 2) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          📊 Need at least 2 reflections to show the trend chart.
        </Text>
      </View>
    );
  }

  // Take last 14 reflections in chronological order
  const data = reflections.slice(0, 14).reverse();
  const labels = data.map((r) =>
    r.createdAt ? formatShortDate(r.createdAt) : ''
  );
  const scores = data.map((r) => r.sentimentScore || 0);

  // Show every other label to avoid crowding
  const displayLabels = labels.map((l, i) =>
    i % Math.ceil(labels.length / 6) === 0 ? l : ''
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📈 Emotional Trend</Text>
      <LineChart
        data={{
          labels: displayLabels,
          datasets: [
            {
              data: scores,
              color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
              strokeWidth: 2.5,
            },
            // Add baseline lines for reference
            {
              data: scores.map(() => 0),
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.15})`,
              strokeWidth: 1,
              withDots: false,
            },
          ],
        }}
        width={screenWidth}
        height={200}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surfaceLight,
          decimalCount: 2,
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(167, 167, 190, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: COLORS.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: COLORS.surfaceLight,
            strokeWidth: 0.5,
          },
        }}
        bezier
        style={styles.chart}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Sentiment Score (-1 to +1)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
