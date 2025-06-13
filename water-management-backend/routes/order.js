const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware/auth');  // <-- destructure here

// Create new order
router.post('/', authenticateJWT, async (req, res) => {
  console.log('🔥 POST /api/orders called'); 
  const {
    provider_id,
    product_id,
    quantity,
    total_price,
    delivery_address,
    delivery_location,
    special_instructions,
    preferred_contact_method
  } = req.body;

  try {
    const newOrder = await pool.query(
      `INSERT INTO orders (
        consumer_id,
        provider_id,
        product_id,
        quantity,
        total_price,
        delivery_address,
        delivery_location,
        special_instructions,
        status,
        preferred_contact_method
      ) VALUES ($1, $2, $3, $4, $5, $6, POINT($7, $8), $9, 'pending', $10) RETURNING *`,
      [
        req.user.id, // from JWT
        provider_id,
        product_id,
        quantity,
        total_price,
        delivery_address,
        delivery_location[0], // latitude
        delivery_location[1], // longitude
        special_instructions || null,
        preferred_contact_method || null
      ]
    );

    res.status(201).json(newOrder.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
