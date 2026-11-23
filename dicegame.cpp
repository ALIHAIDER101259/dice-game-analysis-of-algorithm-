#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>
#include <fstream>
using namespace std;

// Player Information
struct Player
{
  string name;
  int coins = 1000;
  int wins = 0;
  int losses = 0;
  int games = 0;
};

Player player;

// Generate Random Dice Number
int rollDice()
{
  return rand() % 6 + 1;
}

// Save Player Data
void saveGame()
{
  ofstream file("royal_dice.txt");

  if (file.is_open())
  {
    file << player.name << endl;
    file << player.coins << endl;
    file << player.wins << endl;
    file << player.losses << endl;
    file << player.games << endl;

    file.close();
  }
}

// Load Player Data
bool loadGame()
{
  ifstream file("royal_dice.txt");

  if (!file.is_open())
  {
    return false;
  }

  getline(file, player.name);

  file >> player.coins >> player.wins >> player.losses >> player.games;

  file.close();
  return true;
}

// Display Dice
void displayDice(int dice)
{
  cout << "\n+-------+";
  cout << "\n|       |";
  cout << "\n|   " << dice << "   |";
  cout << "\n|       |";
  cout << "\n+-------+\n";
}

// Get Valid Bet
int getBet()
{
  int bet;

  cout << "\nEnter your bet: ";

  while (!(cin >> bet) || bet <= 0 || bet > player.coins)
  {
    cout << "Invalid amount. Enter again: ";
    cin.clear();
    cin.ignore(10000, '\n');
  }

  return bet;
}

// Update Winning Result
void win(int reward)
{
  player.coins += reward;
  player.wins++;
  player.games++;

  cout << "\nCongratulations! YOU WON!";
  cout << "\nReward: " << reward << " coins\n";

  saveGame();
}

// Update Losing Result
void lose(int bet)
{
  player.coins -= bet;
  player.losses++;
  player.games++;

  cout << "\nSorry! YOU LOST!";
  cout << "\nLost: " << bet << " coins\n";

  saveGame();
}

// Normal Dice Game
void rollDiceGame()
{
  if (player.coins <= 0)
  {
    cout << "\nYou don't have enough coins!\n";
    return;
  }

  int bet = getBet();

  int dice1 = rollDice();
  int dice2 = rollDice();

  cout << "\nRolling Dice...\n";

  displayDice(dice1);
  displayDice(dice2);

  int total = dice1 + dice2;

  cout << "\nTotal: " << total << endl;

  if (total > 7)
  {
    win(bet);
  }
  else
  {
    lose(bet);
  }
}

// High Low Game
void highLowGame()
{
  if (player.coins <= 0)
  {
    cout << "\nNot enough coins!\n";
    return;
  }

  int bet = getBet();
  int choice;

  cout << "\n1. HIGH (8-12)";
  cout << "\n2. LOW (2-6)";
  cout << "\nChoose: ";
  cin >> choice;

  if (choice != 1 && choice != 2)
  {
    cout << "\nInvalid choice!\n";
    return;
  }

  int total = rollDice() + rollDice();

  cout << "\nDice Total: " << total << endl;

  if ((choice == 1 && total > 7) ||
      (choice == 2 && total < 7))
  {
    win(bet * 2);
  }
  else
  {
    lose(bet);
  }
}

// Lucky Seven Game
void luckySeven()
{
  if (player.coins <= 0)
  {
    cout << "\nNot enough coins!\n";
    return;
  }

  int bet = getBet();

  int dice1 = rollDice();
  int dice2 = rollDice();

  int total = dice1 + dice2;

  cout << "\nDice 1: " << dice1;
  cout << "\nDice 2: " << dice2;
  cout << "\nTotal: " << total << endl;

  if (total == 7)
  {
    win(bet * 4);
  }
  else
  {
    lose(bet);
  }
}

// Player Statistics
void statistics()
{
  cout << "\n========== PLAYER STATISTICS ==========";

  cout << "\nPlayer Name: " << player.name;
  cout << "\nAvailable Coins: " << player.coins;
  cout << "\nTotal Games: " << player.games;
  cout << "\nTotal Wins: " << player.wins;
  cout << "\nTotal Losses: " << player.losses;

  cout << "\n=======================================\n";
}

// Main Menu
void mainMenu()
{
  int choice;

  do
  {
    cout << "\n\n";
    cout << "========================================";
    cout << "\n             ROYAL DICE";
    cout << "\n          PREMIUM EDITION";
    cout << "\n========================================";

    cout << "\nPlayer: " << player.name;
    cout << "\nCoins: " << player.coins;

    cout << "\n\n--------------- MAIN MENU ---------------";

    cout << "\n1. Roll Dice";
    cout << "\n2. High / Low Game";
    cout << "\n3. Lucky Seven";
    cout << "\n4. Player Statistics";
    cout << "\n5. Save Game";
    cout << "\n0. Exit";

    cout << "\n\nSelect Option: ";

    if (!(cin >> choice))
    {
      cin.clear();
      cin.ignore(10000, '\n');
      cout << "\nInvalid input!\n";
      continue;
    }

    switch (choice)
    {
    case 1:
      rollDiceGame();
      break;

    case 2:
      highLowGame();
      break;

    case 3:
      luckySeven();
      break;

    case 4:
      statistics();
      break;

    case 5:
      saveGame();
      cout << "\nGame Saved Successfully!\n";
      break;

    case 0:
      saveGame();
      cout << "\nThank you for playing Royal Dice!\n";
      break;

    default:
      cout << "\nInvalid Option! Try Again.\n";
    }

  } while (choice != 0);
}

// Main Function
int main()
{
  srand(time(0));

  cout << "========================================\n";
  cout << "          WELCOME TO ROYAL DICE\n";
  cout << "========================================\n";

  if (loadGame())
  {
    cout << "\nWelcome Back, " << player.name << "!\n";
  }
  else
  {
    cout << "\nEnter Your Name: ";
    getline(cin, player.name);

    if (player.name.empty())
    {
      player.name = "Player";
    }
  }

  mainMenu();

  return 0;
}
