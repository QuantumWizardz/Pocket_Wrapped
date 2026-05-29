const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/:year', authMiddleware, async (req, res) => {
  const year = parseInt(req.params.year);
  if (isNaN(year)) {
    return res.status(400).json({ error: 'Invalid year' });
  }

  try {
    await pool.query('CALL sp_generate_yearly_insights(?, ?, @result)', [req.user.user_id, year]);
    const [rows] = await pool.query('SELECT @result AS result');
    
    if (rows && rows.length > 0 && rows[0].result) {
      let resultObj = rows[0].result;
      if (typeof resultObj === 'string') {
        resultObj = JSON.parse(resultObj);
      }

      // Fetch additional data for dynamic captions
      const queries = [
        pool.query(`SELECT b.genre FROM event_logs el JOIN books b ON el.content_id = b.book_id WHERE el.user_id = ? AND el.content_type='book' AND YEAR(el.logged_at) = ? GROUP BY b.genre ORDER BY COUNT(*) DESC LIMIT 1`, [req.user.user_id, year]),
        pool.query(`SELECT m.title FROM event_logs el JOIN movies m ON el.content_id = m.movie_id WHERE el.user_id = ? AND el.content_type='movie' AND YEAR(el.logged_at) = ? GROUP BY m.movie_id, m.title ORDER BY COUNT(*) DESC LIMIT 1`, [req.user.user_id, year]),
        pool.query(`SELECT m.genre FROM event_logs el JOIN movies m ON el.content_id = m.movie_id WHERE el.user_id = ? AND el.content_type='movie' AND YEAR(el.logged_at) = ? GROUP BY m.genre ORDER BY COUNT(*) DESC LIMIT 1`, [req.user.user_id, year]),
        pool.query(`SELECT d.category FROM event_logs el JOIN destinations d ON el.content_id = d.destination_id WHERE el.user_id = ? AND el.content_type='travel' AND YEAR(el.logged_at) = ? GROUP BY d.category ORDER BY COUNT(*) DESC LIMIT 1`, [req.user.user_id, year])
      ];

      const [ [topBookGenreRows], [topMovieRows], [topMovieGenreRows], [topTravelCatRows] ] = await Promise.all(queries);

      resultObj.top_book_genre = topBookGenreRows.length > 0 ? topBookGenreRows[0].genre : 'various';
      resultObj.top_movie = topMovieRows.length > 0 ? topMovieRows[0].title : 'something amazing';
      resultObj.top_movie_genre = topMovieGenreRows.length > 0 ? topMovieGenreRows[0].genre : 'various';
      resultObj.top_travel_category = topTravelCatRows.length > 0 ? topTravelCatRows[0].category : 'various';

      res.json(resultObj);
    } else {
      res.status(404).json({ error: 'No data found for this year' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
