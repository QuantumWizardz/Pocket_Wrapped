const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const contentRoutes = require('./routes/content');
const insightsRoutes = require('./routes/insights');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/', contentRoutes); // /books, /movies, /travel
app.use('/insights', insightsRoutes);
app.use('/recommendations', recommendationsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
