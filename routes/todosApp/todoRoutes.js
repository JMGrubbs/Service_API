const mysql = require('mysql2/promise');
const fs = require('fs');
const toml = require('toml');

const express = require('express');
const router = express.Router();

// Read the config file
config = toml.parse(fs.readFileSync('/home/ubuntu/projects/config.toml', 'utf-8'));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: config['todoInfo']['host'],
  user: config['todoInfo']['user'],
  password: config['todoInfo']['password'],
  database: config['todoInfo']['database'],
  waitForConnections: true,
  connectionLimit: 10,
});

// Get all todos
router.get('/api/todos', async (req, res) => {
  // Check if the 'x-api-key' header is present in the request
  if (req.headers['x-api-key'] !== config['todoInfo']["API_KEY"]) {
    return res.status(401).json({ error: 'API key is missing/incorrect in the request header' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM todos');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new todo
router.post('/api/todos', async (req, res) => {
  // Check if the 'x-api-key' header is present in the request
  if (req.headers['x-api-key'] !== config['todoInfo']['API_KEY']) {
    return res.status(401).json({ error: 'API key is missing or invalid in the request header' });
  }
  
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    // Insert the new todo into the database
    const result = await pool.query('INSERT INTO todos (title) VALUES (?)', [title]);
    // Get the auto-generated ID of the newly inserted row
    const newTodoId = result[0].insertId;
    // Fetch the newly created todo from the database using the ID
    const [newTodo] = await pool.query('SELECT * FROM todos WHERE id = ?', [newTodoId]);
    // Respond with the newly created todo in the response
    res.status(201).json(newTodo[0]);
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// // Update the completion status of a todo
router.patch('/api/todos/:id', async (req, res) => {
  // Check if the 'x-api-key' header is present in the request
  if (req.headers['x-api-key'] !== config['todoInfo']["API_KEY"]) {
    return res.status(401).json({ error: 'API key is missing in the request header' });
  }
  const { id } = req.params;
  const { completed } = req.body;
  console.log(req)
  try {
    await pool.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// // Delete a todo
router.delete('/api/todos/delete/:id', async (req, res) => {
  // Check if the 'x-api-key' header is present in the request
  if (req.headers['x-api-key'] !== config['todoInfo']["API_KEY"]) {
    return res.status(401).json({ error: 'API key is missing in the request header' });
  }
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM todos WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
