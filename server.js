const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory "Datenbank"
const users = {};

// Admin: Tokens hinzufügen
app.post("/addtokens", (req, res) => {
  const { player, amount } = req.body;
  if (!player || !amount) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }

  if (!users[player]) users[player] = 0;
  users[player] += amount;

  res.json({ success: true, balance: users[player] });
});

// Slot-Logik
const reel = ["🍒","🍒","🍒","🍒","🍒","🍒","🔔","🔔","🔔","⭐","⭐","💎"];
const multipliers = { "🍒":2, "🔔":5, "⭐":10, "💎":50 };

function spin() {
  return reel[Math.floor(Math.random() * reel.length)];
}

app.post("/spin", (req, res) => {
  const { player, bet } = req.body;

  if (!users[player] || users[player] < bet) {
    return res.status(400).json({ error: "Nicht genug Tokens" });
  }

  users[player] -= bet;

  const a = spin();
  const b = spin();
  const c = spin();

  let win = 0;
  if (a === b && b === c) {
    win = bet * multipliers[a];
    users[player] += win;
  }

  res.json({
    symbols: [a, b, c],
    win,
    balance: users[player]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend läuft auf Port " + PORT);
});
