/**
 * Format a Firestore timestamp to a readable date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a Firestore timestamp to a short label (e.g., "Mar 13")
 */
export const formatShortDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Emotion color mapping for consistent UI
 */
export const EMOTION_COLORS = {
  joy: '#4CAF50',
  neutral: '#9E9E9E',
  stress: '#FF9800',
  sadness: '#2196F3',
  anger: '#F44336',
};

/**
 * Get color for a sentiment score (-1 to +1)
 */
export const getSentimentColor = (score) => {
  if (score >= 0.5) return '#4CAF50';  // Strong positive - green
  if (score >= 0.1) return '#8BC34A';  // Mild positive - light green
  if (score > -0.1) return '#9E9E9E'; // Neutral - grey
  if (score > -0.5) return '#FF9800'; // Mild negative - orange
  return '#F44336';                    // Strong negative - red
};

/**
 * Get drift status info (label, color, icon)
 */
export const getDriftInfo = (direction) => {
  switch (direction) {
    case 'positive':
      return { label: 'Improving', color: '#4CAF50', icon: '↑' };
    case 'negative':
      return { label: 'Declining', color: '#F44336', icon: '↓' };
    default:
      return { label: 'Stable', color: '#9E9E9E', icon: '→' };
  }
};

/**
 * Calculate baseline from first N reflection scores
 */
export const calculateBaseline = (scores, n = 7) => {
  if (scores.length < n) return null;
  const firstN = scores.slice(0, n);
  const avg = firstN.reduce((sum, s) => sum + s, 0) / n;
  return parseFloat(avg.toFixed(3));
};

/**
 * App color palette
 */
export const COLORS = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B85FF',
  secondary: '#FF6584',
  background: '#0F0E17',
  surface: '#1A1A2E',
  surfaceLight: '#232340',
  text: '#FFFFFE',
  textSecondary: '#A7A7BE',
  accent: '#7F5AF0',
  success: '#2CB67D',
  warning: '#FF8906',
  error: '#E53170',
  cardGradientStart: '#1A1A2E',
  cardGradientEnd: '#16213E',
};
