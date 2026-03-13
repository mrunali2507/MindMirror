"""
Sentiment Analysis Module
Uses VADER (Valence Aware Dictionary and sEntiment Reasoner) for sentiment analysis.
Returns a compound score between -1 (most negative) and +1 (most positive).
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize the VADER analyzer (singleton)
_analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> float:
    """
    Analyze sentiment of the given text.

    Args:
        text: The text to analyze.

    Returns:
        Compound sentiment score between -1.0 and +1.0.
        - Positive values indicate positive sentiment
        - Negative values indicate negative sentiment
        - Values near 0 indicate neutral sentiment
    """
    if not text or not text.strip():
        return 0.0

    scores = _analyzer.polarity_scores(text)
    return round(scores["compound"], 4)


def get_sentiment_breakdown(text: str) -> dict:
    """
    Get full VADER sentiment breakdown.

    Returns:
        Dictionary with 'neg', 'neu', 'pos', and 'compound' scores.
    """
    if not text or not text.strip():
        return {"neg": 0.0, "neu": 1.0, "pos": 0.0, "compound": 0.0}

    return _analyzer.polarity_scores(text)
