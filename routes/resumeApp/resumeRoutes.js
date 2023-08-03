const mysql = require('mysql2/promise');
const fs = require('fs');
const toml = require('toml');

const express = require('express');
const router = express.Router();

// Read the config file
config = toml.parse(fs.readFileSync('/home/ubuntu/projects/config.toml', 'utf-8'));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: config['resume']['host'],
  user: config['resume']['user'],
  password: config['resume']['password'],
  database: config['resume']['database'],
  waitForConnections: true,
  connectionLimit: 10,
});

// Get
router.get('/api/resume', async (req, res) => {
    // Check if the 'x-api-key' header is present in the request
    if (req.headers['x-api-key'] !== config['resume']["API_KEY"]) {
      return res.status(401).json({ error: 'API key is missing/incorrect in the request header' });
    }
    try {
      const [rows] = await pool.query('SELECT * FROM projects');
      return res.json(rows);
    } catch (error) {
      console.error('Error retrieving projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
