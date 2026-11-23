"use strict";

/* =====================================
   ROYAL DICE - PREMIUM GAME ENGINE (Final)
===================================== */

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "royalDicePremium_v3";

const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const initialState = {
    balance: 10000,
    wins: 0,
    losses: 0,
    streak: 0,
    best: 0,
    round: 0,
    xp: 0,
    jackpot: 5000,
    history: [],
    lastReward: null,
    sound: true,
    theme: "purple",
    doublesWins: 0,
    startingBalance: 10000,
    playerName: "ROYAL PLAYER",
    biggestWin: 0,
    diceSkin: "classic"
};

let state = loadState();
let selectedMode = "high";
let isRolling = false;
let autoRunning = false;
let toastTimer = null;
let audioContext = null;
let lastWinAmount = 0;
let lastBet = 0;

/* =====================================
   STORAGE
===================================== */

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return { ...initialState };

        const parsed = JSON.parse(saved);
        return {
            ...initialState,
            ...parsed,
            history: Array.isArray(parsed.history) ? parsed.history.slice(0, 8) : []
        };
    } catch (error) {
        console.error("Could not load saved game:", error);
        return { ...initialState };
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Could not save game:", error);
        showToast("Unable to save game data.");
    }
}

/* =====================================
   FORMATTING
===================================== */

function formatNumber(number) {
    return Number(number).toLocaleString("en-US");
}

function getWinRate() {
    const total = state.wins + state.losses;
    if (total === 0) return 0;
    return Math.round((state.wins / total) * 100);
}

/* =====================================
   DASHBOARD UPDATE
===================================== */

function updateDashboard() {
    $("balance").textContent = formatNumber(state.balance);
    $("wins").textContent = formatNumber(state.wins);
    $("streak").textContent = state.streak;
    $("best").textContent = state.best;
    $("winRate").textContent = getWinRate() + "%";
    $("round").textContent = `ROUND #${state.round}`;
    $("jackpot").innerHTML = `${formatNumber(state.jackpot)} <span>COINS</span>`;

    // Quick Stats
    if ($("totalRounds")) $("totalRounds").textContent = state.round;

    if ($("netProfit")) {
        const profit = state.balance - state.startingBalance;
        $("netProfit").textContent = (profit >= 0 ? "+" : "") + formatNumber(profit);
        $("netProfit").style.color = profit >= 0 ? "var(--green)" : "var(--red)";
    }

    if ($("biggestWin")) {
        $("biggestWin").textContent = formatNumber(state.biggestWin || 0);
    }

    if ($("streakBonus")) {
        const bonus = state.streak >= 7 ? 50 : state.streak >= 5 ? 25 : 0;
        $("streakBonus").textContent = bonus + "%";
    }

    updateProfile();
    updateAchievements();
    updateDailyReward();
}

function updateProfile() {
    const level = Math.floor(state.xp / 100) + 1;
    const currentXP = state.xp % 100;

    const titles = ["BEGINNER", "APPRENTICE", "SKILLED", "EXPERT", "MASTER", "ROYAL LEGEND"];
    const title = titles[Math.min(level - 1, titles.length - 1)];

    if ($("level")) {
        $("level").textContent = `LEVEL ${String(level).padStart(2, "0")} · ${title}`;
    }
    if ($("xpText")) $("xpText").textContent = `${currentXP} / 100`;
    if ($("xpBar")) $("xpBar").style.width = `${currentXP}%`;
}

/* =====================================
   ACHIEVEMENTS
===================================== */

function updateAchievements() {
    const achievements = [
        state.wins >= 1,                // 1. First Victory
        state.best >= 3,                // 2. Hot Streak
        state.wins >= 10,               // 3. Dice Legend
        state.balance >= 15000,         // 4. Coin Collector
        state.round >= 50,              // 5. Perfect Ten
        state.doublesWins >= 1,         // 6. Double Trouble
        state.best >= 7,                // 7. Streak Master
        (state.biggestWin || 0) >= 5000 // 8. Big Winner
    ];

    achievements.forEach((unlocked, index) => {
        const element = $(`achievement${index + 1}`);
        if (element) {
            element.classList.toggle("unlocked", unlocked);
        }
    });
}

/* =====================================
   TOAST
===================================== */

function showToast(message) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* =====================================
   SOUND
===================================== */

function playSound(frequency = 440, duration = 0.12) {
    if (!state.sound) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioContext) audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume();

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn("Sound unavailable:", error);
    }
}

function toggleSound() {
    state.sound = !state.sound;
    if ($("soundBtn")) $("soundBtn").textContent = state.sound ? "🔊" : "🔇";
    saveState();
    if (state.sound) playSound(600);
    showToast(state.sound ? "Sound enabled 🔊" : "Sound muted 🔇");
}

/* =====================================
   THEME SYSTEM (9 Themes)
===================================== */

function applyTheme() {
    document.body.classList.remove(
        "theme-blue",
        "theme-gold",
        "theme-white",
        "theme-emerald",
        "theme-crimson",
        "theme-ocean",
        "theme-sunset",
        "theme-midnight"
    );

    if (state.theme !== "purple") {
        document.body.classList.add(`theme-${state.theme}`);
    }

    const icons = {
        purple: "🎨",
        blue: "🌊",
        gold: "👑",
        white: "☀️",
        emerald: "🌿",
        crimson: "❤️",
        ocean: "🌊",
        sunset: "🌅",
        midnight: "🌙"
    };

    if ($("themeBtn")) {
        $("themeBtn").textContent = icons[state.theme] || "🎨";
    }
}

function toggleTheme() {
    const themes = [
        "purple", "blue", "gold", "white",
        "emerald", "crimson", "ocean", "sunset", "midnight"
    ];

    const currentIndex = themes.indexOf(state.theme);
    state.theme = themes[(currentIndex + 1) % themes.length];

    applyTheme();
    saveState();

    const names = {
        purple: "PURPLE",
        blue: "BLUE",
        gold: "GOLD",
        white: "WHITE",
        emerald: "EMERALD",
        crimson: "CRIMSON",
        ocean: "OCEAN",
        sunset: "SUNSET",
        midnight: "MIDNIGHT"
    };

    showToast(`${names[state.theme]} THEME ACTIVATED`);
    playSound(550);
}

/* =====================================
   MODE SELECTION
===================================== */

document.querySelectorAll(".mode").forEach(button => {
    button.addEventListener("click", () => {
        if (isRolling) return;
        selectedMode = button.dataset.mode;
        document.querySelectorAll(".mode").forEach(m => m.classList.remove("active"));
        button.classList.add("active");
        playSound(420);
    });
});

/* =====================================
   QUICK BETS
===================================== */

document.querySelectorAll("[data-bet]").forEach(button => {
    button.addEventListener("click", () => {
        if (isRolling) return;
        $("bet").value = Math.min(Number(button.dataset.bet), state.balance);
        playSound(400);
    });
});

if ($("halfBtn")) {
    $("halfBtn").addEventListener("click", () => {
        if (isRolling) return;
        $("bet").value = Math.max(1, Math.floor(state.balance / 2));
    });
}

if ($("maxBtn")) {
    $("maxBtn").addEventListener("click", () => {
        if (isRolling) return;
        $("bet").value = state.balance;
    });
}

/* =====================================
   DICE LOGIC
===================================== */

function randomDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateDice() {
    const dice1 = $("dice1");
    const dice2 = $("dice2");

    dice1.classList.add("rolling");
    dice2.classList.add("rolling");

    for (let i = 0; i < 7; i++) {
        dice1.textContent = diceFaces[randomDice() - 1];
        dice2.textContent = diceFaces[randomDice() - 1];
        playSound(180 + Math.random() * 120, 0.04);
        await sleep(85);
    }

    const first = randomDice();
    const second = randomDice();

    dice1.textContent = diceFaces[first - 1];
    dice2.textContent = diceFaces[second - 1];

    dice1.classList.remove("rolling");
    dice2.classList.remove("rolling");

    return { first, second, total: first + second };
}

function checkWin(total, first, second) {
    if (selectedMode === "high") return total >= 8 && total <= 12;
    if (selectedMode === "low") return total >= 2 && total <= 6;
    if (selectedMode === "seven") return total === 7;
    if (selectedMode === "doubles") return first === second;
    return false;
}

function showResult(message, type) {
    const result = $("result");
    if (!result) return;
    result.className = `result ${type}`;
    result.innerHTML = `<span class="result-dot"></span>${message}`;
}

/* =====================================
   CONFETTI
===================================== */

function launchConfetti() {
    const container = $("confetti");
    if (!container) return;

    for (let i = 0; i < 70; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.background = ["#f5c76b", "#a78bfa", "#42d69b", "#ffffff", "#ff7ba0"][Math.floor(Math.random() * 5)];
        piece.style.animationDelay = Math.random() * 0.8 + "s";
        container.appendChild(piece);
        setTimeout(() => piece.remove(), 3600);
    }
}

/* =====================================
   HISTORY
===================================== */

function addHistory(total, mode, won, bet, reward, jackpotWon, luckyHit) {
    const record = {
        total,
        mode: mode.toUpperCase(),
        won,
        bet,
        reward,
        jackpotWon,
        luckyHit,
        round: state.round
    };
    state.history.unshift(record);
    state.history = state.history.slice(0, 8);
    renderHistory();
}

function renderHistory() {
    const history = $("history");
    if (!history) return;

    history.innerHTML = "";

    if (state.history.length === 0) {
        history.innerHTML = '<p class="empty">Your game results will appear here.</p>';
        return;
    }

    state.history.forEach(record => {
        const item = document.createElement("div");
        item.className = "history-item";

        const info = document.createElement("div");
        info.className = "history-info";

        const title = document.createElement("strong");
        title.textContent = `Round #${record.round} · ${record.mode}`;

        const details = document.createElement("small");
        details.textContent = `Dice: ${record.total} · Bet: ${formatNumber(record.bet)}`;

        info.append(title, details);

        if (record.jackpotWon) {
            const jp = document.createElement("small");
            jp.textContent = "💎 JACKPOT!";
            jp.style.color = "var(--gold)";
            info.append(jp);
        }
        if (record.luckyHit) {
            const ln = document.createElement("small");
            ln.textContent = "🎯 Lucky Number!";
            ln.style.color = "var(--gold)";
            info.append(ln);
        }

        const outcome = document.createElement("span");
        outcome.className = record.won ? "history-win" : "history-lose";
        outcome.textContent = record.won ? `+${formatNumber(record.reward)}` : `-${formatNumber(record.bet)}`;

        item.append(info, outcome);
        history.appendChild(item);
    });
}

/* =====================================
   DAILY REWARD
===================================== */

function getToday() {
    const now = new Date();
    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
}

function updateDailyReward() {
    const claimed = state.lastReward === getToday();
    if ($("dailyRewardBtn")) {
        $("dailyRewardBtn").disabled = claimed;
        $("dailyRewardBtn").textContent = claimed ? "✓ REWARD CLAIMED" : "CLAIM 500 COINS";
    }
    if ($("dailyStatus")) {
        $("dailyStatus").textContent = claimed
            ? "Come back tomorrow for another reward!"
            : "Your daily reward is waiting!";
    }
}

if ($("dailyRewardBtn")) {
    $("dailyRewardBtn").addEventListener("click", () => {
        if (state.lastReward === getToday()) {
            showToast("You have already claimed today's reward!");
            return;
        }
        state.balance += 500;
        state.lastReward = getToday();
        updateDashboard();
        saveState();
        showToast("🎁 500 BONUS COINS ADDED!");
        playSound(700);
        launchConfetti();
    });
}

/* =====================================
   MAIN ROLL
===================================== */

async function rollOnce(isDoubleOrNothing = false) {
    if (isRolling) return false;

    let bet = isDoubleOrNothing ? lastBet * 2 : Number($("bet").value);

    if (!Number.isSafeInteger(bet) || bet <= 0) {
        showToast("Please enter a valid whole number bet.");
        return false;
    }
    if (bet > state.balance) {
        showToast("Insufficient balance!");
        return false;
    }

    isRolling = true;
    if ($("rollBtn")) $("rollBtn").disabled = true;
    if ($("doubleBtn")) $("doubleBtn").style.display = "none";

    state.balance -= bet;
    lastBet = bet;
    updateDashboard();

    const dice = await animateDice();
    const won = checkWin(dice.total, dice.first, dice.second);

    let reward = 0;
    let jackpotWon = false;
    let luckyHit = false;

    // Lucky Number side bet
    const luckyGuess = Number($("luckyNumber")?.value);
    if (luckyGuess >= 2 && luckyGuess <= 12 && luckyGuess === dice.total) {
        luckyHit = true;
        const luckyReward = bet * 10;
        reward += luckyReward;
        state.balance += luckyReward;
        showToast(`🎯 LUCKY NUMBER HIT! +${formatNumber(luckyReward)}`);
    }

    state.round++;
    state.jackpot += 8;

    if (won) {
        state.wins++;
        state.streak++;
        state.best = Math.max(state.best, state.streak);

        let multiplier = 2;
        if (selectedMode === "seven") multiplier = 5;
        if (selectedMode === "doubles") {
            multiplier = 4;
            state.doublesWins = (state.doublesWins || 0) + 1;
        }

        reward += bet * multiplier;

        // Streak Bonus
        let streakMultiplier = 1;
        if (state.streak >= 7) streakMultiplier = 1.5;
        else if (state.streak >= 5) streakMultiplier = 1.25;

        reward = Math.floor(reward * streakMultiplier);

        state.balance += reward;
        state.xp += selectedMode === "doubles" ? 30 : 20;

        // Biggest Win
        if (reward > (state.biggestWin || 0)) {
            state.biggestWin = reward;
        }

        // Jackpot chance on Lucky 7
        if (selectedMode === "seven" && Math.random() < 0.12) {
            jackpotWon = true;
            reward += state.jackpot;
            state.balance += state.jackpot;
            state.jackpot = 5000;
        }

        lastWinAmount = reward;

        showResult(
            jackpotWon
                ? `👑 JACKPOT! You won ${formatNumber(reward)} coins!`
                : `🎉 YOU WON! +${formatNumber(reward)} coins!`,
            "win"
        );

        playSound(780, 0.28);
        launchConfetti();

        if ($("doubleBtn")) $("doubleBtn").style.display = "block";
    } else {
        state.losses++;
        state.streak = 0;
        showResult(`Not this time! You lost ${formatNumber(bet)} coins.`, "lose");
        playSound(170, 0.22);
        lastWinAmount = 0;
    }

    if ($("total")) $("total").textContent = dice.total;
    addHistory(dice.total, selectedMode, won, bet, reward, jackpotWon, luckyHit);
    updateDashboard();
    saveState();

    isRolling = false;
    if ($("rollBtn")) $("rollBtn").disabled = false;
    return true;
}

/* =====================================
   DOUBLE OR NOTHING
===================================== */

if ($("doubleBtn")) {
    $("doubleBtn").addEventListener("click", async () => {
        if (isRolling || lastWinAmount === 0) return;
        $("doubleBtn").style.display = "none";
        await rollOnce(true);
    });
}

/* =====================================
   AUTO PLAY
===================================== */

async function startAutoPlay() {
    if (autoRunning || isRolling) return;
    if (state.balance <= 0) {
        showToast("You need coins before starting Auto Play.");
        return;
    }

    autoRunning = true;
    if ($("autoRollBtn")) $("autoRollBtn").textContent = "■ STOP AUTO ROLL";
    if ($("autoStatus")) $("autoStatus").textContent = "Auto Roll: RUNNING";
    showToast("Auto Play started!");

    for (let i = 0; i < 10; i++) {
        if (!autoRunning) break;
        const success = await rollOnce();
        if (!success) break;
        if (i < 9) await sleep(480);
    }

    autoRunning = false;
    if ($("autoRollBtn")) $("autoRollBtn").textContent = "▶ START AUTO ROLL";
    if ($("autoStatus")) $("autoStatus").textContent = "Auto Roll: OFF";
    showToast("Auto Play finished!");
}

if ($("autoRollBtn")) {
    $("autoRollBtn").addEventListener("click", () => {
        if (autoRunning) {
            autoRunning = false;
            if ($("autoStatus")) $("autoStatus").textContent = "Auto Roll: STOPPING...";
            showToast("Stopping Auto Play...");
        } else {
            startAutoPlay();
        }
    });
}

/* =====================================
   CLEAR / RESTART / RESET
===================================== */

if ($("clearHistory")) {
    $("clearHistory").addEventListener("click", () => {
        if (isRolling || autoRunning) return;
        state.history = [];
        renderHistory();
        saveState();
        showToast("Game history cleared.");
    });
}

if ($("restartBtn")) {
    $("restartBtn").addEventListener("click", () => {
        if (isRolling || autoRunning) {
            showToast("Stop the current game first.");
            return;
        }
        if (!confirm("Restart statistics? Balance & daily reward will stay.")) return;

        state.wins = 0;
        state.losses = 0;
        state.streak = 0;
        state.best = 0;
        state.round = 0;
        state.xp = 0;
        state.jackpot = 5000;
        state.history = [];
        state.doublesWins = 0;
        state.biggestWin = 0;

        $("dice1").textContent = "⚀";
        $("dice2").textContent = "⚀";
        $("total").textContent = "--";
        showResult("Game restarted! Choose your mode and roll.", "");
        renderHistory();
        updateDashboard();
        saveState();
        showToast("New game started!");
    });
}

if ($("resetBtn")) {
    $("resetBtn").addEventListener("click", () => {
        if (isRolling || autoRunning) {
            showToast("Stop the current game first.");
            return;
        }
        if (!confirm("Are you sure? This will permanently reset ALL data.")) return;

        state = { ...initialState };
        localStorage.removeItem(STORAGE_KEY);

        selectedMode = "high";
        if ($("bet")) $("bet").value = 100;
        if ($("luckyNumber")) $("luckyNumber").value = "";

        document.querySelectorAll(".mode").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === "high");
        });

        $("dice1").textContent = "⚀";
        $("dice2").textContent = "⚀";
        $("total").textContent = "--";
        if ($("doubleBtn")) $("doubleBtn").style.display = "none";

        renderHistory();
        applyTheme();
        applyDiceSkin();
        updateDashboard();
        if ($("soundBtn")) $("soundBtn").textContent = "🔊";
        showResult("Choose your mode and roll the dice!", "");
        showToast("All game data has been reset!");
    });
}

/* =====================================
   PLAYER NAME
===================================== */

const nameEl = $("playerName");
if (nameEl) {
    nameEl.textContent = state.playerName || "ROYAL PLAYER";

    nameEl.addEventListener("blur", () => {
        const newName = nameEl.textContent.trim().slice(0, 16) || "ROYAL PLAYER";
        nameEl.textContent = newName;
        state.playerName = newName;
        saveState();
        showToast("Name updated!");
    });

    nameEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            nameEl.blur();
        }
    });
}

/* =====================================
   DICE SKINS
===================================== */

function applyDiceSkin() {
    const dice1 = $("dice1");
    const dice2 = $("dice2");
    if (!dice1 || !dice2) return;

    dice1.classList.remove("skin-golden", "skin-neon");
    dice2.classList.remove("skin-golden", "skin-neon");

    if (state.diceSkin === "golden") {
        dice1.classList.add("skin-golden");
        dice2.classList.add("skin-golden");
    }
    if (state.diceSkin === "neon") {
        dice1.classList.add("skin-neon");
        dice2.classList.add("skin-neon");
    }

    document.querySelectorAll(".skin-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.skin === state.diceSkin);
    });
}

document.querySelectorAll(".skin-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (isRolling) return;
        state.diceSkin = btn.dataset.skin;
        applyDiceSkin();
        saveState();
        playSound(400);
        showToast(`${state.diceSkin.toUpperCase()} SKIN APPLIED`);
    });
});

/* =====================================
   NAVIGATION
===================================== */

if ($("menuBtn")) {
    $("menuBtn").addEventListener("click", () => {
        $("navLinks")?.classList.toggle("open");
    });
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        $("navLinks")?.classList.remove("open");

        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
    });
});

const sections = ["home", "play", "achievements", "history", "algorithm"];

window.addEventListener("scroll", () => {
    let current = "home";

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = id;
        }
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
});

/* =====================================
   MODAL + KEYBOARD
===================================== */

if ($("helpBtn")) {
    $("helpBtn").addEventListener("click", () => $("rulesModal")?.classList.add("open"));
}
if ($("closeModal")) {
    $("closeModal").addEventListener("click", () => $("rulesModal")?.classList.remove("open"));
}
if ($("rulesModal")) {
    $("rulesModal").addEventListener("click", e => {
        if (e.target === $("rulesModal")) $("rulesModal").classList.remove("open");
    });
}

document.addEventListener("keydown", e => {
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    if (typing || e.repeat) return;

    if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        if (!isRolling && !autoRunning) rollOnce();
    }
    if (e.key === "Escape") $("rulesModal")?.classList.remove("open");

    if (e.key === "1") document.querySelector('[data-mode="high"]')?.click();
    if (e.key === "2") document.querySelector('[data-mode="low"]')?.click();
    if (e.key === "3") document.querySelector('[data-mode="seven"]')?.click();
    if (e.key === "4") document.querySelector('[data-mode="doubles"]')?.click();
});

/* =====================================
   INIT
===================================== */

if ($("soundBtn")) $("soundBtn").addEventListener("click", toggleSound);
if ($("themeBtn")) $("themeBtn").addEventListener("click", toggleTheme);
if ($("rollBtn")) $("rollBtn").addEventListener("click", () => rollOnce());

function initializeGame() {
    if ($("soundBtn")) $("soundBtn").textContent = state.sound ? "🔊" : "🔇";
    if ($("bet")) $("bet").value = Math.min(100, Math.max(1, state.balance));

    applyTheme();
    applyDiceSkin();
    updateDashboard();
    renderHistory();
    showResult("Choose your mode and roll the dice!", "");
    if ($("total")) $("total").textContent = "--";
    if ($("dice1")) $("dice1").textContent = "⚀";
    if ($("dice2")) $("dice2").textContent = "⚀";

    saveState();
    console.log("👑 Royal Dice Premium Fully Loaded!");
}

initializeGame();