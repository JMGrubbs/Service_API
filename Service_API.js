const express = require('express');
const cors = require('cors');
const app = express();
const env = require("./env.js")

let port = env["PORT"]

app.use(cors());
app.use(express.json());

// Import your route files
const todoRouter = require('./routes/todosApp/todoRoutes');
const resumeRouter = require('./routes/resumeApp/resumeRoutes');

// Use the route files with their respective base paths
app.use('/', todoRouter);
app.use('/', resumeRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
