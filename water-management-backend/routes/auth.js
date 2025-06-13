const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Registration
router.post('/register', async (req, res) => {
    const { email, username, password, phone, address, location, user_type = 'consumer' } = req.body;

    try {
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users 
            (username, email, password_hash, phone, address, location, user_type) 
            VALUES ($1, $2, $3, $4, $5, ST_MakePoint($6, $7), $8) 
            RETURNING user_id, username, email, user_type, phone, address, created_at`,
            [
                username,
                email,
                hashedPassword,
                phone || null,
                address || null,
                location?.lng || null,
                location?.lat || null,
                user_type
            ]
        );

        console.log('DB result:', newUser);
        console.log('Inserted row:', newUser.rows[0]);

        console.log('User created:', newUser.rows[0]);

        res.status(201).json({
            message: 'User created successfully',
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error('Registration error:', err.stack);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});


router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body.email); // Debug log
    try {
        const { email, password } = req.body;
        
        // 1. Find user
        const user = await pool.query(
            `SELECT user_id, email, password_hash, user_type 
             FROM users WHERE email = $1`,
            [email]
        );
        
        console.log('User found:', user.rows[0]?.email); // Debug log

        // 2. Validate
        if (user.rows.length === 0) {
            console.log('User not found'); // Debug
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isValid) {
            console.log('Invalid password for:', email); // Debug
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 3. Generate token
        const token = jwt.sign(
            { userId: user.rows[0].user_id, userType: user.rows[0].user_type },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful for:', email); // Debug
        res.json({ 
            token: token,
            userType: user.rows[0].user_type 
        });

    } catch (err) {
        console.error('Login error:', err.message); // Detailed error
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;