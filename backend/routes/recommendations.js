const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/books', async (req, res) => {
  const top_n = parseInt(req.query.top_n) || 10;
  try {
    const [rows] = await pool.query('CALL sp_get_book_recommendations(?, ?)', [req.user.user_id, top_n]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/movies', async (req, res) => {
  const top_n = parseInt(req.query.top_n) || 10;
  try {
    const [rows] = await pool.query('CALL sp_get_movie_recommendations(?, ?)', [req.user.user_id, top_n]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/travel', async (req, res) => {
  const top_n = parseInt(req.query.top_n) || 10;
  try {
    const [rows] = await pool.query('CALL sp_get_travel_recommendations(?, ?)', [req.user.user_id, top_n]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
