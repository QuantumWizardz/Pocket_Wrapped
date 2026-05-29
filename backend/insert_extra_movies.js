const mysql = require('mysql2/promise');
require('dotenv').config();

const extraMovies = [
  { Title: "Anand", Duration: 122, Genre: "Drama", SubGenre: "Psychological", Tags: "['Emotional', 'Inspirational']", Popularity: 92 },
  { Title: "Drishyam", Duration: 163, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 75 },
  { Title: "Nayakan", Duration: 155, Genre: "Drama", SubGenre: "Crime", Tags: "['Dark', 'Real-life Story']", Popularity: 88 },
  { Title: "Anbe Sivam", Duration: 166, Genre: "Drama", SubGenre: "Adventure", Tags: "['Emotional', 'Inspirational']", Popularity: 82 },
  { Title: "Gol Maal", Duration: 145, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 85 },
  { Title: "Vikram Vedha", Duration: 139, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Action-packed']", Popularity: 85 },
  { Title: "Black Friday", Duration: 138, Genre: "Thriller", SubGenre: "Crime", Tags: "['Dark', 'Real-life Story']", Popularity: 80 },
  { Title: "Ratsasan", Duration: 170, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Dark']", Popularity: 82 },
  { Title: "Dangal", Duration: 161, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 95 },
  { Title: "Pather Panchali", Duration: 125, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 88 },
  { Title: "Uri: The Surgical Strike", Duration: 138, Genre: "Action", SubGenre: "War", Tags: "['Action-packed', 'Inspirational', 'Real-life Story']", Popularity: 88 },
  { Title: "Taare Zameen Par", Duration: 165, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Inspirational']", Popularity: 92 },
  { Title: "Andhadhun", Duration: 139, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 92 },
  { Title: "3 Idiots", Duration: 170, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Inspirational', 'Entertainment']", Popularity: 97 },
  { Title: "Aruvi", Duration: 120, Genre: "Drama", SubGenre: "Psychological", Tags: "['Emotional', 'Dark']", Popularity: 78 },
  { Title: "96", Duration: 158, Genre: "Romance", SubGenre: "Psychological", Tags: "['Emotional', 'Romantic']", Popularity: 85 },
  { Title: "Manichithrathazhu", Duration: 187, Genre: "Thriller", SubGenre: "Psychological", Tags: "['Thriller', 'Mind-bending']", Popularity: 88 },
  { Title: "Jaane Bhi Do Yaaro", Duration: 132, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Dark']", Popularity: 85 },
  { Title: "Thalapathi", Duration: 163, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Dark']", Popularity: 82 },
  { Title: "Guide", Duration: 183, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Inspirational']", Popularity: 85 },
  { Title: "Chupke Chupke", Duration: 145, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 83 },
  { Title: "Thani Oruvan", Duration: 168, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Action-packed']", Popularity: 82 },
  { Title: "Kannathil Muthamittal", Duration: 147, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 80 },
  { Title: "Khosla Ka Ghosla!", Duration: 118, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Entertainment']", Popularity: 82 },
  { Title: "Gully Boy", Duration: 153, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 88 },
  { Title: "Apur Sansar", Duration: 106, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 85 },
  { Title: "Vada Chennai", Duration: 163, Genre: "Action", SubGenre: "Crime", Tags: "['Dark', 'Action-packed']", Popularity: 82 },
  { Title: "Dhuruvangal Pathinaaru", Duration: 95, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller']", Popularity: 80 },
  { Title: "Peranbu", Duration: 139, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional']", Popularity: 78 },
  { Title: "Shahid", Duration: 120, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 80 },
  { Title: "Talvar", Duration: 135, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Real-life Story']", Popularity: 82 },
  { Title: "Drishyam", Duration: 152, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 88 },
  { Title: "Mughal-E-Azam", Duration: 197, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 88 },
  { Title: "Aparajito", Duration: 110, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 85 },
  { Title: "Black", Duration: 122, Genre: "Drama", SubGenre: "Family", Tags: "['Inspirational', 'Emotional']", Popularity: 82 },
  { Title: "Hera Pheri", Duration: 156, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Entertainment']", Popularity: 92 },
  { Title: "Jigarthanda", Duration: 173, Genre: "Thriller", SubGenre: "Crime", Tags: "['Dark', 'Thriller']", Popularity: 82 },
  { Title: "Mahanati", Duration: 176, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 85 },
  { Title: "Satya", Duration: 170, Genre: "Action", SubGenre: "Crime", Tags: "['Dark', 'Action-packed']", Popularity: 88 },
  { Title: "Paan Singh Tomar", Duration: 134, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 85 },
  { Title: "Rang De Basanti", Duration: 157, Genre: "Drama", SubGenre: "Historical", Tags: "['Inspirational']", Popularity: 92 },
  { Title: "Soodhu Kavvum", Duration: 113, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Dark']", Popularity: 80 },
  { Title: "Bhaag Milkha Bhaag", Duration: 187, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 88 },
  { Title: "Jo Jeeta Wohi Sikandar", Duration: 165, Genre: "Drama", SubGenre: "Family", Tags: "['Inspirational', 'Entertainment']", Popularity: 85 },
  { Title: "Swades: We, the People", Duration: 210, Genre: "Drama", SubGenre: "Historical", Tags: "['Inspirational']", Popularity: 88 },
  { Title: "OMG: Oh My God!", Duration: 126, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Inspirational']", Popularity: 82 },
  { Title: "Queen", Duration: 146, Genre: "Drama", SubGenre: "Adventure", Tags: "['Inspirational', 'Entertainment']", Popularity: 88 },
  { Title: "Sholay", Duration: 204, Genre: "Action", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 98 },
  { Title: "Gangs of Wasseypur", Duration: 161, Genre: "Action", SubGenre: "Crime", Tags: "['Dark', 'Action-packed']", Popularity: 92 },
  { Title: "Sairat", Duration: 174, Genre: "Romance", SubGenre: "Historical", Tags: "['Emotional', 'Romantic']", Popularity: 85 },
  { Title: "Premam", Duration: 145, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 88 },
  { Title: "Chak De! India", Duration: 153, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Entertainment']", Popularity: 90 },
  { Title: "Bangalore Days", Duration: 171, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Romantic']", Popularity: 82 },
  { Title: "A Wednesday", Duration: 104, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Mind-bending']", Popularity: 88 },
  { Title: "Munna Bhai MBBS", Duration: 156, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Inspirational']", Popularity: 92 },
  { Title: "Tumbbad", Duration: 104, Genre: "Horror", SubGenre: "Fantasy", Tags: "['Dark']", Popularity: 85 },
  { Title: "Ustad Hotel", Duration: 145, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Entertainment']", Popularity: 80 },
  { Title: "Udaan", Duration: 134, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Inspirational']", Popularity: 82 },
  { Title: "Andaz Apna Apna", Duration: 160, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Entertainment']", Popularity: 90 },
  { Title: "Roja", Duration: 133, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Inspirational']", Popularity: 88 },
  { Title: "Dil Chahta Hai", Duration: 183, Genre: "Comedy", SubGenre: "Family", Tags: "['Entertainment', 'Romantic']", Popularity: 92 },
  { Title: "Sarfarosh", Duration: 184, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Thriller']", Popularity: 88 },
  { Title: "Anniyan", Duration: 176, Genre: "Thriller", SubGenre: "Psychological", Tags: "['Thriller', 'Mind-bending']", Popularity: 85 },
  { Title: "Lagaan: Once Upon a Time in India", Duration: 224, Genre: "Drama", SubGenre: "Historical", Tags: "['Inspirational', 'Entertainment']", Popularity: 92 },
  { Title: "Pink", Duration: 136, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Inspirational']", Popularity: 88 },
  { Title: "Kahaani", Duration: 122, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 90 },
  { Title: "PK", Duration: 153, Genre: "Comedy", SubGenre: "Fantasy", Tags: "['Comedy', 'Inspirational']", Popularity: 92 },
  { Title: "Iqbal", Duration: 133, Genre: "Drama", SubGenre: "Family", Tags: "['Inspirational']", Popularity: 82 },
  { Title: "Zindagi Na Milegi Dobara", Duration: 155, Genre: "Drama", SubGenre: "Adventure", Tags: "['Inspirational', 'Entertainment']", Popularity: 92 },
  { Title: "Arjun Reddy", Duration: 187, Genre: "Romance", SubGenre: "Psychological", Tags: "['Emotional', 'Romantic', 'Dark']", Popularity: 88 },
  { Title: "Maqbool", Duration: 133, Genre: "Thriller", SubGenre: "Crime", Tags: "['Dark', 'Thriller']", Popularity: 82 },
  { Title: "Theeran Adhigaaram Ondru", Duration: 141, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Real-life Story']", Popularity: 82 },
  { Title: "Masaan", Duration: 109, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 82 },
  { Title: "Baasha", Duration: 163, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Entertainment']", Popularity: 85 },
  { Title: "The Legend of Bhagat Singh", Duration: 155, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 82 },
  { Title: "Omkara", Duration: 163, Genre: "Thriller", SubGenre: "Crime", Tags: "['Dark', 'Thriller']", Popularity: 82 },
  { Title: "Barfi!", Duration: 151, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Entertainment']", Popularity: 88 },
  { Title: "Lage Raho Munna Bhai", Duration: 144, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Inspirational']", Popularity: 90 },
  { Title: "Bommarillu", Duration: 165, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 82 },
  { Title: "Bombay", Duration: 145, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Real-life Story']", Popularity: 85 },
  { Title: "Deewaar", Duration: 176, Genre: "Action", SubGenre: "Crime", Tags: "['Dark', 'Action-packed']", Popularity: 88 },
  { Title: "Lucia", Duration: 149, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Mind-bending', 'Thriller']", Popularity: 78 },
  { Title: "Ugly", Duration: 126, Genre: "Thriller", SubGenre: "Crime", Tags: "['Dark', 'Thriller']", Popularity: 78 },
  { Title: "Dilwale Dulhania Le Jayenge", Duration: 189, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 97 },
  { Title: "Mother India", Duration: 172, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Inspirational']", Popularity: 88 },
  { Title: "Gulaal", Duration: 130, Genre: "Thriller", SubGenre: "Historical", Tags: "['Dark']", Popularity: 78 },
  { Title: "Baahubali 2: The Conclusion", Duration: 167, Genre: "Action", SubGenre: "Fantasy", Tags: "['Action-packed', 'Entertainment']", Popularity: 92 },
  { Title: "Padosan", Duration: 142, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 82 },
  { Title: "Haider", Duration: 160, Genre: "Thriller", SubGenre: "Historical", Tags: "['Dark', 'Thriller']", Popularity: 85 },
  { Title: "Indian", Duration: 191, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed']", Popularity: 80 },
  { Title: "Athadu", Duration: 155, Genre: "Action", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 80 },
  { Title: "DevD", Duration: 136, Genre: "Drama", SubGenre: "Psychological", Tags: "['Dark', 'Emotional']", Popularity: 82 },
  { Title: "Vedam", Duration: 162, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Inspirational']", Popularity: 80 },
  { Title: "Special Chabbis", Duration: 141, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Real-life Story']", Popularity: 82 },
  { Title: "Company", Duration: 155, Genre: "Action", SubGenre: "Crime", Tags: "['Dark', 'Action-packed']", Popularity: 82 },
  { Title: "Vaastav: The Reality", Duration: 155, Genre: "Action", SubGenre: "Crime", Tags: "['Dark', 'Real-life Story']", Popularity: 82 },
  { Title: "Badhaai Ho", Duration: 124, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 82 },
  { Title: "Bajrangi Bhaijaan", Duration: 161, Genre: "Drama", SubGenre: "Adventure", Tags: "['Emotional', 'Inspirational', 'Entertainment']", Popularity: 90 },
  { Title: "Ship of Theseus", Duration: 143, Genre: "Drama", SubGenre: "Psychological", Tags: "['Mind-bending']", Popularity: 78 },
  { Title: "Manjhi: The Mountain Man", Duration: 121, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 78 },
  { Title: "Ankhon Dekhi", Duration: 97, Genre: "Comedy", SubGenre: "Psychological", Tags: "['Mind-bending']", Popularity: 78 },
  { Title: "Pizza", Duration: 100, Genre: "Horror", SubGenre: "Mystery", Tags: "['Thriller', 'Dark']", Popularity: 72 },
  { Title: "Badla", Duration: 118, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 78 },
  { Title: "Jab We Met", Duration: 138, Genre: "Romance", SubGenre: "Adventure", Tags: "['Romantic', 'Entertainment']", Popularity: 88 },
  { Title: "Dor", Duration: 133, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Inspirational']", Popularity: 78 },
  { Title: "Padman", Duration: 140, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 82 },
  { Title: "Kal Ho Naa Ho", Duration: 186, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Emotional']", Popularity: 88 },
  { Title: "Airlift", Duration: 130, Genre: "Action", SubGenre: "Historical", Tags: "['Inspirational', 'Real-life Story', 'Action-packed']", Popularity: 85 },
  { Title: "Hey Ram", Duration: 194, Genre: "Drama", SubGenre: "Historical", Tags: "['Dark', 'Real-life Story']", Popularity: 78 },
  { Title: "Baby", Duration: 157, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Thriller']", Popularity: 80 },
  { Title: "Vaaranam Aayiram", Duration: 170, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Inspirational']", Popularity: 78 },
  { Title: "My Name Is Khan", Duration: 161, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Inspirational']", Popularity: 82 },
  { Title: "Rangasthalam", Duration: 174, Genre: "Action", SubGenre: "Historical", Tags: "['Action-packed', 'Entertainment']", Popularity: 85 },
  { Title: "KGF: Chapter 1", Duration: 156, Genre: "Action", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 90 },
  { Title: "Secret Superstar", Duration: 150, Genre: "Drama", SubGenre: "Family", Tags: "['Inspirational', 'Entertainment']", Popularity: 82 },
  { Title: "Lakshya", Duration: 185, Genre: "Action", SubGenre: "War", Tags: "['Inspirational', 'Action-packed']", Popularity: 82 },
  { Title: "Bahubali: The Beginning", Duration: 159, Genre: "Action", SubGenre: "Fantasy", Tags: "['Action-packed', 'Entertainment']", Popularity: 92 },
  { Title: "Border", Duration: 175, Genre: "Action", SubGenre: "War", Tags: "['Action-packed', 'Inspirational', 'Real-life Story']", Popularity: 82 },
  { Title: "Ab Tak Chhappan", Duration: 110, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Thriller']", Popularity: 78 },
  { Title: "Vettaiyaadu Vilaiyaadu", Duration: 171, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller']", Popularity: 78 },
  { Title: "Gangaajal", Duration: 133, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Real-life Story']", Popularity: 78 },
  { Title: "Johnny Gaddaar", Duration: 137, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Mind-bending']", Popularity: 78 },
  { Title: "Manam", Duration: 155, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Entertainment']", Popularity: 75 },
  { Title: "English Vinglish", Duration: 134, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Inspirational']", Popularity: 85 },
  { Title: "Okkadu", Duration: 158, Genre: "Action", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 78 },
  { Title: "Ulidavaru Kandanthe", Duration: 152, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller']", Popularity: 72 },
  { Title: "Dabba", Duration: 104, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional', 'Romantic']", Popularity: 82 },
  { Title: "Rock On!!", Duration: 145, Genre: "Drama", SubGenre: "Family", Tags: "['Inspirational', 'Entertainment']", Popularity: 80 },
  { Title: "Don", Duration: 169, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Entertainment']", Popularity: 82 },
  { Title: "Mr India", Duration: 179, Genre: "Action", SubGenre: "Fantasy", Tags: "['Action-packed', 'Entertainment']", Popularity: 85 },
  { Title: "Udta Punjab", Duration: 148, Genre: "Drama", SubGenre: "Crime", Tags: "['Dark', 'Real-life Story']", Popularity: 82 },
  { Title: "Nayak: The Real Hero", Duration: 179, Genre: "Action", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 75 },
  { Title: "Hindi Medium", Duration: 143, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Inspirational']", Popularity: 82 },
  { Title: "Dasvidaniya", Duration: 110, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional']", Popularity: 72 },
  { Title: "Vicky Donor", Duration: 128, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 78 },
  { Title: "Raazi", Duration: 138, Genre: "Thriller", SubGenre: "Historical", Tags: "['Thriller', 'Real-life Story', 'Inspirational']", Popularity: 88 },
  { Title: "Oye Lucky! Lucky Oye!", Duration: 110, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Entertainment']", Popularity: 78 },
  { Title: "Mumbai Meri Jaan", Duration: 128, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Real-life Story']", Popularity: 75 },
  { Title: "Guru", Duration: 155, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 80 },
  { Title: "Samsara", Duration: 168, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional']", Popularity: 68 },
  { Title: "Pokiri", Duration: 159, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Entertainment']", Popularity: 82 },
  { Title: "Veer-Zaara", Duration: 192, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Emotional']", Popularity: 85 },
  { Title: "Charlie", Duration: 131, Genre: "Drama", SubGenre: "Adventure", Tags: "['Entertainment']", Popularity: 72 },
  { Title: "Earth", Duration: 110, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Dark', 'Real-life Story']", Popularity: 75 },
  { Title: "Aamir", Duration: 95, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Dark']", Popularity: 75 },
  { Title: "Kapoor & Sons", Duration: 134, Genre: "Drama", SubGenre: "Family", Tags: "['Emotional']", Popularity: 80 },
  { Title: "Agneepath", Duration: 174, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Dark']", Popularity: 78 },
  { Title: "Newton", Duration: 106, Genre: "Drama", SubGenre: "Historical", Tags: "['Inspirational', 'Real-life Story']", Popularity: 80 },
  { Title: "RangiTaranga", Duration: 143, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 72 },
  { Title: "Eega", Duration: 132, Genre: "Action", SubGenre: "Fantasy", Tags: "['Action-packed', 'Entertainment']", Popularity: 78 },
  { Title: "Pyaar Ka Punchnama", Duration: 142, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 72 },
  { Title: "Neerja", Duration: 122, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 82 },
  { Title: "Manorama Six Feet Under", Duration: 126, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller']", Popularity: 72 },
  { Title: "Madras Cafe", Duration: 130, Genre: "Action", SubGenre: "Historical", Tags: "['Thriller', 'Real-life Story']", Popularity: 72 },
  { Title: "Sarkar", Duration: 123, Genre: "Thriller", SubGenre: "Crime", Tags: "['Dark', 'Thriller']", Popularity: 75 },
  { Title: "Sanju", Duration: 162, Genre: "Drama", SubGenre: "Biography", Tags: "['Real-life Story', 'Entertainment']", Popularity: 85 },
  { Title: "Kabhi Haan Kabhi Naa", Duration: 144, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 78 },
  { Title: "Darr", Duration: 177, Genre: "Thriller", SubGenre: "Psychological", Tags: "['Thriller', 'Dark']", Popularity: 82 },
  { Title: "Stree", Duration: 132, Genre: "Horror", SubGenre: "Comedy", Tags: "['Comedy', 'Entertainment']", Popularity: 82 },
  { Title: "Bheja Fry", Duration: 95, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 72 },
  { Title: "Goodachari", Duration: 135, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Thriller']", Popularity: 72 },
  { Title: "Tanu Weds Manu Returns", Duration: 142, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Romantic', 'Entertainment']", Popularity: 75 },
  { Title: "Rockstar", Duration: 159, Genre: "Romance", SubGenre: "Psychological", Tags: "['Romantic', 'Emotional']", Popularity: 78 },
  { Title: "24", Duration: 155, Genre: "Sci-Fi", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 72 },
  { Title: "Kai po che!", Duration: 126, Genre: "Drama", SubGenre: "Historical", Tags: "['Emotional', 'Inspirational']", Popularity: 78 },
  { Title: "Kuch Kuch Hota Hai", Duration: 185, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 92 },
  { Title: "Highway", Duration: 133, Genre: "Drama", SubGenre: "Adventure", Tags: "['Emotional']", Popularity: 78 },
  { Title: "Magadheera", Duration: 157, Genre: "Action", SubGenre: "Fantasy", Tags: "['Action-packed', 'Entertainment']", Popularity: 85 },
  { Title: "Baazigar", Duration: 184, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller', 'Dark']", Popularity: 82 },
  { Title: "Ek Hasina Thi", Duration: 122, Genre: "Thriller", SubGenre: "Crime", Tags: "['Thriller']", Popularity: 72 },
  { Title: "Saala Khadoos", Duration: 128, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 68 },
  { Title: "MS Dhoni: The Untold Story", Duration: 189, Genre: "Drama", SubGenre: "Biography", Tags: "['Inspirational', 'Real-life Story']", Popularity: 85 },
  { Title: "Wake Up Sid", Duration: 132, Genre: "Drama", SubGenre: "Family", Tags: "['Entertainment']", Popularity: 75 },
  { Title: "Jodhaa Akbar", Duration: 213, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Entertainment']", Popularity: 82 },
  { Title: "Parmanu: The Story of Pokhran", Duration: 128, Genre: "Action", SubGenre: "Historical", Tags: "['Inspirational', 'Real-life Story']", Popularity: 72 },
  { Title: "Dil Se", Duration: 163, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Dark']", Popularity: 82 },
  { Title: "Kaththi", Duration: 156, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Inspirational']", Popularity: 78 },
  { Title: "Piku", Duration: 123, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Emotional', 'Entertainment']", Popularity: 82 },
  { Title: "Devdas", Duration: 186, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Dark', 'Emotional']", Popularity: 82 },
  { Title: "Thuppakki", Duration: 158, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Thriller']", Popularity: 78 },
  { Title: "Delhi Belly", Duration: 103, Genre: "Comedy", SubGenre: "Crime", Tags: "['Comedy', 'Dark', 'Entertainment']", Popularity: 75 },
  { Title: "Aankhen", Duration: 175, Genre: "Action", SubGenre: "Crime", Tags: "['Thriller', 'Action-packed']", Popularity: 72 },
  { Title: "Detective Byomkesh Bakshy!", Duration: 139, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller']", Popularity: 72 },
  { Title: "1 - Nenokkadine", Duration: 166, Genre: "Action", SubGenre: "Psychological", Tags: "['Action-packed', 'Thriller']", Popularity: 68 },
  { Title: "Raanjhanaa", Duration: 144, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Emotional']", Popularity: 78 },
  { Title: "Qayamat Se Qayamat Tak", Duration: 163, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic']", Popularity: 82 },
  { Title: "Trapped", Duration: 103, Genre: "Thriller", SubGenre: "Mystery", Tags: "['Thriller', 'Mind-bending']", Popularity: 72 },
  { Title: "Rocket Singh: Salesman of the Year", Duration: 155, Genre: "Comedy", SubGenre: "Family", Tags: "['Inspirational', 'Entertainment']", Popularity: 75 },
  { Title: "Khakee", Duration: 186, Genre: "Action", SubGenre: "Crime", Tags: "['Action-packed', 'Thriller']", Popularity: 78 },
  { Title: "The Ghazi Attack", Duration: 112, Genre: "Action", SubGenre: "War", Tags: "['Action-packed', 'Real-life Story']", Popularity: 72 },
  { Title: "Amar Akbar Anthony", Duration: 184, Genre: "Action", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 80 },
  { Title: "Hungama", Duration: 144, Genre: "Comedy", SubGenre: "Family", Tags: "['Comedy', 'Entertainment']", Popularity: 72 },
  { Title: "Rehnaa Hai Terre Dil Mein", Duration: 138, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 72 },
  { Title: "Hum Dil De Chuke Sanam", Duration: 183, Genre: "Romance", SubGenre: "Historical", Tags: "['Romantic', 'Emotional']", Popularity: 82 },
  { Title: "Hum Aapke Hain Koun!", Duration: 206, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 82 },
  { Title: "Rangeela", Duration: 143, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 75 },
  { Title: "Socha Na Tha", Duration: 128, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 65 },
  { Title: "Jaane Tu Ya Jaane Na", Duration: 136, Genre: "Romance", SubGenre: "Family", Tags: "['Romantic', 'Entertainment']", Popularity: 72 },
  { Title: "Ghilli", Duration: 169, Genre: "Action", SubGenre: "Adventure", Tags: "['Action-packed', 'Entertainment']", Popularity: 78 }
];

async function insertExtraMovies() {
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

    let insertedCount = 0;
    let skippedCount = 0;

    for (const movie of extraMovies) {
      try {
        // Check if exists
        const [existing] = await pool.query('SELECT movie_id FROM movies WHERE title = ?', [movie.Title]);
        if (existing.length > 0) {
          skippedCount++;
          continue; // Skip duplicate
        }

        const [result] = await pool.query(
          'INSERT INTO movies (title, genre, sub_genre, duration_minutes, popularity) VALUES (?, ?, ?, ?, ?)',
          [movie.Title, movie.Genre, movie.SubGenre, movie.Duration, movie.Popularity]
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
                console.warn(`Warning: Tag "${tagName}" not found in movie_tags_master for movie "${movie.Title}"`);
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
      } catch (err) {
        console.error(`Failed to insert movie "${movie.Title}":`, err.message);
      }
    }

    console.log(`Successfully inserted ${insertedCount} new movies. Skipped ${skippedCount} duplicates.`);
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await pool.end();
  }
}

insertExtraMovies();
