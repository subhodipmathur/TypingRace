# TypingRace
Typing Race is a high-speed, competitive multiplayer typing application that transforms the standard typing test into a dynamic, head-to-head racing game. Designed with a sleek Cyberpunk aesthetic, the project focuses on delivering low-latency interaction and a responsive "Game State" across multiple users simultaneously.

🏎️ TypingRace
A real-time, competitive multiplayer typing game built with a modern tech stack. **TypingRace** turns a standard typing test into a high-octane arcade experience, using synchronized data to let players compete head-to-head in a neon-soaked, 3D-perspective environment.

🚀 Live Demo
**Play it here:** https://typing-race-zeta.vercel.app/

🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (3D Transforms & Glassmorphism), Vanilla JavaScript (ES6+).
* **Backend/Database:** Firebase Realtime Database (Web SDK v9).
* **Fonts:** Orbitron & Inter (via Google Fonts).

✨ Features
* **Real-Time Multiplayer:** Instant synchronization of player movement and scores across all connected clients.
* **Host-Controlled Lobbies:** Create private rooms with custom word counts (10, 20, 50, or custom).
* **Typing Metrics:** Real-time **WPM (Words Per Minute)** calculation and accuracy monitoring.
* **3D Track Perspective:** Immersive racing visuals created using CSS perspective and rotation.
* **Automated State Management:** Robust cleanup logic ensures seamless race restarts without page refreshes.

📖 How to Play
1. **Join/Create:** Enter your name and create a new room, or enter a 5-digit code to join a friend.
2. **The Countdown:** Once the host clicks "Start," a 3-second countdown will sync for everyone.
3. **The Race:** Type the highlighted word exactly. Your car advances with every correct word.
4. **Finish Line:** The first player to finish triggers the "Finish" banner. View the final leaderboard to see the WPM rankings.


🔧 Installation & Setup
To run this project locally:

1. **Clone the repo:**
```bash
git clone https://github.com/yourusername/typing-race.git
```

2. **Firebase Config:**
Open `script.js` and replace the `firebaseConfig` object with your own Firebase Project credentials.
3. **Launch:**
Open `index.html` in any modern web browser.

🛣️ Roadmap
* [ ] Add "Personal Best" tracking using LocalStorage.
* [ ] Implement a "Practice Mode" for solo play.
* [ ] Add sound effects for countdowns and finish lines.
* [ ] Mobile-responsive touch keyboard support.
