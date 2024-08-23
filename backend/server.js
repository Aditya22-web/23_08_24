const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Player schema
const playerSchema = new mongoose.Schema({
  name: String,
  id: String,
  battingStats: Object,
  bowlingStats: Object
});

const Player = mongoose.model('Player', playerSchema);

// API endpoint to fetch player stats
app.get('/api/player-stats', async (req, res) => {
  try {
    const { playerName } = req.query;

    // Check if player exists in database
    let player = await Player.findOne({ name: playerName });

    if (!player) {
      // Fetch player ID
      const playerIdResponse = await axios.get(`https://cricapi.com/api/playerFinder?apikey=${process.env.CRICAPI_KEY}&name=${playerName}`);
      const playerId = playerIdResponse.data.data[0]?.pid;

      if (!playerId) {
        return res.status(404).json({ message: 'Player not found' });
      }

      // Fetch batting and bowling stats
      const battingStatsResponse = await axios.get(`https://api.cricapi.com/v1/players_info?apikey=9673d73c4emsh2baa879c5f2b5fdp1f952bjsnd0d83d1664ee&id=${playerId}`);
      const bowlingStatsResponse = await axios.get(`https://api.cricapi.com/v1/players_info?apikey=9673d73c4emsh2baa879c5f2b5fdp1f952bjsnd0d83d1664ee&id=${playerId}`);

      // Create new player in database
      player = new Player({
        name: playerName,
        id: playerId,
        battingStats: battingStatsResponse.data.data.batting,
        bowlingStats: bowlingStatsResponse.data.data.bowling
      });

      await player.save();
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Error fetching player stats' });
  }
});

// API endpoint to suggest best 11 players
app.post('/api/suggest-team', async (req, res) => {
  try {
    const { players, pitchReport } = req.body;

    // Fetch stats for all players
    const playersWithStats = await Promise.all(players.map(async (playerName) => {
      const player = await Player.findOne({ name: playerName });
      return player || { name: playerName, battingStats: {}, bowlingStats: {} };
    }));

    // TODO: Implement logic to select best 11 players based on stats and pitch report
    const bestEleven = selectBestEleven(playersWithStats, pitchReport);

    // TODO: Implement logic to suggest captain and vice-captain
    const { captain, viceCaptain } = suggestCaptainAndViceCaptain(bestEleven);

    res.json({ bestEleven, captain, viceCaptain });
  } catch (error) {
    console.error('Error suggesting team:', error);
    res.status(500).json({ message: 'Error suggesting team' });
  }
});

// Helper function to select best 11 players (placeholder implementation)
function selectBestEleven(players, pitchReport) {
  // TODO: Implement actual logic based on player stats and pitch report
  return players.slice(0, 11);
}

// Helper function to suggest captain and vice-captain (placeholder implementation)
function suggestCaptainAndViceCaptain(bestEleven) {
  // TODO: Implement actual logic based on player stats and experience
  return { captain: bestEleven[0], viceCaptain: bestEleven[1] };
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
