const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importBooks() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'content_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../books_data.json'));
    const books = JSON.parse(rawData);
    
    console.log(`Loaded ${books.length} books from books_data.json`);

    // Get tag mapping
    const [tagRows] = await pool.query('SELECT tag_id, tag_name FROM book_tags_master');
    const tagMap = {};
    for (const tag of tagRows) {
      tagMap[tag.tag_name] = tag.tag_id;
    }

    let insertedCount = 0;
    
    // We'll insert in a loop or batch. Let's do it individually for simplicity and error handling.
    await pool.query('DELETE FROM book_item_tags');
    await pool.query('DELETE FROM books');
    await pool.query('ALTER TABLE books AUTO_INCREMENT = 1');

    for (const book of books) {
      try {
        const [result] = await pool.query(
          'INSERT INTO books (title, author, genre, sub_genre) VALUES (?, ?, ?, ?)',
          [book.Title, book.Author, book.Genre, book['Sub-Genre']]
        );
        
        const bookId = result.insertId;
        
        if (book.Tags && book.Tags.length > 0) {
          const tagValues = [];
          for (const tagName of book.Tags) {
            const tagId = tagMap[tagName];
            if (tagId) {
              tagValues.push([bookId, tagId]);
            } else {
              console.warn(`Warning: Tag "${tagName}" not found in book_tags_master for book "${book.Title}"`);
            }
          }
          
          if (tagValues.length > 0) {
            await pool.query(
              'INSERT INTO book_item_tags (book_id, tag_id) VALUES ?',
              [tagValues]
            );
          }
        }
        
        insertedCount++;
        if (insertedCount % 50 === 0) {
          console.log(`Inserted ${insertedCount} books...`);
        }
      } catch (err) {
        console.error(`Failed to insert book "${book.Title}":`, err.message);
      }
    }

    console.log(`Successfully inserted ${insertedCount} out of ${books.length} books.`);
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await pool.end();
  }
}

importBooks();
