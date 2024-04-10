require('dotenv').config();
//const cors = require('cors');
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const app = express();
app.use(express.json());
//app.use(cors({origin: 'http://10.0.2.2:8082'}));

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const connectToDatabase = () => {
  return new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) {
        console.error('Error connecting to the database: ', err);
        reject(err);
      } else {
        console.log('Connected to the database');
        resolve();
      }
    });
  });
};

app.get('/', async (req, res, next) => {
  try {
    db.query('SELECT * FROM speakapp.users', (err, results) => {
      if (err) {
        next(err);
      } else {
        const plainResults = JSON.parse(JSON.stringify(results));
        res.send(plainResults);
        console.log(plainResults);
      }
    });
  } catch (err) {
    next(err);
  }
});
app.post('/register', async (req, res, next) => {
  try {
    const { username, password, confirmPassword, email } = req.body;
    console.log(req.body);

    // Perform the same validation checks as in Register.js
    if (!username || !password || !confirmPassword || !email) {
      return res.status(400).send('All fields are required');
    }

    if (password.length < 8) {
      return res.status(400).send('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password) && !/[!@#$%^&*]/.test(password)) {
      return res.status(400).send('Password must contain at least one capital letter and at least one special character');
    }

    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match');
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send('Email is not valid');
    }

    // If the validation checks pass, hash the password and store the user information in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('INSERT INTO speakapp.users (user_name, password, email,role, parent_ID) VALUES (?, ?, ?,?,?)', [username, hashedPassword, email,'Parent', null]);
    res.send('User registered successfully');
  } catch (err) {
    next(err);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Query the database for the user with the provided username
    db.query('SELECT * FROM speakapp.users WHERE user_name = ?', [username], async (err, results) => {
      if (err) {
        next(err);
      } else {
        const user = results[0];

        // If the user doesn't exist, send an error response
        if (!user) {
          return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // Compare the provided password with the stored password
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If the passwords match, send a success response
        if (passwordMatch) {
          return res.json({ success: true, message: 'Login successful' });
        } else {
          // If the passwords don't match, send an error response
          return res.status(400).json({ success: false, message: 'Incorrect password' });
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error('Server error: ', err);
  res.status(500).send(`Server error: ${err.message}`);
});

const startServer = async () => {
  try {
    await connectToDatabase();
    const port = process.env.PORT || 8082;
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server: ', err);
  }
};

startServer();