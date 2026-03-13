// Base URL for the Python NLP service
// Change this to your deployed URL in production
const NLP_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator → localhost
// const NLP_BASE_URL = 'http://localhost:8000'; // iOS simulator / Web

/**
 * Analyze text for sentiment and emotions
 * @param {string} text - The reflection text to analyze
 * @returns {{ sentimentScore: number, emotions: object, dominantEmotion: string }}
 */
export const analyzeText = async (text) => {
  try {
    const response = await fetch(`${NLP_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`NLP service error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('NLP service unavailable, using fallback:', error.message);
    // Fallback: return neutral analysis if NLP service is down
    return {
      sentimentScore: 0,
      emotions: { stress: 0, sadness: 0, joy: 0, anger: 0, neutral: 1 },
      dominantEmotion: 'neutral',
    };
  }
};

/**
 * Calculate drift between baseline and recent scores
 * @param {number[]} scores - All sentiment scores
 * @param {number} baseline - Baseline score
 * @returns {{ driftScore: number, recentAverage: number, driftDirection: string, insight: string }}
 */
export const calculateDrift = async (scores, baseline) => {
  try {
    const response = await fetch(`${NLP_BASE_URL}/drift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores, baseline }),
    });

    if (!response.ok) {
      throw new Error(`NLP drift error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Drift service unavailable, calculating locally:', error.message);
    // Local fallback calculation
    const recent = scores.slice(-7);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const drift = recentAvg - baseline;
    return {
      driftScore: parseFloat(drift.toFixed(3)),
      recentAverage: parseFloat(recentAvg.toFixed(3)),
      driftDirection: drift > 0.1 ? 'positive' : drift < -0.1 ? 'negative' : 'stable',
      insight: drift > 0.1
        ? 'Your mood has been trending upward recently. Keep it up!'
        : drift < -0.1
          ? 'Your mood has been trending downward. Consider activities that bring you joy.'
          : 'Your emotional state has been relatively stable.',
    };
  }
};
