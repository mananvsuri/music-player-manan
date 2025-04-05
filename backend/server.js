const express = require('express');
const mysql = require('mysql2');
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
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'manan04$',
  database: 'spotify'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
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
    const sql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
    db.query(sql, [email, hashedPassword, name], (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send('Error registering user');
      }
      res.send('User registered successfully');
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).send('Error registering user');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error during login query:", err);
      return res.status(500).send('Server error');
    }
    
    if (results.length === 0) {
      return res.status(401).send('Invalid credentials');
    }
    
    try {
      const validPassword = await bcrypt.compare(password, results[0].password);
      if (!validPassword) {
        return res.status(401).send('Invalid credentials');
      }
      res.send('Login successful');
    } catch (error) {
      console.error("Password comparison error:", error);
      res.status(500).send('Server error');
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});