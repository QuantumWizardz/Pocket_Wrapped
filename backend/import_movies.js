const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const csv = require('csv-parser');
require('dotenv').config();

async function importMovies() {
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
    const [tagRows] = await pool.query('SELECT tag_id, tag_name FROM movie_tags_master');
    const tagMap = {};
    for (const tag of tagRows) {
      tagMap[tag.tag_name] = tag.tag_id;
    }

    const movies = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../top_1000_movies.csv'))
        .pipe(csv())
        .on('data', (data) => movies.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Loaded ${movies.length} movies from top_1000_movies.csv`);

    // Clean up existing data
    await pool.query('DELETE FROM movie_item_tags');
    await pool.query('DELETE FROM movies');
    await pool.query('ALTER TABLE movies AUTO_INCREMENT = 1');

    let insertedCount = 0;

    for (const movie of movies) {
      try {
        const title = movie.Title;
        const duration = parseInt(movie['Duration (Minutes)'], 10);
        const genre = movie.Genre;
        const subGenre = movie['Sub-Genre'];
        const popularity = parseInt(movie.Popularity, 10);
        
        const [result] = await pool.query(
          'INSERT INTO movies (title, genre, sub_genre, duration_minutes, popularity) VALUES (?, ?, ?, ?, ?)',
          [title, genre, subGenre, duration, popularity]
        );
        
        const movieId = result.insertId;
        
        let rawTags = movie.Tags;
        if (rawTags) {
          rawTags = rawTags.replace(/^\[|\]$/g, '').replace(/'/g, '');
          const tagList = rawTags.split(',').map(t => t.trim()).filter(t => t);
          
          if (tagList.length > 0) {
            const tagValues = [];
            for (const tagName of tagList) {
              const tagId = tagMap[tagName];
              if (tagId) {
                tagValues.push([movieId, tagId]);
              } else {
                console.warn(`Warning: Tag "${tagName}" not found in movie_tags_master for movie "${title}"`);
              }
            }
            
            if (tagValues.length > 0) {
              await pool.query(
                'INSERT INTO movie_item_tags (movie_id, tag_id) VALUES ?',
                [tagValues]
              );
            }
          }
        }
        
        insertedCount++;
        if (insertedCount % 50 === 0) {
          console.log(`Inserted ${insertedCount} movies...`);
        }
      } catch (err) {
        console.error(`Failed to insert movie "${movie.Title}":`, err.message);
      }
    }

    console.log(`Successfully inserted ${insertedCount} out of ${movies.length} movies.`);
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await pool.end();
  }
}

importMovies();
