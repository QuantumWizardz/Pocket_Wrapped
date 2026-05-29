const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// POST /books
router.post('/books', async (req, res) => {
  const { title, author, genre, sub_genre, popularity, tags } = req.body;
  if (!title || !genre || !sub_genre) return res.status(400).json({ error: 'Missing required fields' });
  
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO books (title, author, genre, sub_genre, popularity) VALUES (?, ?, ?, ?, ?)',
      [title, author || null, genre, sub_genre, popularity || 50]
    );
    const bookId = result.insertId;

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags.slice(0, 3).map(tagId => [bookId, tagId]);
      await conn.query('INSERT INTO book_item_tags (book_id, tag_id) VALUES ?', [tagValues]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Book created successfully', book_id: bookId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
});

// POST /movies
router.post('/movies', async (req, res) => {
  const { title, genre, sub_genre, duration_minutes, popularity, tags } = req.body;
  if (!title || !genre || !sub_genre || !duration_minutes) return res.status(400).json({ error: 'Missing required fields' });
  
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO movies (title, genre, sub_genre, duration_minutes, popularity) VALUES (?, ?, ?, ?, ?)',
      [title, genre, sub_genre, duration_minutes, popularity || 50]
    );
    const movieId = result.insertId;

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags.slice(0, 3).map(tagId => [movieId, tagId]);
      await conn.query('INSERT INTO movie_item_tags (movie_id, tag_id) VALUES ?', [tagValues]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Movie created successfully', movie_id: movieId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
});

// POST /travel
router.post('/travel', async (req, res) => {
  const { name, category, sub_category, popularity, tags } = req.body;
  if (!name || !category || !sub_category) return res.status(400).json({ error: 'Missing required fields' });
  
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO destinations (name, category, sub_category, popularity) VALUES (?, ?, ?, ?)',
      [name, category, sub_category, popularity || 50]
    );
    const destId = result.insertId;

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags.slice(0, 3).map(tagId => [destId, tagId]);
      await conn.query('INSERT INTO destination_item_tags (destination_id, tag_id) VALUES ?', [tagValues]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Destination created successfully', destination_id: destId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
