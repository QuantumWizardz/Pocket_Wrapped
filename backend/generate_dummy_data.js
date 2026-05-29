const mysql = require('mysql2/promise');
require('dotenv').config();

async function generateData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'content_analytics',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const username = 'rajatverma0901';

    // 1. Get user_id
    const [userRows] = await pool.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if (userRows.length === 0) {
      console.error(`User ${username} not found! Please ensure the account exists.`);
      return;
    }
    const userId = userRows[0].user_id;
    console.log(`Found user ${username} with ID ${userId}`);

    // 2. Fetch all valid content IDs
    const [books] = await pool.query('SELECT book_id FROM books');
    const [movies] = await pool.query('SELECT movie_id FROM movies');
    const [travels] = await pool.query('SELECT destination_id FROM destinations');

    if (books.length === 0 || movies.length === 0 || travels.length === 0) {
      console.error('One or more content tables are empty! Ensure data is imported first.');
      return;
    }

    const bookIds = books.map(b => b.book_id);
    const movieIds = movies.map(m => m.movie_id);
    const travelIds = travels.map(t => t.destination_id);

    // Helper functions
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomDateInMonth = (year, month) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let maxDay = daysInMonth;
      if (year === 2026 && month === 4) maxDay = 4; // up to May 4th 2026
      const day = getRandomInt(1, maxDay);
      const hour = getRandomInt(8, 23);
      const minute = getRandomInt(0, 59);
      const second = getRandomInt(0, 59);
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    };

    // 3. Generate events chronologically
    const allEvents = [];
    const contentTypes = ['book', 'movie', 'travel'];

    for (let year = 2024; year <= 2026; year++) {
      const startMonth = 0; // Jan
      const endMonth = year === 2026 ? 4 : 11; // up to May 2026

      for (let month = startMonth; month <= endMonth; month++) {
        const eventsThisMonth = getRandomInt(5, 15);
        for (let i = 0; i < eventsThisMonth; i++) {
          const cType = getRandomElement(contentTypes);
          let cId, eType, duration;
          const rating = getRandomInt(1, 10) > 2 ? getRandomInt(3, 5) : getRandomInt(1, 2); // Mostly positive

          if (cType === 'book') {
            cId = getRandomElement(bookIds);
            eType = 'completed';
            duration = getRandomInt(200, 800); // Minutes
          } else if (cType === 'movie') {
            cId = getRandomElement(movieIds);
            eType = 'watched';
            duration = 0; // Trigger will fill this based on movie_id
          } else {
            cId = getRandomElement(travelIds);
            eType = 'visited';
            duration = getRandomInt(2, 14); // Days
          }

          const loggedAt = getRandomDateInMonth(year, month);
          
          allEvents.push({
            user_id: userId,
            content_type: cType,
            content_id: cId,
            event_type: eType,
            duration: duration,
            rating: rating,
            logged_at: loggedAt,
            timestamp: new Date(loggedAt).getTime()
          });
        }
      }
    }

    // Sort chronologically
    allEvents.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`Generated ${allEvents.length} events. Inserting into database chronologically...`);

    let inserted = 0;
    for (const ev of allEvents) {
       await pool.query(
         'INSERT INTO event_logs (user_id, content_type, content_id, event_type, duration, rating, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
         [ev.user_id, ev.content_type, ev.content_id, ev.event_type, ev.duration, ev.rating, ev.logged_at]
       );
       inserted++;
    }

    console.log(`Successfully inserted ${inserted} chronological event logs for user ${username}.`);
  } catch (err) {
    console.error('Error generating data:', err);
  } finally {
    await pool.end();
  }
}

generateData();
