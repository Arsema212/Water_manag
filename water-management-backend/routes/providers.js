const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors')
const auth = require('../middleware/auth');

// Get provider by user ID
// router.get('/:userId', auth, async (req, res) => {
//     try {
//         const provider = await pool.query(
//             `SELECT p.*, u.email, u.phone, u.address 
//              FROM providers p
//              JOIN users u ON p.user_id = u.user_id
//              WHERE p.user_id = $1`,
//             [req.params.userId]
//         );

//         if (provider.rows.length === 0) {
//             return res.status(404).json({ message: 'Provider not found' });
//         }

//         // Get certifications
//         const certifications = await pool.query(
//             'SELECT * FROM provider_certifications WHERE provider_id = $1',
//             [provider.rows[0].provider_id]
//         );

//         res.json({
//             ...provider.rows[0],
//             certifications: certifications.rows
//         });

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// GET /api/providers — list all basic provider info
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        user_id,
        username,
        email,
        phone,
        address,
        profile_photo_url,
        user_type,
        created_at,
        updated_at,
        location[0] AS latitude,
        location[1] AS longitude
      FROM users
      WHERE user_type = 'provider'
    `);

    const providers = rows.map(row => ({
      ...row,
      location: [row.latitude, row.longitude]
    }));
     console.log("✅ Providers fetched:", providers);
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching providers" });
  }
});



module.exports = router;