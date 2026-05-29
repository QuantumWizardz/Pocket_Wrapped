DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_book_recommendations//
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

DROP PROCEDURE IF EXISTS sp_get_movie_recommendations//
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

DROP PROCEDURE IF EXISTS sp_get_travel_recommendations//
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

DELIMITER ;
