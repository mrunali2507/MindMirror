from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sentiment import analyze_sentiment
from emotion import detect_emotions
from drift import compute_drift

app = FastAPI(
    title="MindMirror NLP Service",
    description="Sentiment analysis and emotional drift detection for MindMirror",
    version="1.0.0",
)

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    sentimentScore: float
    emotions: dict
    dominantEmotion: str


class DriftRequest(BaseModel):
    scores: List[float]
    baseline: float


class DriftResponse(BaseModel):
    driftScore: float
    recentAverage: float
    driftDirection: str
    insight: str


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze text for sentiment score and emotion categories.
    Returns sentiment score (-1 to +1) and emotion breakdown.
    """
    sentiment_score = analyze_sentiment(request.text)
    emotions, dominant = detect_emotions(request.text, sentiment_score)

    return AnalyzeResponse(
        sentimentScore=sentiment_score,
        emotions=emotions,
        dominantEmotion=dominant,
    )


@app.post("/drift", response_model=DriftResponse)
async def drift(request: DriftRequest):
    """
    Calculate emotional drift between baseline and recent sentiment scores.
    """
    result = compute_drift(request.scores, request.baseline)

    return DriftResponse(
        driftScore=result["drift_score"],
        recentAverage=result["recent_average"],
        driftDirection=result["drift_direction"],
        insight=result["insight"],
    )


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "MindMirror NLP"}
