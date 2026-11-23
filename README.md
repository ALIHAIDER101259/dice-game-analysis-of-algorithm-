# 🎲 Royal Dice – Randomized Dice Game

## 📌 About the Project
Royal Dice is a C++ console-based dice game developed as an Analysis of Algorithms course project.

The game uses random number generation to simulate dice rolls. Players can choose different game modes, place virtual bets, and track their game statistics.

## ✨ Features
- 🎲 Random Dice Rolling
- 👑 Normal Dice Mode
- 📈 High / Low Mode
- 🍀 Lucky Seven Mode
- 💰 Virtual Betting System
- 📊 Player Statistics
- 💾 Save and Load Player Data
- ✅ Basic Input Validation

## 🛠️ Technologies Used
- C++
- Random Number Generation
- File Handling
- Basic Algorithm Design

## 🧠 Algorithm Used
The project uses a randomized algorithm to generate dice values between 1 and 6.

```cpp
int rollDice() {
    return rand() % 6 + 1;
}
```

## ⏱️ Algorithm Complexity
- Single Dice Roll: O(1)
- Two Dice Rolls: O(1)
- N Dice Rolls: O(n)
- Space Complexity: O(1)

## 🚀 How to Run

1. Download or clone this repository.
2. Open the project in VS Code or any C++ IDE.
3. Compile the `main.cpp` file.
4. Run the program.

## 👨‍💻 Project Members
- Ali Haider
- Muhammad Shayaan

## 📚 Course Information
- **Course:** Analysis of Algorithms
- **Semester:** Spring 2026
- **Instructor:** Mr. Muhammad Usman Sharif

## 🎯 Project Purpose
The main purpose of this project is to understand randomized algorithms, implement them in C++, and analyze their time and space complexity.
