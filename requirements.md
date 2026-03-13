# 🪞 MindMirror — Requirements Document

## 1. Project Description

MindMirror is an AI-powered emotional awareness platform that tracks subtle mood changes over time. It analyzes daily user reflections to detect emotional drift and presents insights through visualization and prompts, helping users recognize patterns in their feelings and improve mental well-being.

---

## 2. Functional Requirements

### 2.1 User Authentication

| ID | Requirement | Status |
|----|-------------|--------|
| FR-01 | Users must be able to register with email, password, and display name | ✅ Implemented |
| FR-02 | Users must be able to sign in with email and password | ✅ Implemented |
| FR-03 | Users must be able to sign out with confirmation prompt | ✅ Implemented |
| FR-04 | Auth state must persist across app sessions | ✅ Implemented |
| FR-05 | A Firestore user profile document must be created upon registration | ✅ Implemented |

### 2.2 Daily Reflections

| ID | Requirement | Status |
|----|-------------|--------|
| FR-06 | Users must be able to write a daily reflection text (10–2000 characters) | ✅ Implemented |
| FR-07 | A random reflection prompt must be displayed to guide the user | ✅ Implemented |
| FR-08 | Users must be able to refresh to get a new random prompt | ✅ Implemented |
| FR-09 | Fallback prompts must be available when Firestore prompts collection is empty | ✅ Implemented |
| FR-10 | Empty or too-short reflections must be rejected with an alert | ✅ Implemented |

### 2.3 NLP Analysis

| ID | Requirement | Status |
|----|-------------|--------|
| FR-11 | Reflection text must be analyzed for sentiment score (-1 to +1) using VADER | ✅ Implemented |
| FR-12 | Reflection text must be classified into emotion categories: joy, sadness, anger, stress, neutral | ✅ Implemented |
| FR-13 | A dominant emotion must be identified for each reflection | ✅ Implemented |
| FR-14 | Sentiment and emotion results must be saved alongside the reflection in Firestore | ✅ Implemented |
| FR-15 | If the NLP service is unavailable, the app must fallback to neutral analysis | ✅ Implemented |

### 2.4 Emotional Baseline

| ID | Requirement | Status |
|----|-------------|--------|
| FR-16 | The emotional baseline must be calculated as the average of the first 7 sentiment scores | ✅ Implemented |
| FR-17 | The baseline must be stored in the user's profile document | ✅ Implemented |
| FR-18 | Baseline calculation must trigger automatically after the 7th reflection | ✅ Implemented |

### 2.5 Emotional Drift Detection

| ID | Requirement | Status |
|----|-------------|--------|
| FR-19 | Drift must be calculated after the user has at least 14 reflections | ✅ Implemented |
| FR-20 | Drift score = recent 7-entry average - baseline | ✅ Implemented |
| FR-21 | Drift must be classified: > +0.1 = positive, < -0.1 = negative, else = stable | ✅ Implemented |
| FR-22 | A human-readable insight must be generated based on drift direction and magnitude | ✅ Implemented |
| FR-23 | Drift analysis must be saved to Firestore subcollection | ✅ Implemented |
| FR-24 | If the NLP drift endpoint is unavailable, local JS calculation must be used as fallback | ✅ Implemented |

### 2.6 Dashboard & Visualization

| ID | Requirement | Status |
|----|-------------|--------|
| FR-25 | Dashboard must display total reflections, baseline score, and current drift | ✅ Implemented |
| FR-26 | A sentiment trend line chart must show the last 14 reflections | ✅ Implemented |
| FR-27 | Drift indicator must show score, direction (↑/→/↓), and insight text | ✅ Implemented |
| FR-28 | Emotion distribution bar chart must show percentages across 5 categories | ✅ Implemented |
| FR-29 | Last 5 recent reflections must be visible with sentiment badges | ✅ Implemented |
| FR-30 | Dashboard must support pull-to-refresh | ✅ Implemented |
| FR-31 | Empty state must be shown when no reflections exist | ✅ Implemented |

### 2.7 Profile

| ID | Requirement | Status |
|----|-------------|--------|
| FR-32 | Profile must display user name, email, and join date | ✅ Implemented |
| FR-33 | Profile must show statistics: total reflections, baseline, drift | ✅ Implemented |
| FR-34 | Profile must show the latest emotional insight if drift data exists | ✅ Implemented |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-01 | NLP analysis response time must be under 2 seconds |
| NFR-02 | App must remain responsive during API calls (loading indicators) |
| NFR-03 | Firestore queries must be limited/paginated (max 30–50 per query) |

### 3.2 Reliability

| ID | Requirement |
|----|-------------|
| NFR-04 | The app must gracefully handle NLP service downtime (fallback to neutral/local) |
| NFR-05 | All network errors must be caught and displayed as user-friendly alerts |
| NFR-06 | Firebase operations must handle non-existent documents gracefully |

### 3.3 Security

| ID | Requirement |
|----|-------------|
| NFR-07 | Users must only be able to access their own data (Firestore security rules) |
| NFR-08 | Prompts collection must be read-only for clients |
| NFR-09 | Firebase Auth must be required for all data access |
| NFR-10 | NLP service must use CORS middleware for cross-origin requests |

### 3.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-11 | The app must use a dark-themed UI with premium aesthetics |
| NFR-12 | Navigation must use a bottom tab bar with clear labels and icons |
| NFR-13 | All interactive elements must have loading states and disabled states |
| NFR-14 | Sentiment colors must be intuitive (green = positive, red = negative) |

### 3.5 Scalability

| ID | Requirement |
|----|-------------|
| NFR-15 | NLP service must be decoupled and deployable independently |
| NFR-16 | Emotion keyword dictionaries must be extensible without code changes |
| NFR-17 | Prompts must be admin-managed via Firestore without app updates |

---

## 4. Technical Requirements

### 4.1 Mobile App

| Requirement | Specification |
|-------------|--------------|
| Framework | React Native 0.83.x with Expo 55.x |
| Min Node.js | 18+ |
| Navigation | React Navigation 7.x (native stack + bottom tabs) |
| Charts | react-native-chart-kit 6.x + react-native-svg |
| Firebase SDK | 12.10.x (modular API) |
| Platform support | Android, iOS, Web (via Expo) |

### 4.2 NLP Service

| Requirement | Specification |
|-------------|--------------|
| Language | Python 3.9+ |
| Framework | FastAPI |
| Sentiment Engine | VADER (vaderSentiment) |
| Data Validation | Pydantic |
| CORS | Enabled for all origins (development) |
| Server | Uvicorn with hot-reload |

### 4.3 Firebase

| Requirement | Specification |
|-------------|--------------|
| Authentication | Email/password provider |
| Database | Cloud Firestore |
| Security Rules | User-scoped read/write, prompts read-only |

---

## 5. Data Requirements

### 5.1 Input Data

| Data | Format | Constraints |
|------|--------|-------------|
| User email | String | Valid email format |
| User password | String | Firebase defaults (min 6 chars) |
| Display name | String | Required at registration |
| Reflection text | String | Min 10 chars, max 2000 chars |

### 5.2 Processed Data

| Data | Format | Range |
|------|--------|-------|
| Sentiment score | Float | -1.0 to +1.0 |
| Emotion scores | Map of floats | 0.0 to 1.0 (sum ≈ 1.0) |
| Dominant emotion | String | joy, sadness, anger, stress, neutral |
| Baseline score | Float | -1.0 to +1.0 |
| Drift score | Float | -2.0 to +2.0 |
| Drift direction | String | positive, negative, stable |

---

## 6. Constraints & Assumptions

- The NLP service runs locally during development on port 8000
- Android emulator connects to NLP via `10.0.2.2:8000`; iOS/Web use `localhost:8000`
- Physical device testing requires updating `NLP_BASE_URL` to the host machine's IP
- Firebase project must be manually created and configured before running the app
- Reflection prompts are optionally seeded via Firebase Console
- VADER sentiment is English-only
- The drift algorithm requires a minimum of 7 reflections for baseline and 14 for drift analysis
