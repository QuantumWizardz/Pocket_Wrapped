-- 02_seed.sql
-- USE content_analytics;

-- ==========================================
-- MASTER TAGS
-- ==========================================

-- Books
INSERT INTO book_tags_master (tag_name) VALUES
('Productivity'), ('Entrepreneurship'), ('Programming'), ('Mindset'),
('Spirituality'), ('Health & Wellness'), ('Career Growth'), ('Finance'),
('Leadership'), ('Creativity'), ('Communication'), ('Psychology');

-- Movies
INSERT INTO movie_tags_master (tag_name) VALUES
('Entertainment'), ('Comedy'), ('Action-packed'), ('Emotional'),
('Inspirational'), ('Dark'), ('Romantic'), ('Mind-bending'),
('Sci-Fi Tech'), ('Thriller'), ('Adventure'), ('Real-life Story');

-- Travel
INSERT INTO travel_tags_master (tag_name) VALUES
('Scenic'), ('Photography'), ('Adventure Sports'), ('Peaceful'),
('Luxury'), ('Budget Travel'), ('Solo Travel'), ('Family Friendly'),
('Cultural Exploration'), ('Food Exploration'), ('Spiritual'), ('Party / Nightlife');

-- ==========================================
-- BOOKS (10 items)
-- ==========================================
INSERT INTO books (title, author, genre, sub_genre, popularity) VALUES
('Atomic Habits', 'James Clear', 'Non-Fiction', 'Self-help', 98),
('Clean Code', 'Robert C. Martin', 'Non-Fiction', 'Technology', 85),
('Dune', 'Frank Herbert', 'Fiction', 'Sci-Fi', 90),
('Thinking, Fast and Slow', 'Daniel Kahneman', 'Non-Fiction', 'Psychology', 92),
('Zero to One', 'Peter Thiel', 'Non-Fiction', 'Business / Finance', 88),
('The Alchemist', 'Paulo Coelho', 'Fiction', 'Fantasy', 95),
('Shoe Dog', 'Phil Knight', 'Non-Fiction', 'Biography / Autobiography', 89),
('1984', 'George Orwell', 'Fiction', 'Sci-Fi', 96),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'Non-Fiction', 'Business / Finance', 94),
('Meditations', 'Marcus Aurelius', 'Non-Fiction', 'Philosophy', 82);

INSERT INTO book_item_tags (book_id, tag_id) VALUES
(1, 1), (1, 4), -- Atomic Habits: Productivity, Mindset
(2, 3), (2, 7), -- Clean Code: Programming, Career Growth
(3, 10), (3, 4), -- Dune: Creativity, Mindset
(4, 12), (4, 4), -- Thinking Fast: Psychology, Mindset
(5, 2), (5, 8), -- Zero to One: Entrepreneurship, Finance
(6, 5), (6, 4), -- Alchemist: Spirituality, Mindset
(7, 2), (7, 9), -- Shoe Dog: Entrepreneurship, Leadership
(8, 10), (8, 4), -- 1984: Creativity, Mindset
(9, 8), (9, 2), -- Rich Dad: Finance, Entrepreneurship
(10, 5), (10, 4); -- Meditations: Spirituality, Mindset

-- ==========================================
-- MOVIES (10 items)
-- ==========================================
INSERT INTO movies (title, genre, sub_genre, duration_minutes, popularity) VALUES
('Inception', 'Sci-Fi', 'Psychological', 148, 97),
('The Dark Knight', 'Action', 'Crime', 152, 99),
('Interstellar', 'Sci-Fi', 'Adventure', 169, 95),
('The Matrix', 'Sci-Fi', 'Psychological', 136, 96),
('Pulp Fiction', 'Drama', 'Crime', 154, 94),
('Forrest Gump', 'Drama', 'Historical', 142, 98),
('Spirited Away', 'Action', 'Animation', 125, 93),
('The Silence of the Lambs', 'Thriller', 'Psychological', 118, 91),
('Goodfellas', 'Drama', 'Crime', 145, 92),
('Schindler''s List', 'Drama', 'Historical', 195, 97);

INSERT INTO movie_item_tags (movie_id, tag_id) VALUES
(1, 8), (1, 9), -- Inception: Mind-bending, Sci-Fi Tech
(2, 3), (2, 6), -- Dark Knight: Action-packed, Dark
(3, 8), (3, 11), -- Interstellar: Mind-bending, Adventure
(4, 3), (4, 9), -- Matrix: Action-packed, Sci-Fi Tech
(5, 1), (5, 6), -- Pulp Fiction: Entertainment, Dark
(6, 4), (6, 5), -- Forrest Gump: Emotional, Inspirational
(7, 1), (7, 11), -- Spirited Away: Entertainment, Adventure
(8, 10), (8, 6), -- Silence of Lambs: Thriller, Dark
(9, 1), (9, 6), -- Goodfellas: Entertainment, Dark
(10, 4), (10, 12); -- Schindler's: Emotional, Real-life Story

-- ==========================================
-- TRAVEL (10 items)
-- ==========================================
INSERT INTO destinations (name, category, sub_category, popularity) VALUES
('Kyoto', 'Cultural', 'Historical Sites', 95),
('Swiss Alps', 'Nature', 'Mountains', 98),
('Maldives', 'Relaxation', 'Beaches', 99),
('Tokyo', 'Urban', 'Cities', 97),
('Machu Picchu', 'Adventure', 'Historical Sites', 96),
('Bali', 'Relaxation', 'Islands', 94),
('New York City', 'Urban', 'Cities', 98),
('Yellowstone', 'Nature', 'Forest / Wildlife', 92),
('Dubai', 'Urban', 'Cities', 90),
('Varanasi', 'Cultural', 'Religious Sites', 85);

INSERT INTO destination_item_tags (destination_id, tag_id) VALUES
(1, 9), (1, 2), -- Kyoto: Cultural Exploration, Photography
(2, 1), (2, 3), -- Swiss Alps: Scenic, Adventure Sports
(3, 4), (3, 5), -- Maldives: Peaceful, Luxury
(4, 10), (4, 12), -- Tokyo: Food Exploration, Party / Nightlife
(5, 3), (5, 9), -- Machu Picchu: Adventure Sports, Cultural Exploration
(6, 4), (6, 1), -- Bali: Peaceful, Scenic
(7, 12), (7, 10), -- NYC: Party / Nightlife, Food Exploration
(8, 1), (8, 2), -- Yellowstone: Scenic, Photography
(9, 5), (9, 12), -- Dubai: Luxury, Party / Nightlife
(10, 11), (10, 9); -- Varanasi: Spiritual, Cultural Exploration

-- ==========================================
-- TEST USER
-- ==========================================
-- Password is 'password' hashed with bcrypt
INSERT INTO users (username, email) VALUES ('testuser', 'test@test.com');
INSERT INTO auth (user_id, password_hash) VALUES (1, '$2b$10$C/vAHEJ/M9bF0W3R6V0LZe6yA8zH3yL0lXgN9Z2.X6p5A0q3y0VHm');
