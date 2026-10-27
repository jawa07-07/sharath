# 👾 MonsterMentor AI

> **Your Potential. Unleashed.**  
> A premium, futuristic monster-themed AI learning mentor powered by Google Gemini, React 19, TypeScript, Express, and Tailwind CSS.

---

## 🌟 Key Features

- **⚡ Volt the Cyber-Monster Mascot**: Interactive, expressive animated SVG mascot with dynamic emotional states (`idle`, `thinking`, `talking`, `happy`).
- **🧠 5 Specialized Mentor Personas**:
  - **Volt (Companion)**: High-energy, warm analogies, encouraging.
  - **Master Teacher**: Socratic, pedagogical step-by-step breakdown.
  - **Senior Coding Expert**: Clean code, architecture, edge cases, debugging.
  - **Creative Coach**: Lateral thinking, inventive brainstorming.
  - **Career Strategist**: High-impact interview preparation, portfolio tips.
- **💬 Real-Time Streaming Chat**: Live Server-Sent Events (SSE) token streaming via Google GenAI SDK.
- **📚 Interactive Learning Center**:
  - Generate customized multi-week roadmaps with hands-on exercises.
  - Interactive on-demand lessons with analogies and mini-challenges.
  - Real-time diagnostic quizzes with automated grading and explanations.
- **📊 Real Analytics & Daily Focus Tracker**: Actual stats derived from your sessions, plus a daily study timer (15m, 30m, 45m, 60m).
- **🔒 Flexible Storage & Security**:
  - **Guest Mode**: 100% functional out of the box using local browser storage (no login required).
  - **Firebase Cloud Sync (Optional)**: Google Authentication & Cloud Firestore with hardened user-isolation rules.
  - **Data Export & Privacy**: One-click complete JSON backup export and local data purge.

---

## 🚀 Quickstart: Running in VS Code

### 1. Prerequisites

Ensure you have **Node.js 18+ or 20+** installed:
```bash
node -v
npm -v
```
*(If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/)).*

---

### 2. Open in VS Code

1. Download or clone this project folder to your computer.
2. Open **VS Code**.
3. Select **File > Open Folder...** and choose this project directory.
4. Open the integrated terminal in VS Code:
   - Shortcut: ``Ctrl + ` `` (Windows/Linux) or ``Cmd + ` `` (Mac).

---

### 3. Install Dependencies

In the VS Code terminal, run:

```bash
npm install
```

---

### 4. Configure Environment Variables

Create your local `.env` file:

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env
```

Open `.env` in VS Code and set your **Gemini API Key**:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=3000
```

> 🔑 **Need a Gemini API key?**  
> Get a free key at [Google AI Studio (aistudio.google.com/app/apikey)](https://aistudio.google.com/app/apikey).

---

### 5. Start the Development Server

Run:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

You are now running **MonsterMentor AI** locally! 🎉

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts full-stack Express server with Vite middleware on `http://localhost:3000` |
| `npm run build` | Compiles production bundle into the `/dist` directory |
| `npm run start` | Runs the compiled production server (`NODE_ENV=production tsx server.ts`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cleans the `/dist` build output |

---

## 🐙 How to Publish to GitHub

Follow these steps to upload this project to your GitHub account:

### Step 1: Initialize Git in your project folder

In your VS Code terminal:

```bash
git init
```

### Step 2: Stage and commit all files

```bash
git add .
git commit -m "Initial commit: MonsterMentor AI full-stack application"
```

*(Note: `.gitignore` is already configured to keep your `.env` secret file and `node_modules` private).*

### Step 3: Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new).
2. Enter a repository name (e.g. `monster-mentor-ai`).
3. Choose **Public** or **Private**.
4. **Leave "Initialize this repository with a README" UNCHECKED** (since you already have this repo).
5. Click **Create repository**.

### Step 4: Link your local project to GitHub and push

Copy the commands shown on your new GitHub repo page, or run:

```bash
# Replace YOUR_USERNAME with your GitHub username:
git remote add origin https://github.com/YOUR_USERNAME/monster-mentor-ai.git

# Set default branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

Your code is now published live on GitHub! 🚀

---

## 🛠️ Project Structure

```text
├── index.html                  # HTML entry point with fonts & metadata
├── metadata.json               # App manifest & server capabilities
├── package.json                # Dependencies & startup scripts
├── server.ts                   # Express backend (Gemini chat streaming & API routes)
├── tsconfig.json               # TypeScript compiler config
├── vite.config.ts              # Vite frontend bundler config
├── firebase-blueprint.json     # Intermediate Firestore schema blueprint
├── firestore.rules             # Hardened security rules for user-scoped data
├── .env.example                # Sample environment configuration template
└── src/
    ├── main.tsx                # React DOM root mounting
    ├── App.tsx                 # Main application coordinator & route switching
    ├── index.css               # Tailwind CSS, neon glows & monster animations
    ├── types/
    │   └── index.ts            # Shared TypeScript interfaces & types
    ├── services/
    │   ├── storage.ts          # Unified localStorage & persistent state service
    │   └── firebase.ts         # Firebase Auth & Firestore client connector
    ├── components/
    │   ├── MonsterMascot.tsx   # Interactive vector cyber-monster mascot Volt
    │   ├── Navbar.tsx          # Responsive navigation & persona switcher
    │   ├── MarkdownRenderer.tsx# Markdown parser with syntax code blocks & copy
    │   ├── Toast.tsx           # Toast notification provider
    │   └── FirebaseSetupModal.tsx # Interactive Firebase credentials setup modal
    └── views/
        ├── LandingPage.tsx     # Hero banner, feature highlights & sample prompts
        ├── DashboardView.tsx   # Welcome greeting, stats & daily focus tracker
        ├── ChatView.tsx        # Real-time streaming AI chat interface
        ├── LearningCenterView.tsx # Custom roadmaps, lessons & diagnostic quizzes
        ├── HistoryView.tsx     # Conversation history manager & JSON exporter
        └── SettingsView.tsx    # User profile, mentor presets & data controls
```

---

## 📱 Siri-Like Voice Assistant on Android Phones

MonsterMentor AI includes **Volt Siri-Mode**: a continuous, hands-free voice assistant designed specifically for Android mobile devices.

### How it Works:
1. **Pulsing Cyber Soundwaves**: Concentric glowing rings animate to your speech.
2. **Real-time Speech Recognition**: Detects your voice in real time and automatically submits your question when you stop speaking.
3. **Natural Voice Playback**: Volt synthesizes a spoken voice response through your phone's speaker.
4. **Continuous Hands-Free Dialogue**: When Volt finishes speaking, it automatically resumes listening so you can have a natural, back-and-forth conversation without touching the screen.
5. **Floating Siri Orb**: Tap the floating neon microphone button in the bottom-right corner from any screen to summon Volt instantly!

---

### Method A: Install as Android App (Instant PWA, No Android Studio Required)

1. Open the app link in **Google Chrome** on your Android phone.
2. Tap the **"Install App"** button in the top navigation bar (or tap Chrome's three vertical dots **⋮** > **"Install app"** / **"Add to Home screen"**).
3. Confirm the installation.
4. An app icon with Volt the monster appears on your Android home screen and app launcher.
5. Tap the icon: it opens in **Full-Screen Standalone Mode** with no browser address bar or tabs—running like a native Android app!

---

### Method B: Build a Native Android APK (`.apk`) using Capacitor

To generate an official `.apk` file or publish directly to the **Google Play Store**:

1. In your VS Code terminal, install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. Initialize Capacitor:
   ```bash
   npx cap init "MonsterMentor AI" com.monstermentor.app --web-dir dist
   ```

3. Build the web app bundle:
   ```bash
   npm run build
   ```

4. Add Android platform:
   ```bash
   npx cap add android
   ```

5. Open in Android Studio or compile debug APK directly:
   ```bash
   # Open in Android Studio:
   npx cap open android

   # OR compile APK via terminal command:
   cd android && ./gradlew assembleDebug
   ```

The debug APK file will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

Transfer this `.apk` to your Android phone to install it directly!

---

## 🌐 Deploying to Production (Vercel, Render, Railway, or Cloud Run)

To deploy MonsterMentor AI as a full-stack container or Node.js web service:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment Variable**: Set `GEMINI_API_KEY` in your hosting dashboard's Environment Secrets.

---

## 📄 License

Apache-2.0. Feel free to customize and expand!
