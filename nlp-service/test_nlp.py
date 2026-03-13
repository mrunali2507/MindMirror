"""
Tests for the MindMirror NLP Service.
Run with: python -m pytest test_nlp.py -v
"""

from sentiment import analyze_sentiment, get_sentiment_breakdown
from emotion import detect_emotions
from drift import compute_drift, compute_baseline


class TestSentimentAnalysis:
    def test_positive_text(self):
        score = analyze_sentiment("I feel amazing and so happy today!")
        assert score > 0.3, f"Expected strongly positive, got {score}"

    def test_negative_text(self):
        score = analyze_sentiment("I feel terrible and everything is awful.")
        assert score < -0.3, f"Expected strongly negative, got {score}"

    def test_neutral_text(self):
        score = analyze_sentiment("I went to the store and bought groceries.")
        assert -0.3 <= score <= 0.3, f"Expected neutral, got {score}"

    def test_empty_text(self):
        score = analyze_sentiment("")
        assert score == 0.0

    def test_score_range(self):
        texts = [
            "I love everything about today!",
            "I hate this so much.",
            "The weather is okay.",
        ]
        for text in texts:
            score = analyze_sentiment(text)
            assert -1 <= score <= 1, f"Score {score} out of range for: {text}"

    def test_breakdown(self):
        breakdown = get_sentiment_breakdown("I feel great!")
        assert "compound" in breakdown
        assert "pos" in breakdown
        assert "neg" in breakdown
        assert "neu" in breakdown


class TestEmotionDetection:
    def test_joy_detection(self):
        emotions, dominant = detect_emotions("I am so happy and excited today!", 0.8)
        assert dominant == "joy" or emotions["joy"] > 0, f"Expected joy, got {dominant}"

    def test_sadness_detection(self):
        emotions, dominant = detect_emotions("I feel sad and lonely today.", -0.7)
        assert emotions["sadness"] > 0, f"Expected sadness score > 0"

    def test_anger_detection(self):
        emotions, dominant = detect_emotions("I am furious and angry at everything.", -0.8)
        assert emotions["anger"] > 0, f"Expected anger score > 0"

    def test_stress_detection(self):
        emotions, dominant = detect_emotions(
            "I am stressed and overwhelmed with work pressure.", -0.5
        )
        assert emotions["stress"] > 0, f"Expected stress score > 0"

    def test_neutral_fallback(self):
        emotions, dominant = detect_emotions("The sky is blue.", 0.0)
        assert dominant == "neutral", f"Expected neutral, got {dominant}"

    def test_empty_text(self):
        emotions, dominant = detect_emotions("", 0.0)
        assert dominant == "neutral"
        assert emotions["neutral"] == 1.0

    def test_all_emotions_present(self):
        emotions, _ = detect_emotions("I feel happy", 0.5)
        for key in ["stress", "sadness", "joy", "anger", "neutral"]:
            assert key in emotions, f"Missing emotion: {key}"

    def test_scores_sum_to_one(self):
        emotions, _ = detect_emotions("I feel worried and stressed about exams.", -0.4)
        total = sum(emotions.values())
        assert 0.95 <= total <= 1.05, f"Emotions don't approximately sum to 1: {total}"


class TestDriftDetection:
    def test_positive_drift(self):
        scores = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5]
        baseline = 0.1
        result = compute_drift(scores, baseline)
        assert result["drift_direction"] == "positive"
        assert result["drift_score"] > 0.1

    def test_negative_drift(self):
        scores = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.3, -0.4, -0.5, -0.3, -0.4, -0.2, -0.3]
        baseline = 0.5
        result = compute_drift(scores, baseline)
        assert result["drift_direction"] == "negative"
        assert result["drift_score"] < -0.1

    def test_stable_drift(self):
        scores = [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.35, 0.25, 0.3, 0.28, 0.32, 0.3, 0.31]
        baseline = 0.3
        result = compute_drift(scores, baseline)
        assert result["drift_direction"] == "stable"

    def test_empty_scores(self):
        result = compute_drift([], 0.5)
        assert result["drift_direction"] == "stable"

    def test_insight_generated(self):
        scores = [0.1] * 7 + [0.8] * 7
        result = compute_drift(scores, 0.1)
        assert len(result["insight"]) > 0

    def test_baseline_calculation(self):
        scores = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
        baseline = compute_baseline(scores, 7)
        expected = round(sum(scores[:7]) / 7, 4)
        assert baseline == expected

    def test_baseline_insufficient_data(self):
        scores = [0.1, 0.2, 0.3]
        baseline = compute_baseline(scores, 7)
        assert baseline == 0.0
