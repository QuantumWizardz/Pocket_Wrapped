const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const csv = require('csv-parser');
require('dotenv').config();

async function importTravel() {
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
    const [tagRows] = await pool.query('SELECT tag_id, tag_name FROM travel_tags_master');
    const tagMap = {};
    for (const tag of tagRows) {
      tagMap[tag.tag_name] = tag.tag_id;
    }

    const destinations = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../world_cities_1000.csv'))
        .pipe(csv())
        .on('data', (data) => destinations.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Loaded ${destinations.length} destinations from world_cities_1000.csv`);

    // Clean up existing data
    await pool.query('DELETE FROM destination_item_tags');
    await pool.query('DELETE FROM destinations');
    await pool.query('ALTER TABLE destinations AUTO_INCREMENT = 1');

    let insertedCount = 0;

    for (const dest of destinations) {
      try {
        const name = dest.Name;
        const category = dest.Category;
        const subCategory = dest['Sub-Category'];
        const popularity = parseInt(dest.Popularity, 10);
        
        const [result] = await pool.query(
          'INSERT INTO destinations (name, category, sub_category, popularity) VALUES (?, ?, ?, ?)',
          [name, category, subCategory, popularity]
        );
        
        const destId = result.insertId;
        
        const rawTags = dest.Tags;
        if (rawTags) {
          const tagList = rawTags.split(',').map(t => t.trim()).filter(t => t);
          
          if (tagList.length > 0) {
            const tagValues = [];
            for (const tagName of tagList) {
              const tagId = tagMap[tagName];
              if (tagId) {
                tagValues.push([destId, tagId]);
              } else {
                console.warn(`Warning: Tag "${tagName}" not found in travel_tags_master for destination "${name}"`);
              }
            }
            
            if (tagValues.length > 0) {
              await pool.query(
                'INSERT INTO destination_item_tags (destination_id, tag_id) VALUES ?',
                [tagValues]
              );
            }
          }
        }
        
        insertedCount++;
        if (insertedCount % 50 === 0) {
          console.log(`Inserted ${insertedCount} destinations...`);
        }
      } catch (err) {
        console.error(`Failed to insert destination "${dest.Name}":`, err.message);
      }
    }

    console.log(`Successfully inserted ${insertedCount} out of ${destinations.length} destinations.`);
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await pool.end();
  }
}

importTravel();
