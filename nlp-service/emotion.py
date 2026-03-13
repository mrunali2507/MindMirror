"""
Emotion Detection Module
Detects emotion categories from text using keyword matching combined with
VADER sentiment polarity. Returns scores for: stress, sadness, joy, anger, neutral.
"""

import re
from typing import Tuple

# Emotion keyword dictionaries (extensible)
EMOTION_KEYWORDS = {
    "joy": [
        "happy", "joy", "joyful", "excited", "grateful", "thankful", "love",
        "wonderful", "amazing", "great", "fantastic", "awesome", "delighted",
        "cheerful", "pleased", "proud", "optimistic", "content", "blessed",
        "laughing", "smile", "fun", "celebrate", "peaceful", "hopeful",
        "elated", "thrilled", "ecstatic", "blissful", "merry",
    ],
    "sadness": [
        "sad", "unhappy", "depressed", "lonely", "heartbroken", "grief",
        "crying", "tears", "miserable", "hopeless", "down", "blue",
        "melancholy", "sorrow", "disappointed", "gloomy", "despair",
        "devastated", "empty", "lost", "hurt", "pain", "suffering",
        "regret", "mourn", "dejected", "disheartened",
    ],
    "anger": [
        "angry", "furious", "mad", "irritated", "annoyed", "frustrated",
        "rage", "outraged", "hostile", "bitter", "resentful", "agitated",
        "infuriated", "livid", "enraged", "hate", "disgusted", "offended",
        "provoked", "aggravated", "fed up", "pissed",
    ],
    "stress": [
        "stressed", "anxious", "worried", "overwhelmed", "nervous", "tense",
        "pressure", "burnout", "exhausted", "tired", "drained", "overworked",
        "panic", "restless", "uneasy", "frantic", "hectic", "deadline",
        "insomnia", "fatigue", "strained", "burdened", "overloaded",
        "swamped", "chaos", "struggling",
    ],
}


def detect_emotions(text: str, sentiment_score: float) -> Tuple[dict, str]:
    """
    Detect emotion categories from text and sentiment score.

    Args:
        text: The reflection text to analyze.
        sentiment_score: VADER compound sentiment score (-1 to +1).

    Returns:
        Tuple of (emotions_dict, dominant_emotion).
        emotions_dict maps each emotion category to a confidence score (0 to 1).
    """
    if not text or not text.strip():
        return (
            {"stress": 0.0, "sadness": 0.0, "joy": 0.0, "anger": 0.0, "neutral": 1.0},
            "neutral",
        )

    text_lower = text.lower()
    words = re.findall(r'\b[a-z]+\b', text_lower)
    word_count = max(len(words), 1)

    # Count keyword matches for each emotion
    raw_scores = {}
    for emotion, keywords in EMOTION_KEYWORDS.items():
        matches = sum(1 for word in words if word in keywords)
        # Also check multi-word phrases
        phrase_matches = sum(1 for kw in keywords if ' ' in kw and kw in text_lower)
        raw_scores[emotion] = (matches + phrase_matches) / word_count

    # Boost scores based on sentiment polarity
    if sentiment_score > 0.3:
        raw_scores["joy"] = max(raw_scores["joy"], 0.3) + sentiment_score * 0.3
    elif sentiment_score < -0.3:
        # Negative sentiment boosts negative emotions
        neg_boost = abs(sentiment_score) * 0.2
        if raw_scores["sadness"] >= raw_scores["anger"]:
            raw_scores["sadness"] += neg_boost
        else:
            raw_scores["anger"] += neg_boost
        if raw_scores.get("stress", 0) > 0:
            raw_scores["stress"] += neg_boost * 0.5

    # Calculate total for normalization
    total = sum(raw_scores.values())

    if total == 0:
        # No emotion keywords found — classify as neutral
        emotions = {
            "stress": 0.0,
            "sadness": 0.0,
            "joy": 0.0,
            "anger": 0.0,
            "neutral": 1.0,
        }
        return emotions, "neutral"

    # Normalize scores to 0-1 range
    emotions = {}
    for emotion in ["stress", "sadness", "joy", "anger"]:
        emotions[emotion] = round(raw_scores.get(emotion, 0) / (total + 0.5), 4)

    # Neutral fills the remaining probability
    emotion_sum = sum(emotions.values())
    emotions["neutral"] = round(max(0, 1.0 - emotion_sum), 4)

    # Determine dominant emotion
    dominant = max(emotions, key=emotions.get)

    return emotions, dominant
