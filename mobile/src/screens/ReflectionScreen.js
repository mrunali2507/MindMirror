import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { auth } from '../config/firebase';
import { saveReflection, getReflections, updateBaseline, getRandomPrompt } from '../services/firestoreService';
import { analyzeText, calculateDrift } from '../services/nlpService';
import { calculateBaseline, COLORS, getSentimentColor } from '../utils/helpers';
import PromptCard from '../components/PromptCard';

export default function ReflectionScreen() {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const userId = auth.currentUser?.uid;

  const loadPrompt = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getRandomPrompt();
      setPrompt(p);
    } catch (e) {
      setPrompt('How are you feeling today?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Reflection', 'Please write something about how you feel.');
      return;
    }
    if (text.trim().length < 10) {
      Alert.alert('Too Short', 'Please write at least a few words about how you feel.');
      return;
    }

    Keyboard.dismiss();
    setSubmitting(true);

    try {
      // 1. Analyze text with NLP service
      const analysis = await analyzeText(text.trim());

      // 2. Save reflection to Firestore
      await saveReflection(userId, {
        text: text.trim(),
        sentimentScore: analysis.sentimentScore,
        emotions: analysis.emotions,
        dominantEmotion: analysis.dominantEmotion,
        promptUsed: prompt,
      });

      // 3. Check and update baseline / drift
      const reflections = await getReflections(userId, 50);
      const scores = reflections
        .filter((r) => r.sentimentScore !== undefined)
        .map((r) => r.sentimentScore)
        .reverse(); // Chronological order

      if (scores.length >= 7) {
        const baseline = calculateBaseline(scores);
        if (baseline !== null) {
          await updateBaseline(userId, baseline);

          // Calculate drift if we have enough data
          if (scores.length >= 14) {
            await calculateDrift(scores, baseline);
          }
        }
      }

      // 4. Show result
      setLastResult({
        sentimentScore: analysis.sentimentScore,
        dominantEmotion: analysis.dominantEmotion,
        emotions: analysis.emotions,
      });
      setText('');
      loadPrompt();

      Alert.alert(
        '✨ Reflection Saved',
        `Sentiment: ${analysis.sentimentScore.toFixed(2)} | Emotion: ${analysis.dominantEmotion}`,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save reflection. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Reflection</Text>
        <Text style={styles.subtitle}>Take a moment to check in with yourself</Text>
      </View>

      {/* Prompt Card */}
      <PromptCard prompt={prompt} loading={loading} onRefresh={loadPrompt} />

      {/* Text Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Write about how you're feeling today..."
          placeholderTextColor={COLORS.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={styles.charCount}>{text.length} / 2000</Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <View style={styles.submitContent}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.submitText}>  Analyzing...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Save & Analyze ✨</Text>
        )}
      </TouchableOpacity>

      {/* Last Result */}
      {lastResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Latest Analysis</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Sentiment</Text>
            <Text
              style={[
                styles.resultValue,
                { color: getSentimentColor(lastResult.sentimentScore) },
              ]}
            >
              {lastResult.sentimentScore.toFixed(3)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Dominant Emotion</Text>
            <Text style={styles.resultEmoji}>
              {lastResult.dominantEmotion === 'joy' && '😊 Joy'}
              {lastResult.dominantEmotion === 'sadness' && '😢 Sadness'}
              {lastResult.dominantEmotion === 'anger' && '😠 Anger'}
              {lastResult.dominantEmotion === 'stress' && '😰 Stress'}
              {lastResult.dominantEmotion === 'neutral' && '😐 Neutral'}
            </Text>
          </View>
          <View style={styles.emotionBar}>
            {Object.entries(lastResult.emotions).map(([emotion, score]) => (
              <View key={emotion} style={styles.emotionItem}>
                <View
                  style={[
                    styles.emotionDot,
                    { backgroundColor: getSentimentColor(score) },
                  ]}
                />
                <Text style={styles.emotionLabel}>{emotion}</Text>
                <Text style={styles.emotionScore}>{(score * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
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
  inputWrapper: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  resultCard: {
    marginTop: 28,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultEmoji: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emotionBar: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emotionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  emotionScore: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
});
