// 1️⃣ Firebase config - replace with your own
const firebaseConfig = {
  apiKey: "AIzaSyD1vhycgVFuHhSB_JNqP0sfjUW2mnp02Ys",
  authDomain: "typing-race-58860.firebaseapp.com",
  databaseURL: "https://typing-race-58860-default-rtdb.firebaseio.com",
  projectId: "typing-race-58860",
  storageBucket: "typing-race-58860.firebasestorage.app",
  messagingSenderId: "579950205582",
  appId: "1:579950205582:web:19c87bdf40ef2db45807df",
  measurementId: "G-K65XCWLCF9"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔹 Variables
let roomCode = "";
let playerId = "";
let players = {};
let playerCarElements = {};
let wordIndex = 0;
let gameWords = [];
let wordsPerRace = 20;
let startTime = null;
let totalCharsTyped = 0;
let isHost = false;

const wordPool = ["innovation","planet","galaxy","tree","river","computer","psychology","neural","science","apple","library","moon","sun","history","books","coding","developer","javascript","challenge","future","technology"];

// DOM Elements
const lobby = document.getElementById("lobby");
const gameDiv = document.getElementById("game");
const input = document.getElementById("input");
const currentWordEl = document.getElementById("current-word");
const wordCountSelect = document.getElementById("word-count");
const startGameBtn = document.getElementById("start-game-btn");
const trackContainer = document.querySelector(".track-container");
const roomDisplay = document.getElementById("room-display");

// 🟢 Handle Custom Word Count
wordCountSelect.addEventListener("change", () => {
    if (wordCountSelect.value === "custom") {
        const custom = prompt("Enter number of words:", "20");
        const n = parseInt(custom);
        if (n && n > 0) {
            wordsPerRace = n;
            wordCountSelect.options[wordCountSelect.selectedIndex].text = `Custom (${n})`;
        } else {
            wordsPerRace = 20;
            wordCountSelect.value = "20";
        }
    } else {
        wordsPerRace = parseInt(wordCountSelect.value);
    }
});

// 🟢 Create Room (Host)
document.getElementById("create-room").addEventListener("click", () => {
    const name = document.getElementById("player-name").value || "Host";
    roomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    playerId = "player_" + Date.now();
    isHost = true;

    const roomRef = db.ref(`rooms/${roomCode}`);
    roomRef.onDisconnect().remove();

    roomRef.set({
        settings: {
            wordsPerRace: wordsPerRace,
            status: "waiting",
            hostId: playerId
        }
    }).then(() => {
        joinLogic(name);
        startGameBtn.style.display = "inline-block";
    });
});

// 🟢 Join Room (Guest)
document.getElementById("join-room").addEventListener("click", () => {
    const name = document.getElementById("player-name").value || "Racer";
    const code = document.getElementById("room-code").value.toUpperCase();
    if (!code) return alert("Enter code");
    
    roomCode = code;
    playerId = "player_" + Date.now();
    isHost = false;

    db.ref(`rooms/${roomCode}/settings`).once("value").then(snap => {
        if (!snap.exists()) return alert("Room not found!");
        wordsPerRace = snap.val().wordsPerRace;
        joinLogic(name);
    });
});

function joinLogic(name) {
    const roomRef = db.ref(`rooms/${roomCode}`);
    roomRef.child(`players/${playerId}`).set({ name, score: 0, wpm: 0 });
    roomRef.child(`players/${playerId}`).onDisconnect().remove();

    roomDisplay.textContent = `Room joined: ${roomCode}`;

    roomRef.on("value", snap => {
        if (!snap.exists() && roomCode !== "") {
            alert("The host has closed the room.");
            location.reload();
        }
    });

    // Listen for status changes
    roomRef.child("settings/status").on("value", snap => {
        const status = snap.val();
        if (status === "starting") {
            startRaceSequence();
        } else if (status === "waiting") {
            // Force immediate UI cleanup when status reverts to waiting
            cleanupUI();
        }
    });

    roomRef.child("players").on("value", snap => {
        players = snap.val() || {};
        renderTrack();
    });
}

// 🟢 Host Restart Logic
startGameBtn.addEventListener("click", triggerNewRace);
document.getElementById("restart-race-btn").addEventListener("click", () => {
    if (isHost) triggerNewRace();
    else alert("Only host can restart!");
});

function triggerNewRace() {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random()).slice(0, wordsPerRace);
    const updates = {};
    Object.keys(players).forEach(id => {
        updates[`players/${id}/score`] = 0;
        updates[`players/${id}/wpm`] = 0;
    });

    // 1. Flicker status to 'waiting' to trigger cleanup for all clients
    db.ref(`rooms/${roomCode}/settings`).update({ status: "waiting" }).then(() => {
        // 2. Then set to 'starting' to begin the countdown
        updates['gameWords'] = shuffled;
        updates['settings/status'] = 'starting';
        db.ref(`rooms/${roomCode}`).update(updates);
    });
}

function cleanupUI() {
    gameDiv.classList.remove("race-over");
    document.getElementById("end-race-modal").style.display = "none";
    
    // Nuclear option: remove banner from DOM or hide it
    const banner = document.getElementById("finish-banner");
    if (banner) banner.style.display = "none";
}

// 🟢 THE HARD RESET
function startRaceSequence() {
    cleanupUI(); // Hide banner/modals
    
    wordIndex = 0;
    totalCharsTyped = 0;
    input.value = "";
    input.disabled = true;
    document.getElementById("wpm-display").textContent = `WPM: 0`;

    db.ref(`rooms/${roomCode}/gameWords`).once("value").then(snap => {
        gameWords = snap.val();
        lobby.style.display = "none";
        gameDiv.style.display = "block";
        
        let count = 3;
        const cd = document.getElementById("countdown");
        cd.style.display = "block";
        cd.textContent = count;
        
        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                cd.textContent = count;
            } else if (count === 0) {
                cd.textContent = "GO!";
            } else {
                clearInterval(timer);
                cd.style.display = "none";
                beginTyping(); 
            }
        }, 1000);
    });
}

function beginTyping() {
    startTime = Date.now();
    input.disabled = false;
    input.focus();
    nextWord();
}

function nextWord() {
    if (wordIndex < gameWords.length) {
        currentWordEl.textContent = gameWords[wordIndex];
    }
}

input.addEventListener("input", () => {
    if (input.disabled) return;
    const target = gameWords[wordIndex];
    const typed = input.value;

    if (target.startsWith(typed)) input.classList.remove("wrong");
    else input.classList.add("wrong");

    if (typed === target) {
        totalCharsTyped += target.length + 1;
        wordIndex++;
        input.value = "";
        
        const time = (Date.now() - startTime) / 60000;
        const wpm = Math.round((totalCharsTyped / 5) / time) || 0;
        document.getElementById("wpm-display").textContent = `WPM: ${wpm}`;

        db.ref(`rooms/${roomCode}/players/${playerId}`).update({ score: wordIndex, wpm });

        if (wordIndex >= gameWords.length) endRace();
        else nextWord();
    }
});

function renderTrack() {
    const containerWidth = trackContainer.offsetWidth || 800; 
    const playableWidth = containerWidth - 150;

    Object.keys(players).forEach((id, index) => {
        let car = playerCarElements[id];
        if (!car) {
            car = document.createElement("div");
            car.className = "player-car";
            car.style.position = "absolute";
            car.style.transition = "left 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)";
            trackContainer.appendChild(car);
            playerCarElements[id] = car;
        }

        car.innerHTML = `
            <div class="car-wrapper" style="position: relative;">
                <div style="width: 65px; height: 32px; background: ${id === playerId ? 'var(--primary)' : '#555'}; border-radius: 6px 15px 15px 6px; position: relative; border: 1px solid rgba(255,255,255,0.2);">
                    <div style="position: absolute; right: 15px; top: 5px; width: 15px; height: 22px; background: #111; border-radius: 4px;"></div>
                </div>
                <div style="position: absolute; top: -22px; left: 0; font-family: 'Orbitron', sans-serif; font-size: 11px; color: #fff; font-weight: bold; white-space: nowrap;">
                    ${players[id].name} ${id === playerId ? '(YOU)' : ''}
                </div>
            </div>`;

        const progress = players[id].score / (wordsPerRace || 1);
        car.style.left = (progress * playableWidth) + "px";
        car.style.top = (40 + (index * 45)) + "px";
    });
}

function endRace() {
    if (gameDiv.classList.contains("race-over")) return;
    
    input.disabled = true;
    gameDiv.classList.add("race-over");
    
    const banner = document.getElementById("finish-banner");
    if (banner) banner.style.display = "block";
    
    setTimeout(() => {
        document.getElementById("end-race-modal").style.display = "flex";
        
        const sorted = Object.entries(players).sort((a,b) => b[1].wpm - a[1].wpm);
        
        document.getElementById("final-leaderboard").innerHTML = sorted
            .map(([id, p], i) => `
                <div class="leaderboard-entry">
                    <div>
                        <span style="color: #888; margin-right: 10px;">#${i+1}</span>
                        <span class="entry-name">${p.name} ${id === playerId ? '(YOU)' : ''}</span>
                    </div>
                    <span class="entry-wpm">${p.wpm} WPM</span>
                </div>
            `).join("");

        // Show/Hide Restart button only for Host
        const restartBtn = document.getElementById("restart-race-btn");
        if (isHost) {
            restartBtn.style.display = "inline-block";
        } else {
            restartBtn.style.display = "none";
        }
    }, 1500);
}

document.getElementById("leave-race-btn").addEventListener("click", () => {
    if (isHost) db.ref(`rooms/${roomCode}`).remove().then(() => location.reload());
    else db.ref(`rooms/${roomCode}/players/${playerId}`).remove().then(() => location.reload());
});

document.getElementById("return-lobby-btn").addEventListener("click", () => location.reload());