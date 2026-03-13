# MindMirror — Firestore Database Schema

## Collections Overview

```
users/{userId}
├── reflections/{reflectionId}    (subcollection)
└── drift_analysis/{analysisId}   (subcollection)

prompts/{promptId}                (top-level)
```

---

## `users/{userId}`

| Field               | Type      | Description                              |
|---------------------|-----------|------------------------------------------|
| `email`             | string    | User's email address                     |
| `displayName`       | string    | User's display name                      |
| `createdAt`         | timestamp | Account creation date                    |
| `baselineScore`     | number    | Avg sentiment of first 7 reflections     |
| `baselineCalculated`| boolean   | Whether baseline has been established    |
| `totalReflections`  | number    | Count of all reflections submitted       |

---

## `users/{userId}/reflections/{reflectionId}`

| Field            | Type      | Description                              |
|------------------|-----------|------------------------------------------|
| `text`           | string    | User's daily reflection text             |
| `sentimentScore` | number    | VADER compound score (-1 to +1)          |
| `emotions`       | map       | `{ stress, sadness, joy, anger, neutral }`|
| `dominantEmotion`| string    | Highest scoring emotion category         |
| `createdAt`      | timestamp | When the reflection was submitted        |
| `promptUsed`     | string    | Which prompt was shown (nullable)        |

---

## `users/{userId}/drift_analysis/{analysisId}`

| Field            | Type      | Description                              |
|------------------|-----------|------------------------------------------|
| `baselineScore`  | number    | Baseline at time of analysis             |
| `recentAverage`  | number    | Average of last 7 scores                 |
| `driftScore`     | number    | `recent_average - baseline`              |
| `driftDirection` | string    | `"positive"` \| `"negative"` \| `"stable"` |
| `insight`        | string    | AI-generated insight text                |
| `period`         | map       | `{ start: timestamp, end: timestamp }`   |
| `createdAt`      | timestamp | When the analysis was generated          |

---

## `prompts/{promptId}`

| Field      | Type    | Description                                |
|------------|---------|--------------------------------------------|
| `text`     | string  | Prompt text, e.g. "What gave you joy?"     |
| `category` | string  | `"stress"` \| `"joy"` \| `"energy"` \| `"general"` |
| `isActive` | boolean | Whether the prompt is in rotation           |
