const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /events/stats (Dashboard Stat Cards)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN content_type = 'book' THEN duration ELSE 0 END) AS book_minutes,
        SUM(CASE WHEN content_type = 'movie' THEN duration ELSE 0 END) AS movie_minutes,
        SUM(CASE WHEN content_type = 'travel' THEN duration ELSE 0 END) AS travel_days,
        MAX(logged_at) AS last_activity
      FROM event_logs
      WHERE user_id = ?
    `, [req.user.user_id]);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /events/distribution (Dashboard Category Distribution)
router.get('/distribution', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        content_type,
        COUNT(*) AS event_count,
        SUM(duration) AS total_duration
      FROM event_logs
      WHERE user_id = ?
      GROUP BY content_type
    `, [req.user.user_id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /events/performance (Dashboard Performance Chart)
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(logged_at, '%Y-%m-%d') as date,
        COUNT(*) as count
      FROM event_logs
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(logged_at, '%Y-%m-%d')
      ORDER BY date ASC
    `, [req.user.user_id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /events/subdistribution/:type
router.get('/subdistribution/:type', authMiddleware, async (req, res) => {
  const { type } = req.params;
  try {
    let query = '';
    if (type === 'book') {
      query = "SELECT b.sub_genre as sub_category, COUNT(*) as event_count FROM event_logs el JOIN books b ON el.content_id = b.book_id WHERE el.user_id = ? AND el.content_type = 'book' GROUP BY b.sub_genre";
    } else if (type === 'movie') {
      query = "SELECT m.sub_genre as sub_category, COUNT(*) as event_count FROM event_logs el JOIN movies m ON el.content_id = m.movie_id WHERE el.user_id = ? AND el.content_type = 'movie' GROUP BY m.sub_genre";
    } else if (type === 'travel') {
      query = "SELECT d.sub_category as sub_category, COUNT(*) as event_count FROM event_logs el JOIN destinations d ON el.content_id = d.destination_id WHERE el.user_id = ? AND el.content_type = 'travel' GROUP BY d.sub_category";
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    const [rows] = await pool.query(query, [req.user.user_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /events/content/:type
router.get('/content/:type', authMiddleware, async (req, res) => {
  const { type } = req.params;
  try {
    if (type === 'book') {
      const [rows] = await pool.query('SELECT book_id as id, title as name, author as extra_info FROM books ORDER BY title');
      return res.json(rows);
    } else if (type === 'movie') {
      const [rows] = await pool.query('SELECT movie_id as id, title as name, duration_minutes as extra_info FROM movies ORDER BY title');
      return res.json(rows);
    } else if (type === 'travel') {
      const [rows] = await pool.query('SELECT destination_id as id, name as name FROM destinations ORDER BY name');
      return res.json(rows);
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /events (Recent activity)
router.get('/', authMiddleware, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const [rows] = await pool.query(`
      SELECT
        el.event_id,
        el.content_type,
        CASE el.content_type
          WHEN 'book'   THEN (SELECT title FROM books        WHERE book_id        = el.content_id)
          WHEN 'movie'  THEN (SELECT title FROM movies       WHERE movie_id       = el.content_id)
          WHEN 'travel' THEN (SELECT name  FROM destinations WHERE destination_id = el.content_id)
        END AS content_name,
        el.logged_at,
        el.duration,
        el.rating
      FROM event_logs el
      WHERE el.user_id = ?
      ORDER BY el.logged_at DESC
      LIMIT ?
    `, [req.user.user_id, limit]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /events (Log event)
router.post('/', authMiddleware, async (req, res) => {
  const { content_type, content_id, event_type, duration, rating } = req.body;
  if (!content_type || !content_id || !event_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate event_type against content_type
  if (content_type === 'book' && event_type !== 'completed') return res.status(400).json({ error: "Books must be 'completed'" });
  if (content_type === 'movie' && event_type !== 'watched') return res.status(400).json({ error: "Movies must be 'watched'" });
  if (content_type === 'travel' && event_type !== 'visited') return res.status(400).json({ error: "Travel must be 'visited'" });

  if (content_type === 'travel' && !duration) {
    return res.status(400).json({ error: "Duration (in days) is required for travel" });
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO event_logs (user_id, content_type, content_id, event_type, duration, rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.user_id, content_type, content_id, event_type, duration || null, rating || null]);
    
    res.status(201).json({ message: 'Event logged successfully', event_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /events/:event_id/rating
router.patch('/:event_id/rating', authMiddleware, async (req, res) => {
  const { rating } = req.body;
  const eventId = req.params.event_id;
  
  if (rating === undefined || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // First, update the rating
    const [result] = await pool.query('UPDATE event_logs SET rating = ? WHERE event_id = ? AND user_id = ?', [rating, eventId, req.user.user_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found or not owned by user' });
    }

    // Then, fetch the content type to recompute preferences via the stored procedure
    // Triggers only fire on INSERT/UPDATE, but our trigger is only AFTER INSERT.
    // So we manually call the procedure here.
    const [events] = await pool.query('SELECT content_type FROM event_logs WHERE event_id = ?', [eventId]);
    if (events.length > 0) {
      const cType = events[0].content_type;
      if (cType === 'book') await pool.query('CALL sp_update_book_preferences(?)', [req.user.user_id]);
      if (cType === 'movie') await pool.query('CALL sp_update_movie_preferences(?)', [req.user.user_id]);
      if (cType === 'travel') await pool.query('CALL sp_update_travel_preferences(?)', [req.user.user_id]);
    }

    res.json({ message: 'Rating updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
