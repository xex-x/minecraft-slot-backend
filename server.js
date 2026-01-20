const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

// Datenbank vorbereiten
db.run(
  CREATE TABLE IF NOT EXISTS users (
    minecraft_name TEXT PRIMARY KEY,
    tokens INTEGER
  )
);

// Admin: Tokens hinzufügen
app.post("/addtokens", (req, res) => {
  const { player, amount } = req.body;
  if (!player  !amount) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }

  db.run(
    INSERT INTO users (minecraft_name, tokens)
     VALUES (?, ?)
     ON CONFLICT(minecraft_name)
     DO UPDATE SET tokens = tokens + ?,
    [player, amount, amount],
    () => {
      res.json({ success: true });
    }
  );
});

// Slot-Spin
const reel = ["🍒","🍒","🍒","🍒","🍒","🍒","🔔","🔔","🔔","⭐","⭐","💎"];
const multipliers = { "🍒":2, "🔔":5, "⭐":10, "💎":50 };

function spin() {
  return reel[Math.floor(Math.random() * reel.length)];
}

app.post("/spin", (req, res) => {
  const { player, bet } = req.body;

  db.get(
    SELECT tokens FROM users WHERE minecraft_name = ?,
    [player],
    (err, row) => {
      if (!row  row.tokens < bet) {
        return res.status(400).json({ error: "Nicht genug Tokens" });
      }

      const a = spin();
      const b = spin();
      const c = spin();

      let win = 0;
      if (a === b && b === c) {
        win = bet * multipliers[a];
      }

      const newBalance = row.tokens - bet + win;

      db.run(
        UPDATE users SET tokens = ? WHERE minecraft_name = ?,
        [newBalance, player]
      );

      res.json({
        symbols: [a, b, c],
        win,
        balance: newBalance
      });
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend läuft auf Port " + PORT);
});
