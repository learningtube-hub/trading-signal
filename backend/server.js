const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Demo crypto signals
const signals = [
  {
    id: 1,
    pair: "BTCUSDT",
    type: "BUY",
    entry: 65000,
    tp: 67000,
    sl: 64000,
    status: "ACTIVE"
  },
  {
    id: 2,
    pair: "ETHUSDT",
    type: "SELL",
    entry: 3200,
    tp: 3000,
    sl: 3300,
    status: "ACTIVE"
  }
];

// Get all signals
app.get("/signals", (req, res) => {
  res.json(signals);
});

// Get single signal
app.get("/signals/:id", (req, res) => {
  const signal = signals.find(s => s.id == req.params.id);
  res.json(signal);
});

// Start server
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
