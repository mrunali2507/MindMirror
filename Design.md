# 🪞 MindMirror — Design Document

## 1. Project Overview

**MindMirror** is an AI-powered emotional awareness platform that helps users track subtle mood changes over time. Users write daily reflections which are analyzed for sentiment and emotion using NLP, with the system detecting **emotional drift** — how a user's mood shifts from their personal baseline over time.

**Tagline:** _Reflect. Understand. Grow._

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Native (Expo) Mobile App               │  │
│  │  ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌────────┐  │  │
│  │  │  Login   │ │ Reflect   │ │Dashboard│ │Profile │  │  │
│  │  │  Screen  │ │  Screen   │ │ Screen  │ │ Screen │  │  │
│  │  └──────────┘ └─────┬─────┘ └────┬────┘ └───┬────┘  │  │
│  │                     │            │           │       │  │
│  │  ┌──────────────────┴────────────┴───────────┘       │  │
│  │  │              SERVICE LAYER                        │  │
│  │  │  authService · firestoreService · nlpService      │  │
│  │  └──────────┬──────────────────────┬─────────────    │  │
│  └─────────────┼──────────────────────┼─────────────────┘  │
│                │                      │                    │
└────────────────┼──────────────────────┼────────────────────┘
                 │                      │
    ┌────────────▼──────────┐  ┌───────▼──────────────┐
    │   FIREBASE BACKEND    │  │  NLP MICROSERVICE     │
    │  ┌─────────────────┐  │  │  ┌────────────────┐   │
    │  │  Firebase Auth   │  │  │  │  FastAPI        │  │
    │  │  (Email/Pass)    │  │  │  │  /analyze       │  │
    │  ├─────────────────┤  │  │  │  /drift          │  │
    │  │  Cloud Firestore │  │  │  │  /health         │  │
    │  │  • users         │  │  │  ├────────────────┤  │
    │  │  • reflections   │  │  │  │  VADER          │  │
    │  │  • drift_analysis│  │  │  │  Sentiment      │  │
    │  │  • prompts       │  │  │  │  Analyzer       │  │
    │  └─────────────────┘  │  │  └────────────────┘   │
    └───────────────────────┘  └───────────────────────┘
```

### Architecture Pattern: **3-Tier Microservice**

| Tier | Technology | Responsibility |
|------|-----------|----------------|
| **Frontend** | React Native (Expo) | UI, navigation, state management |
| **Backend** | Firebase (Auth + Firestore) | Authentication, data persistence, security rules |
| **NLP Service** | Python FastAPI + VADER | Sentiment analysis, emotion classification, drift computation |

---

## 3. Module Design

### 3.1 Mobile App (`mobile/`)

#### Navigation Flow

```
App.js
 └── AppNavigator
      ├── AuthStack (unauthenticated)
      │    ├── LoginScreen
      │    └── RegisterScreen
      └── MainTabs (authenticated)
           ├── ReflectionScreen (✍️ Reflect)
           ├── DashboardScreen (📊 Dashboard)
           └── ProfileScreen   (👤 Profile)
```

#### Screens

| Screen | Purpose | Key Interactions |
|--------|---------|-----------------|
| **LoginScreen** | Email/password authentication | Sign in → auth state triggers navigation |
| **RegisterScreen** | New user signup + Firestore profile creation | Creates user document with initial baseline fields |
| **ReflectionScreen** | Daily reflection entry with NLP analysis | Shows prompt → user writes → calls `/analyze` → saves to Firestore → updates baseline/drift |
| **DashboardScreen** | Visualize emotional insights | Sentiment trend chart, drift indicator, emotion distribution bars, recent reflections |
| **ProfileScreen** | User info, stats, sign-out | Shows total reflections, baseline score, drift status, and emotional insight |

#### Components

| Component | Purpose |
|-----------|---------|
| **EmotionChart** | Line chart (react-native-chart-kit) showing sentiment trend over last 14 reflections |
| **DriftIndicator** | Displays drift score, direction badge (↑ Improving / → Stable / ↓ Declining), and insight text |
| **PromptCard** | Shows a random reflection prompt with refresh capability |

#### Services

| Service | Functions |
|---------|-----------|
| **authService** | `register()`, `login()`, `logout()`, `getCurrentUser()`, `onAuthChange()` |
| **firestoreService** | `saveReflection()`, `getReflections()`, `getUserProfile()`, `updateBaseline()`, `saveDriftAnalysis()`, `getLatestDrift()`, `getRandomPrompt()` |
| **nlpService** | `analyzeText()` → calls `/analyze`, `calculateDrift()` → calls `/drift` (with local fallback) |

---

### 3.2 NLP Service (`nlp-service/`)

#### API Endpoints

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/analyze` | `{ text: string }` | `{ sentimentScore, emotions, dominantEmotion }` |
| POST | `/drift` | `{ scores: float[], baseline: float }` | `{ driftScore, recentAverage, driftDirection, insight }` |
| GET | `/health` | — | `{ status: "ok" }` |

#### Processing Pipeline

```
User Text
    │
    ▼
┌──────────────────────┐
│  sentiment.py        │
│  VADER Compound      │    sentimentScore
│  Score (-1 to +1)    │──────────┐
└──────────────────────┘          │
    │                              │
    ▼                              ▼
┌──────────────────────┐    ┌──────────────────┐
│  emotion.py          │    │  Response:       │
│  Keyword Matching    │    │  sentimentScore  │
│  + Sentiment Boost   │────│  emotions{}      │
│  → 5 categories      │    │  dominantEmotion │
└──────────────────────┘    └──────────────────┘
```

#### Emotion Classification Algorithm

1. **Tokenize** text into words using regex
2. **Match** words against 4 keyword dictionaries: `joy`, `sadness`, `anger`, `stress` (~25-30 keywords each)
3. **Boost** scores using VADER sentiment polarity:
   - Positive sentiment (> 0.3) → boosts `joy`
   - Negative sentiment (< -0.3) → boosts `sadness` or `anger` (whichever is higher)
4. **Normalize** to 0–1 scores, with `neutral` filling the remainder
5. **Dominant emotion** = highest scoring category

#### Drift Detection Algorithm

```
baseline = average(first 7 sentiment scores)
recent_average = average(last 7 sentiment scores)
drift_score = recent_average - baseline

if drift_score >  0.1 → "positive" (mood improving)
if drift_score < -0.1 → "negative" (mood declining)
else                   → "stable"
```

Insights are generated based on drift direction and magnitude (> 0.3 = significant, ≤ 0.3 = mild).

---

### 3.3 Firebase (`firebase/`)

#### Data Model

```
users/{userId}
│   ├── email: string
│   ├── displayName: string
│   ├── createdAt: timestamp
│   ├── baselineScore: number
│   ├── baselineCalculated: boolean
│   └── totalReflections: number
│
├── reflections/{reflectionId}          ← subcollection
│       ├── text: string
│       ├── sentimentScore: number
│       ├── emotions: map {stress, sadness, joy, anger, neutral}
│       ├── dominantEmotion: string
│       ├── createdAt: timestamp
│       └── promptUsed: string
│
└── drift_analysis/{analysisId}         ← subcollection
        ├── baselineScore: number
        ├── recentAverage: number
        ├── driftScore: number
        ├── driftDirection: string
        ├── insight: string
        ├── period: map {start, end}
        └── createdAt: timestamp

prompts/{promptId}                      ← top-level collection
    ├── text: string
    ├── category: string
    └── isActive: boolean
```

#### Security Rules

- **Users**: Read/write own profile only (`auth.uid == userId`)
- **Reflections & Drift**: Scoped to owning user
- **Prompts**: Read-only for authenticated users; admin-only writes

---

## 4. UI/UX Design

### Design Language

| Aspect | Choice |
|--------|--------|
| **Theme** | Dark mode with deep navy/indigo palette |
| **Style** | Glassmorphism-inspired card surfaces |
| **Typography** | System fonts with bold headings (700 weight) |
| **Animations** | Micro-animations on buttons and loading states |
| **Navigation** | Bottom tab bar with emoji icons |

### Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#6C63FF` | Main accent, buttons, chart lines |
| `background` | `#0F0E17` | App background |
| `surface` | `#1A1A2E` | Card backgrounds |
| `surfaceLight` | `#232340` | Borders, secondary surfaces |
| `text` | `#FFFFFE` | Primary text |
| `textSecondary` | `#A7A7BE` | Muted text, labels |
| `success` | `#2CB67D` | Positive sentiment, improving drift |
| `warning` | `#FF8906` | Neutral-negative, stress indicators |
| `error` | `#E53170` | Negative sentiment, declining drift |

### Sentiment Color Mapping

| Score Range | Color | Meaning |
|-------------|-------|---------|
| ≥ +0.5 | 🟢 `#4CAF50` | Strong positive |
| +0.1 to +0.5 | 🟢 `#8BC34A` | Mild positive |
| -0.1 to +0.1 | ⚪ `#9E9E9E` | Neutral |
| -0.5 to -0.1 | 🟠 `#FF9800` | Mild negative |
| ≤ -0.5 | 🔴 `#F44336` | Strong negative |

---

## 5. Data Flow

### Core User Flow: Writing a Reflection

```
1. User opens Reflect tab
2. Random prompt fetched from Firestore (prompts collection)
3. User writes reflection text (10–2000 chars)
4. User taps "Save & Analyze ✨"
5. Mobile sends text to NLP service POST /analyze
6. NLP returns: sentimentScore, emotions, dominantEmotion
7. Reflection saved to Firestore (users/{uid}/reflections)
8. totalReflections counter incremented
9. If ≥ 7 reflections → baseline calculated from first 7 scores
10. If ≥ 14 reflections → drift calculated via POST /drift
11. Result displayed: sentiment score + dominant emotion card
```

### Graceful Degradation

When the NLP microservice is unreachable:
- **Sentiment analysis** falls back to neutral (`score: 0, emotion: neutral`)
- **Drift calculation** falls back to local JS computation using the same algorithm

---

## 6. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile Runtime | React Native | 0.83.2 |
| Build Platform | Expo | 55.x |
| Navigation | React Navigation | 7.x |
| Charts | react-native-chart-kit | 6.12.0 |
| Auth & DB | Firebase SDK | 12.10.0 |
| NLP Server | Python FastAPI | latest |
| Sentiment Engine | VADER Sentiment | latest |
| API Validation | Pydantic | latest |

---

## 7. Project Structure

```
MindMirror/
├── mobile/
│   ├── App.js                              # Entry point, auth listener
│   ├── index.js                            # App registry
│   ├── package.json                        # Dependencies
│   └── src/
│       ├── config/firebase.js              # Firebase initialization
│       ├── navigation/AppNavigator.js      # Auth + Tab navigation
│       ├── screens/
│       │   ├── LoginScreen.js              # Email/password login
│       │   ├── RegisterScreen.js           # User registration
│       │   ├── ReflectionScreen.js         # Daily reflection + NLP analysis
│       │   ├── DashboardScreen.js          # Insights & visualizations
│       │   └── ProfileScreen.js            # User profile & stats
│       ├── services/
│       │   ├── authService.js              # Firebase Auth helpers
│       │   ├── firestoreService.js         # Firestore CRUD operations
│       │   └── nlpService.js               # NLP API client + fallback
│       ├── components/
│       │   ├── EmotionChart.js             # Sentiment trend line chart
│       │   ├── DriftIndicator.js           # Drift score & direction UI
│       │   └── PromptCard.js               # Reflection prompt card
│       └── utils/helpers.js                # Colors, formatters, constants
│
├── nlp-service/
│   ├── app.py                              # FastAPI server + endpoints
│   ├── sentiment.py                        # VADER sentiment analysis
│   ├── emotion.py                          # Keyword-based emotion detection
│   ├── drift.py                            # Emotional drift algorithm
│   ├── test_nlp.py                         # Automated test suite
│   └── requirements.txt                    # Python dependencies
│
├── firebase/
│   ├── firestore-schema.md                 # Database schema docs
│   └── firestore.rules                     # Firestore security rules
│
└── README.md                               # Setup & usage guide
```
