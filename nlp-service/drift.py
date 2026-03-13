"""
Emotional Drift Detection Module
Computes how a user's emotional state has shifted from their baseline.

Algorithm:
  baseline = average of first 7 sentiment scores
  recent_average = average of last 7 sentiment scores
  drift_score = recent_average - baseline

Drift direction:
  drift >  0.1 → "positive" (mood improving)
  drift < -0.1 → "negative" (mood declining)
  else         → "stable"
"""

from typing import List


def compute_drift(scores: List[float], baseline: float, window: int = 7) -> dict:
    """
    Calculate emotional drift between baseline and recent scores.

    Args:
        scores: List of all sentiment scores in chronological order.
        baseline: The established baseline score (avg of first N entries).
        window: Number of recent entries to average (default: 7).

    Returns:
        Dictionary with:
        - drift_score: float (recent_avg - baseline)
        - recent_average: float
        - drift_direction: "positive" | "negative" | "stable"
        - insight: Human-readable insight text
    """
    if not scores:
        return {
            "drift_score": 0.0,
            "recent_average": baseline,
            "drift_direction": "stable",
            "insight": "Not enough data to calculate emotional drift.",
        }

    # Get the most recent entries
    recent = scores[-window:] if len(scores) >= window else scores
    recent_average = sum(recent) / len(recent)

    # Calculate drift
    drift_score = round(recent_average - baseline, 4)
    recent_average = round(recent_average, 4)

    # Determine direction
    if drift_score > 0.1:
        drift_direction = "positive"
    elif drift_score < -0.1:
        drift_direction = "negative"
    else:
        drift_direction = "stable"

    # Generate insight
    insight = _generate_insight(drift_score, drift_direction, recent_average, baseline)

    return {
        "drift_score": drift_score,
        "recent_average": recent_average,
        "drift_direction": drift_direction,
        "insight": insight,
    }


def compute_baseline(scores: List[float], n: int = 7) -> float:
    """
    Calculate the emotional baseline from the first N entries.

    Args:
        scores: List of sentiment scores in chronological order.
        n: Number of initial entries to use for baseline.

    Returns:
        Baseline score (average of first N entries), or 0.0 if not enough data.
    """
    if len(scores) < n:
        return 0.0

    first_n = scores[:n]
    return round(sum(first_n) / len(first_n), 4)


def _generate_insight(drift_score: float, direction: str, recent_avg: float, baseline: float) -> str:
    """Generate a human-readable insight based on drift analysis."""
    magnitude = abs(drift_score)

    if direction == "positive":
        if magnitude > 0.3:
            return (
                "Your emotional well-being has significantly improved recently. "
                "Your reflections show a notably more positive outlook compared to your baseline. "
                "Keep nurturing the habits and activities that are contributing to this positive shift!"
            )
        else:
            return (
                "There's a gentle upward trend in your mood. "
                "Your recent reflections are slightly more positive than your baseline. "
                "You're on a good path — keep reflecting and staying aware of your emotions."
            )
    elif direction == "negative":
        if magnitude > 0.3:
            return (
                "Your recent reflections show a significant decline in emotional well-being. "
                "Consider reaching out to someone you trust or exploring activities that typically lift your mood. "
                "Remember, seeking help is a sign of strength, not weakness."
            )
        else:
            return (
                "Your mood has dipped slightly below your baseline. "
                "This is normal and temporary. Try to identify what might be contributing to this shift "
                "and consider engaging in self-care activities."
            )
    else:
        return (
            "Your emotional state has been relatively stable. "
            "Your recent reflections are consistent with your baseline mood. "
            "Stability is good — continue your reflection practice to maintain self-awareness."
        )
