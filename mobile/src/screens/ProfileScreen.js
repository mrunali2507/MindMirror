import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { auth } from '../config/firebase';
import { getUserProfile, getReflections, getLatestDrift } from '../services/firestoreService';
import { logout } from '../services/authService';
import { COLORS, getDriftInfo, formatDate } from '../utils/helpers';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [recentCount, setRecentCount] = useState(0);
  const [drift, setDrift] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);

      const reflections = await getReflections(user.uid, 999);
      setRecentCount(reflections.length);

      const latestDrift = await getLatestDrift(user.uid);
      setDrift(latestDrift);
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out.');
          }
        },
      },
    ]);
  };

  const driftInfo = drift ? getDriftInfo(drift.driftDirection) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName || user?.email || '?')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {profile?.createdAt && (
          <Text style={styles.joinDate}>
            Joined {formatDate(profile.createdAt)}
          </Text>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{recentCount}</Text>
          <Text style={styles.statLabel}>Reflections</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {profile?.baselineScore?.toFixed(2) || '—'}
          </Text>
          <Text style={styles.statLabel}>Baseline</Text>
        </View>
        <View style={styles.statCard}>
          <Text
            style={[
              styles.statNumber,
              driftInfo && { color: driftInfo.color },
            ]}
          >
            {drift ? `${driftInfo.icon} ${drift.driftScore?.toFixed(2)}` : '—'}
          </Text>
          <Text style={styles.statLabel}>Drift</Text>
        </View>
      </View>

      {/* Drift Insight */}
      {drift?.insight && (
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 Emotional Insight</Text>
          <Text style={styles.insightText}>{drift.insight}</Text>
        </View>
      )}

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>MindMirror v1.0.0</Text>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 24,
    opacity: 0.5,
  },
});
