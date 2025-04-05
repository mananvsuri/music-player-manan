const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'manan04$',
  database: process.env.DB_NAME || 'spotify',
  port: process.env.DB_PORT || 5432
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    return;
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '../')));

// Route to list song directories
app.get('/songs/', (req, res) => {
  const dirPath = path.join(__dirname, '../songs');
  
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Error reading songs directory:", err);
      return res.status(500).send('Error reading songs directory');
    }
    
    // Send directory listing in HTML format that matches what fetch expects
    let html = '<html><body><ul>';
    files.forEach(file => {
      const stat = fs.statSync(path.join(dirPath, file));
      if (stat.isDirectory()) {
        html += `<li><a href="/songs/${file}/">${file}/</a></li>`;
      }
    });
    html += '</ul></body></html>';
    
    res.send(html);
  });
});

// Route to list songs in a specific genre/folder
app.get('/songs/:genre/', (req, res) => {
  const { genre } = req.params;
  const dirPath = path.join(__dirname, '../songs', genre);
  
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${genre}:`, err);
      return res.status(500).send('Error reading directory');
    }
    
    // Send directory listing in HTML format that matches what fetch expects
    let html = '<html><body><ul>';
    files.forEach(file => {
      html += `<li><a href="/songs/${genre}/${file}">${file}</a></li>`;
    });
    html += '</ul></body></html>';
    
    res.send(html);
  });
});

// Route to serve song files and information
app.get('/songs/:genre/:file', (req, res) => {
  const { genre, file } = req.params;
  const filePath = path.join(__dirname, '../songs', genre, file);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Auth routes
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, name]
    );
    res.send('User registered successfully');
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).send('Invalid credentials');
    }
    
    const validPassword = await bcrypt.compare(password, result.rows[0].password);
    if (!validPassword) {
      return res.status(401).send('Invalid credentials');
    }
    res.send('Login successful');
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});