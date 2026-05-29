-- 01_schema.sql

-- USE content_analytics;

-- ==========================================
-- SHARED TABLES
-- ==========================================

CREATE TABLE users (
  user_id     INT PRIMARY KEY AUTO_INCREMENT,
  username    VARCHAR(100) NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth (
  auth_id        INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE event_logs (
  event_id      INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  content_type  ENUM('book','movie','travel') NOT NULL,
  content_id    INT NOT NULL,
  event_type    ENUM('completed','watched','visited') NOT NULL,
  duration      INT NOT NULL,
  rating        TINYINT UNSIGNED DEFAULT NULL CHECK (rating BETWEEN 1 AND 5),
  logged_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ==========================================
-- BOOKS DOMAIN
-- ==========================================

CREATE TABLE books (
  book_id     INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255),
  genre       ENUM('Fiction','Non-Fiction') NOT NULL,
  sub_genre   ENUM(
                'Fantasy','Sci-Fi','Mystery / Thriller','Romance',
                'Horror','Historical Fiction',
                'Biography / Autobiography','Self-help',
                'Business / Finance','Psychology','Technology','Philosophy'
              ) NOT NULL,
  popularity  TINYINT UNSIGNED NOT NULL DEFAULT 50 CHECK (popularity BETWEEN 0 AND 100)
);

CREATE TABLE book_tags_master (
  tag_id    INT PRIMARY KEY AUTO_INCREMENT,
  tag_name  ENUM(
              'Productivity','Entrepreneurship','Programming','Mindset',
              'Spirituality','Health & Wellness','Career Growth','Finance',
              'Leadership','Creativity','Communication','Psychology'
            ) NOT NULL UNIQUE
);

CREATE TABLE book_item_tags (
  book_id  INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id),
  FOREIGN KEY (tag_id)  REFERENCES book_tags_master(tag_id)
);

CREATE TABLE user_book_interests (
  user_id  INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tag_id)  REFERENCES book_tags_master(tag_id)
);

CREATE TABLE user_book_preference_weights (
  user_id     INT NOT NULL,
  tag_id      INT NOT NULL,
  weight      DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tag_id)  REFERENCES book_tags_master(tag_id)
);

-- ==========================================
-- MOVIES DOMAIN
-- ==========================================

CREATE TABLE movies (
  movie_id   INT PRIMARY KEY AUTO_INCREMENT,
  title      VARCHAR(255) NOT NULL,
  genre      ENUM(
               'Action','Comedy','Drama','Thriller',
               'Horror','Romance','Sci-Fi','Documentary'
             ) NOT NULL,
  sub_genre  ENUM(
               'Crime','Adventure','Fantasy','Mystery','Psychological',
               'Historical','War','Biography','Family','Animation'
             ) NOT NULL,
  duration_minutes  SMALLINT UNSIGNED NOT NULL,
  popularity        TINYINT UNSIGNED NOT NULL DEFAULT 50 CHECK (popularity BETWEEN 0 AND 100)
);

CREATE TABLE movie_tags_master (
  tag_id    INT PRIMARY KEY AUTO_INCREMENT,
  tag_name  ENUM(
              'Entertainment','Comedy','Action-packed','Emotional',
              'Inspirational','Dark','Romantic','Mind-bending',
              'Sci-Fi Tech','Thriller','Adventure','Real-life Story'
            ) NOT NULL UNIQUE
);

CREATE TABLE movie_item_tags (
  movie_id  INT NOT NULL,
  tag_id    INT NOT NULL,
  PRIMARY KEY (movie_id, tag_id),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (tag_id)   REFERENCES movie_tags_master(tag_id)
);

CREATE TABLE user_movie_interests (
  user_id  INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tag_id)  REFERENCES movie_tags_master(tag_id)
);

CREATE TABLE user_movie_preference_weights (
  user_id     INT NOT NULL,
  tag_id      INT NOT NULL,
  weight      DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tag_id)  REFERENCES movie_tags_master(tag_id)
);

-- ==========================================
-- TRAVEL DOMAIN
-- ==========================================

CREATE TABLE destinations (
  destination_id  INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  category        ENUM('Nature','Urban','Cultural','Adventure','Relaxation') NOT NULL,
  sub_category    ENUM(
                    'Mountains','Beaches','Forest / Wildlife','Cities',
                    'Historical Sites','Religious Sites','Desert',
                    'Islands','Trekking','Nightlife'
                  ) NOT NULL,
  popularity      TINYINT UNSIGNED NOT NULL DEFAULT 50 CHECK (popularity BETWEEN 0 AND 100)
);

CREATE TABLE travel_tags_master (
  tag_id    INT PRIMARY KEY AUTO_INCREMENT,
  tag_name  ENUM(
              'Scenic','Photography','Adventure Sports','Peaceful',
              'Luxury','Budget Travel','Solo Travel','Family Friendly',
              'Cultural Exploration','Food Exploration','Spiritual',
              'Party / Nightlife'
            ) NOT NULL UNIQUE
);

CREATE TABLE destination_item_tags (
  destination_id  INT NOT NULL,
  tag_id          INT NOT NULL,
  PRIMARY KEY (destination_id, tag_id),
  FOREIGN KEY (destination_id) REFERENCES destinations(destination_id),
  FOREIGN KEY (tag_id)         REFERENCES travel_tags_master(tag_id)
);

CREATE TABLE user_travel_interests (
  user_id  INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tag_id)  REFERENCES travel_tags_master(tag_id)
);

CREATE TABLE user_travel_preference_weights (
  user_id     INT NOT NULL,
  tag_id      INT NOT NULL,
  weight      DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tag_id)  REFERENCES travel_tags_master(tag_id)
);

-- ==========================================
-- STORED PROCEDURES: Preference Weight Models
-- ==========================================
DELIMITER //

CREATE PROCEDURE sp_update_book_preferences(IN p_user_id INT)
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_tag_id INT;
  DECLARE v_weight DECIMAL(5,4);

  DECLARE tag_cursor CURSOR FOR SELECT tag_id FROM book_tags_master;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  DELETE FROM user_book_preference_weights WHERE user_id = p_user_id;

  OPEN tag_cursor;
  tag_loop: LOOP
    FETCH tag_cursor INTO v_tag_id;
    IF done THEN LEAVE tag_loop; END IF;

    SELECT
      COALESCE(
        SUM(
          CASE WHEN el.rating IS NOT NULL
               THEN ((el.rating - 1) / 4.0) * IF(bit.tag_id IS NOT NULL, 1, 0)
               ELSE 0.5 * IF(bit.tag_id IS NOT NULL, 1, 0)
          END
        ) /
        NULLIF(SUM(
          CASE WHEN el.rating IS NOT NULL
               THEN (el.rating - 1) / 4.0
               ELSE 0.5
          END
        ), 0),
      0)
    INTO v_weight
    FROM event_logs el
    LEFT JOIN book_item_tags bit ON el.content_id = bit.book_id AND bit.tag_id = v_tag_id
    WHERE el.user_id = p_user_id AND el.content_type = 'book';

    IF v_weight > 0 THEN
      INSERT INTO user_book_preference_weights (user_id, tag_id, weight)
      VALUES (p_user_id, v_tag_id, v_weight)
      ON DUPLICATE KEY UPDATE weight = v_weight, updated_at = NOW();
    END IF;
  END LOOP;
  CLOSE tag_cursor;
END //

CREATE PROCEDURE sp_update_movie_preferences(IN p_user_id INT)
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_tag_id INT;
  DECLARE v_weight DECIMAL(5,4);

  DECLARE tag_cursor CURSOR FOR SELECT tag_id FROM movie_tags_master;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  DELETE FROM user_movie_preference_weights WHERE user_id = p_user_id;

  OPEN tag_cursor;
  tag_loop: LOOP
    FETCH tag_cursor INTO v_tag_id;
    IF done THEN LEAVE tag_loop; END IF;

    SELECT
      COALESCE(
        SUM(
          CASE WHEN el.rating IS NOT NULL
               THEN ((el.rating - 1) / 4.0) * IF(mit.tag_id IS NOT NULL, 1, 0)
               ELSE 0.5 * IF(mit.tag_id IS NOT NULL, 1, 0)
          END
        ) /
        NULLIF(SUM(
          CASE WHEN el.rating IS NOT NULL
               THEN (el.rating - 1) / 4.0
               ELSE 0.5
          END
        ), 0),
      0)
    INTO v_weight
    FROM event_logs el
    LEFT JOIN movie_item_tags mit ON el.content_id = mit.movie_id AND mit.tag_id = v_tag_id
    WHERE el.user_id = p_user_id AND el.content_type = 'movie';

    IF v_weight > 0 THEN
      INSERT INTO user_movie_preference_weights (user_id, tag_id, weight)
      VALUES (p_user_id, v_tag_id, v_weight)
      ON DUPLICATE KEY UPDATE weight = v_weight, updated_at = NOW();
    END IF;
  END LOOP;
  CLOSE tag_cursor;
END //

CREATE PROCEDURE sp_update_travel_preferences(IN p_user_id INT)
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_tag_id INT;
  DECLARE v_weight DECIMAL(5,4);

  DECLARE tag_cursor CURSOR FOR SELECT tag_id FROM travel_tags_master;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  DELETE FROM user_travel_preference_weights WHERE user_id = p_user_id;

  OPEN tag_cursor;
  tag_loop: LOOP
    FETCH tag_cursor INTO v_tag_id;
    IF done THEN LEAVE tag_loop; END IF;

    SELECT
      COALESCE(
        SUM(
          CASE WHEN el.rating IS NOT NULL
               THEN ((el.rating - 1) / 4.0) * IF(dit.tag_id IS NOT NULL, 1, 0)
               ELSE 0.5 * IF(dit.tag_id IS NOT NULL, 1, 0)
          END
        ) /
        NULLIF(SUM(
          CASE WHEN el.rating IS NOT NULL
               THEN (el.rating - 1) / 4.0
               ELSE 0.5
          END
        ), 0),
      0)
    INTO v_weight
    FROM event_logs el
    LEFT JOIN destination_item_tags dit ON el.content_id = dit.destination_id AND dit.tag_id = v_tag_id
    WHERE el.user_id = p_user_id AND el.content_type = 'travel';

    IF v_weight > 0 THEN
      INSERT INTO user_travel_preference_weights (user_id, tag_id, weight)
      VALUES (p_user_id, v_tag_id, v_weight)
      ON DUPLICATE KEY UPDATE weight = v_weight, updated_at = NOW();
    END IF;
  END LOOP;
  CLOSE tag_cursor;
END //

-- ==========================================
-- STORED PROCEDURES: Recommendation Scoring
-- ==========================================

CREATE PROCEDURE sp_get_book_recommendations(IN p_user_id INT, IN p_top_n INT)
BEGIN
  SELECT
    b.book_id,
    b.title,
    b.genre,
    b.sub_genre,
    ROUND(COUNT(DISTINCT ubi.tag_id) / 3.0, 4) AS tag_score,
    (
      CASE
        WHEN b.genre = 'Non-Fiction'
          AND EXISTS (
            SELECT 1 FROM user_book_preference_weights ubpw
            JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id
            WHERE ubpw.user_id = p_user_id
              AND btm.tag_name IN ('Productivity','Entrepreneurship','Finance','Career Growth','Leadership')
              AND ubpw.weight > 0.3
          ) THEN 1
        WHEN b.genre = 'Fiction'
          AND EXISTS (
            SELECT 1 FROM user_book_preference_weights ubpw
            JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id
            WHERE ubpw.user_id = p_user_id
              AND btm.tag_name IN ('Creativity','Mindset','Psychology')
              AND ubpw.weight > 0.3
          ) THEN 1
        ELSE 0
      END
    ) AS genre_score,
    (
      CASE
        WHEN b.sub_genre IN ('Self-help','Business / Finance','Technology')
          AND EXISTS (
            SELECT 1 FROM user_book_preference_weights ubpw
            JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id
            WHERE ubpw.user_id = p_user_id
              AND btm.tag_name IN ('Productivity','Entrepreneurship','Programming')
              AND ubpw.weight > 0.3
          ) THEN 1
        WHEN b.sub_genre IN ('Psychology','Philosophy')
          AND EXISTS (
            SELECT 1 FROM user_book_preference_weights ubpw
            JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id
            WHERE ubpw.user_id = p_user_id
              AND btm.tag_name IN ('Mindset','Psychology','Spirituality')
              AND ubpw.weight > 0.3
          ) THEN 1
        ELSE 0
      END
    ) AS sub_genre_score,
    ROUND(b.popularity / 100.0, 4) AS popularity_score,
    ROUND(
      (ROUND(COUNT(DISTINCT ubi.tag_id) / 3.0, 4) * 0.5) +
      (
        CASE
          WHEN b.genre = 'Non-Fiction' AND EXISTS (SELECT 1 FROM user_book_preference_weights ubpw JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id WHERE ubpw.user_id = p_user_id AND btm.tag_name IN ('Productivity','Entrepreneurship','Finance','Career Growth','Leadership') AND ubpw.weight > 0.3) THEN 1
          WHEN b.genre = 'Fiction' AND EXISTS (SELECT 1 FROM user_book_preference_weights ubpw JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id WHERE ubpw.user_id = p_user_id AND btm.tag_name IN ('Creativity','Mindset','Psychology') AND ubpw.weight > 0.3) THEN 1
          ELSE 0
        END
      ) * 0.2 +
      (
        CASE
          WHEN b.sub_genre IN ('Self-help','Business / Finance','Technology') AND EXISTS (SELECT 1 FROM user_book_preference_weights ubpw JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id WHERE ubpw.user_id = p_user_id AND btm.tag_name IN ('Productivity','Entrepreneurship','Programming') AND ubpw.weight > 0.3) THEN 1
          WHEN b.sub_genre IN ('Psychology','Philosophy') AND EXISTS (SELECT 1 FROM user_book_preference_weights ubpw JOIN book_tags_master btm ON ubpw.tag_id = btm.tag_id WHERE ubpw.user_id = p_user_id AND btm.tag_name IN ('Mindset','Psychology','Spirituality') AND ubpw.weight > 0.3) THEN 1
          ELSE 0
        END
      ) * 0.1 +
      (ROUND(b.popularity / 100.0, 4) * 0.2),
    4) AS final_score
  FROM books b
  LEFT JOIN book_item_tags bit ON b.book_id = bit.book_id
  LEFT JOIN user_book_preference_weights ubi ON bit.tag_id = ubi.tag_id AND ubi.user_id = p_user_id
  WHERE b.book_id NOT IN (
    SELECT content_id FROM event_logs WHERE user_id = p_user_id AND content_type = 'book'
  )
  GROUP BY b.book_id, b.title, b.genre, b.sub_genre, b.popularity
  ORDER BY final_score DESC
  LIMIT p_top_n;
END //

CREATE PROCEDURE sp_get_movie_recommendations(IN p_user_id INT, IN p_top_n INT)
BEGIN
  SELECT
    m.movie_id,
    m.title,
    m.genre,
    m.sub_genre,
    ROUND(COUNT(DISTINCT umi.tag_id) / 3.0, 4) AS tag_score,
    (
      CASE
        WHEN m.genre IN ('Action','Thriller','Sci-Fi') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Action-packed','Thriller','Sci-Fi Tech') AND umpw.weight > 0.3) THEN 1
        WHEN m.genre IN ('Comedy','Romance') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Comedy','Romantic','Emotional') AND umpw.weight > 0.3) THEN 1
        ELSE 0
      END
    ) AS genre_score,
    (
      CASE
        WHEN m.sub_genre IN ('Crime','Psychological','Mystery') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Dark','Mind-bending','Thriller') AND umpw.weight > 0.3) THEN 1
        WHEN m.sub_genre IN ('Biography','Historical','Documentary') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Real-life Story','Inspirational') AND umpw.weight > 0.3) THEN 1
        ELSE 0
      END
    ) AS sub_genre_score,
    ROUND(m.popularity / 100.0, 4) AS popularity_score,
    ROUND(
      (ROUND(COUNT(DISTINCT umi.tag_id) / 3.0, 4) * 0.5) +
      (
        CASE
          WHEN m.genre IN ('Action','Thriller','Sci-Fi') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Action-packed','Thriller','Sci-Fi Tech') AND umpw.weight > 0.3) THEN 1
          WHEN m.genre IN ('Comedy','Romance') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Comedy','Romantic','Emotional') AND umpw.weight > 0.3) THEN 1
          ELSE 0
        END
      ) * 0.1 +
      (
        CASE
          WHEN m.sub_genre IN ('Crime','Psychological','Mystery') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Dark','Mind-bending','Thriller') AND umpw.weight > 0.3) THEN 1
          WHEN m.sub_genre IN ('Biography','Historical','Documentary') AND EXISTS (SELECT 1 FROM user_movie_preference_weights umpw JOIN movie_tags_master mtm ON umpw.tag_id = mtm.tag_id WHERE umpw.user_id = p_user_id AND mtm.tag_name IN ('Real-life Story','Inspirational') AND umpw.weight > 0.3) THEN 1
          ELSE 0
        END
      ) * 0.2 +
      (ROUND(m.popularity / 100.0, 4) * 0.2),
    4) AS final_score
  FROM movies m
  LEFT JOIN movie_item_tags mit ON m.movie_id = mit.movie_id
  LEFT JOIN user_movie_preference_weights umi ON mit.tag_id = umi.tag_id AND umi.user_id = p_user_id
  WHERE m.movie_id NOT IN (
    SELECT content_id FROM event_logs WHERE user_id = p_user_id AND content_type = 'movie'
  )
  GROUP BY m.movie_id, m.title, m.genre, m.sub_genre, m.popularity
  ORDER BY final_score DESC
  LIMIT p_top_n;
END //

CREATE PROCEDURE sp_get_travel_recommendations(IN p_user_id INT, IN p_top_n INT)
BEGIN
  SELECT
    d.destination_id,
    d.name,
    d.category,
    d.sub_category,
    ROUND(COUNT(DISTINCT uti.tag_id) / 3.0, 4) AS tag_score,
    (
      CASE
        WHEN d.category IN ('Nature','Relaxation') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Scenic','Peaceful','Luxury') AND utpw.weight > 0.3) THEN 1
        WHEN d.category IN ('Adventure','Urban') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Adventure Sports','Party / Nightlife','Cultural Exploration') AND utpw.weight > 0.3) THEN 1
        ELSE 0
      END
    ) AS category_score,
    (
      CASE
        WHEN d.sub_category IN ('Mountains','Trekking','Forest / Wildlife') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Adventure Sports','Scenic','Photography') AND utpw.weight > 0.3) THEN 1
        WHEN d.sub_category IN ('Cities','Nightlife') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Party / Nightlife','Food Exploration') AND utpw.weight > 0.3) THEN 1
        ELSE 0
      END
    ) AS sub_category_score,
    ROUND(d.popularity / 100.0, 4) AS popularity_score,
    ROUND(
      (ROUND(COUNT(DISTINCT uti.tag_id) / 3.0, 4) * 0.5) +
      (
        CASE
          WHEN d.category IN ('Nature','Relaxation') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Scenic','Peaceful','Luxury') AND utpw.weight > 0.3) THEN 1
          WHEN d.category IN ('Adventure','Urban') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Adventure Sports','Party / Nightlife','Cultural Exploration') AND utpw.weight > 0.3) THEN 1
          ELSE 0
        END
      ) * 0.1 +
      (
        CASE
          WHEN d.sub_category IN ('Mountains','Trekking','Forest / Wildlife') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Adventure Sports','Scenic','Photography') AND utpw.weight > 0.3) THEN 1
          WHEN d.sub_category IN ('Cities','Nightlife') AND EXISTS (SELECT 1 FROM user_travel_preference_weights utpw JOIN travel_tags_master ttm ON utpw.tag_id = ttm.tag_id WHERE utpw.user_id = p_user_id AND ttm.tag_name IN ('Party / Nightlife','Food Exploration') AND utpw.weight > 0.3) THEN 1
          ELSE 0
        END
      ) * 0.2 +
      (ROUND(d.popularity / 100.0, 4) * 0.2),
    4) AS final_score
  FROM destinations d
  LEFT JOIN destination_item_tags dit ON d.destination_id = dit.destination_id
  LEFT JOIN user_travel_preference_weights uti ON dit.tag_id = uti.tag_id AND uti.user_id = p_user_id
  WHERE d.destination_id NOT IN (
    SELECT content_id FROM event_logs WHERE user_id = p_user_id AND content_type = 'travel'
  )
  GROUP BY d.destination_id, d.name, d.category, d.sub_category, d.popularity
  ORDER BY final_score DESC
  LIMIT p_top_n;
END //

CREATE PROCEDURE sp_generate_yearly_insights(
  IN  p_user_id INT,
  IN  p_year    INT,
  OUT p_result  JSON
)
BEGIN
  DECLARE v_book_time     INT DEFAULT 0;
  DECLARE v_movie_time    INT DEFAULT 0;
  DECLARE v_travel_days   INT DEFAULT 0;
  DECLARE v_book_count    INT DEFAULT 0;
  DECLARE v_movie_count   INT DEFAULT 0;
  DECLARE v_travel_count  INT DEFAULT 0;
  DECLARE v_top_category  VARCHAR(20);
  DECLARE v_peak_month    INT;

  SELECT
    COALESCE(SUM(CASE WHEN content_type = 'book'   THEN duration ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN content_type = 'movie'  THEN duration ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN content_type = 'travel' THEN duration ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN content_type = 'book'   THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN content_type = 'movie'  THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN content_type = 'travel' THEN 1 ELSE 0 END), 0)
  INTO
    v_book_time, v_movie_time, v_travel_days,
    v_book_count, v_movie_count, v_travel_count
  FROM event_logs
  WHERE user_id = p_user_id AND YEAR(logged_at) = p_year;

  SELECT content_type INTO v_top_category
  FROM event_logs
  WHERE user_id = p_user_id AND YEAR(logged_at) = p_year
  GROUP BY content_type
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  SELECT MONTH(logged_at) INTO v_peak_month
  FROM event_logs
  WHERE user_id = p_user_id AND YEAR(logged_at) = p_year
  GROUP BY MONTH(logged_at)
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  SET p_result = JSON_OBJECT(
    'year',          p_year,
    'book_minutes',  v_book_time,
    'movie_minutes', v_movie_time,
    'travel_days',   v_travel_days,
    'book_count',    v_book_count,
    'movie_count',   v_movie_count,
    'travel_count',  v_travel_count,
    'top_category',  COALESCE(v_top_category, 'None'),
    'peak_month',    COALESCE(v_peak_month, 0)
  );
END //

DELIMITER ;

-- ==========================================
-- TRIGGERS
-- ==========================================
DELIMITER //

CREATE TRIGGER trg_book_duration_default
BEFORE INSERT ON event_logs
FOR EACH ROW
BEGIN
  IF NEW.content_type = 'book' AND (NEW.duration IS NULL OR NEW.duration = 0) THEN
    SET NEW.duration = 480;
  END IF;
END //

CREATE TRIGGER trg_movie_duration_autofill
BEFORE INSERT ON event_logs
FOR EACH ROW
BEGIN
  DECLARE v_duration SMALLINT;
  IF NEW.content_type = 'movie' THEN
    SELECT duration_minutes INTO v_duration FROM movies WHERE movie_id = NEW.content_id;
    SET NEW.duration = v_duration;
  END IF;
END //

CREATE TRIGGER trg_after_event_insert
AFTER INSERT ON event_logs
FOR EACH ROW
BEGIN
  IF NEW.content_type = 'book' THEN
    CALL sp_update_book_preferences(NEW.user_id);
  ELSEIF NEW.content_type = 'movie' THEN
    CALL sp_update_movie_preferences(NEW.user_id);
  ELSEIF NEW.content_type = 'travel' THEN
    CALL sp_update_travel_preferences(NEW.user_id);
  END IF;
END //

DELIMITER ;
