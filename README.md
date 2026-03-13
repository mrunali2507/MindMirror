# 🪞 MindMirror

**MindMirror** is an AI-powered emotional awareness platform that tracks subtle mood changes over time. It analyzes user inputs to detect emotional drift and presents insights through reflection prompts, helping users recognize patterns in their feelings and improve mental well-being.

---

## ✨ Features

- **User Authentication** — Email/password login via Firebase Auth
- **Daily Reflections** — Write daily reflections about how you feel
- **NLP Emotion Analysis** — VADER-based sentiment scoring (-1 to +1) with emotion detection (joy, sadness, anger, stress, neutral)
- **Emotional Baseline** — Auto-calculated from your first 7 entries
- **Emotional Drift Detection** — Tracks how your mood shifts from your baseline over time
- **Reflection Prompts** — Random prompts to guide your daily reflection
- **Dark-themed UI** — Premium, modern design with glassmorphism and micro-animations

---

## 🏗️ Architecture

```
MindMirror/
├── mobile/              → React Native (Expo) app
├── nlp-service/         → Python FastAPI NLP microservice
├── firebase/            → Firestore rules & schema docs
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Expo CLI**: `npm install -g expo-cli`
- **Firebase project** (see setup below)
- **Expo Go** app on your phone (for mobile testing)

---

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called `MindMirror`
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Cloud Firestore** → Create database → Start in **test mode**
5. Go to **Project Settings** → **General** → **Your apps** → Add **Web** app
6. Copy the Firebase config object

#### Update Firebase Config

Open `mobile/src/config/firebase.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_ACTUAL_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};
```

#### Seed Reflection Prompts (Optional)

In the Firebase Console → Firestore → create a `prompts` collection and add documents like:

```
{ text: "What made you feel stressed today?", category: "stress", isActive: true }
{ text: "What gave you energy today?", category: "energy", isActive: true }
{ text: "What is one thing you're grateful for?", category: "general", isActive: true }
{ text: "What moment brought you joy today?", category: "joy", isActive: true }
{ text: "What challenged you today?", category: "general", isActive: true }
{ text: "What would you like to let go of?", category: "stress", isActive: true }
{ text: "Describe your mood in one word and explain why.", category: "general", isActive: true }
{ text: "How did you handle stress today?", category: "stress", isActive: true }
```

#### Deploy Security Rules

Copy the rules from `firebase/firestore.rules` to your Firebase Console → Firestore → Rules tab.

---

### 2. Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go or press `w` for web preview.

---

### 3. Python NLP Service Setup

```bash
cd nlp-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The NLP service will be available at `http://localhost:8000`.

#### Test the NLP Service

```bash
# Health check
curl http://localhost:8000/health

# Analyze text
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"I feel really happy and grateful today!\"}"

# Run automated tests
pip install pytest
python -m pytest test_nlp.py -v
```

---

### 4. Connecting Mobile to NLP Service

The mobile app connects to the NLP service via HTTP. The default URL is configured in `mobile/src/services/nlpService.js`:

| Platform           | URL                          |
|--------------------|------------------------------|
| Android Emulator   | `http://10.0.2.2:8000`       |
| iOS Simulator      | `http://localhost:8000`       |
| Physical Device    | `http://<YOUR_IP>:8000`       |
| Web                | `http://localhost:8000`       |

Update the `NLP_BASE_URL` constant as needed.

> **Note:** If the NLP service is unreachable, the app gracefully falls back to neutral analysis and local drift calculation.

---

## 📊 Firestore Schema

See [`firebase/firestore-schema.md`](firebase/firestore-schema.md) for the complete database schema documentation.

---

## 🧠 How Drift Detection Works

1. **Baseline**: Average sentiment of your first 7 reflections
2. **Recent Average**: Average sentiment of your last 7 reflections
3. **Drift Score**: `recent_average - baseline`
4. **Direction**:
   - Drift > +0.1 → **Positive** (mood improving)
   - Drift < -0.1 → **Negative** (mood declining)
   - Otherwise → **Stable**

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React Native (Expo)                 |
| Backend     | Firebase (Auth + Firestore)         |
| NLP Service | Python, FastAPI, VADER Sentiment    |
| Database    | Cloud Firestore                     |
| Charts      | react-native-chart-kit              |

---

## 📁 Project Structure

```
mobile/
├── App.js                          # Entry point with auth listener
├── src/
│   ├── config/firebase.js          # Firebase initialization
│   ├── navigation/AppNavigator.js  # Auth + Tab navigation
│   ├── screens/
│   │   ├── LoginScreen.js          # Email/password login
│   │   ├── RegisterScreen.js       # New user registration
│   │   ├── ReflectionScreen.js     # Daily reflection + analysis
│   │   └── ProfileScreen.js        # Profile, stats, sign-out
│   ├── services/
│   │   ├── authService.js          # Firebase Auth helpers
│   │   ├── firestoreService.js     # Firestore CRUD operations
│   │   └── nlpService.js           # NLP API client
│   ├── components/
│   │   ├── EmotionChart.js         # Sentiment trend chart
│   │   ├── DriftIndicator.js       # Drift score display
│   │   └── PromptCard.js           # Reflection prompt card
│   └── utils/helpers.js            # Colors, formatters, constants

nlp-service/
├── app.py                          # FastAPI server
├── sentiment.py                    # VADER sentiment analysis
├── emotion.py                      # Emotion classification
├── drift.py                        # Drift detection algorithm
├── test_nlp.py                     # Automated tests
└── requirements.txt                # Python dependencies
```

---

## 📄 License

This project is for educational and personal use.
