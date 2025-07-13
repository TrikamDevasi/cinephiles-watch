const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || "74ce9a72bf119c55eb9f81025b4601d1";

app.use(express.static("public"));

// 🔁 Reusable function to format movies
function formatMovies(apiResults) {
  return apiResults.map(movie => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date?.split('-')[0] || 'Unknown',
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '',
    description: movie.overview || 'No description available.',
    rating: movie.vote_average || 'N/A'
  }));
}

// 🔹 Trending
app.get('/trending', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/trending/movie/week', {
      params: { api_key: TMDB_API_KEY }
    });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    console.error("Trending Error:", error.message);
    res.status(500).json({ error: "Failed to fetch trending movies." });
  }
});

// 🔹 Search
app.get('/search', async (req, res) => {
  try {
    const movieName = req.query.name;
    if (!movieName) return res.status(400).json({ error: "Please provide a movie name!" });

    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: { api_key: TMDB_API_KEY, query: movieName }
    });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ error: "Failed to search movie." });
  }
});

// 🔹 Mood-based Recommendation
const moodMap = {
  happy: ["Comedy", "Adventure", "Music", "Family"],
  emotional: ["Drama"],
  thriller: ["Thriller", "Mystery"],
  romantic: ["Romance"],
  scifi: ["Science Fiction"],
  family: ["Family", "Animation"],
  action: ["Action", "Adventure"]
};

app.get('/mood', async (req, res) => {
  const mood = req.query.type?.toLowerCase();
  if (!mood || !moodMap[mood]) {
    return res.status(400).json({ error: "Invalid or missing mood type." });
  }

  try {
    const genreRes = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
      params: { api_key: TMDB_API_KEY }
    });

    const genreList = genreRes.data.genres;
    const genreIds = genreList
      .filter(genre => moodMap[mood].includes(genre.name))
      .map(genre => genre.id)
      .join(',');

    const discoverRes = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreIds,
        sort_by: "popularity.desc",
        page: 1
      }
    });

    res.json(formatMovies(discoverRes.data.results));
  } catch (error) {
    console.error("Mood Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch mood-based movies." });
  }
});

// 🔹 Movie Details
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    const [detailsRes, creditsRes, imagesRes, videosRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/images`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
        params: { api_key: TMDB_API_KEY }
      }),
    ]);

    res.json({
      details: detailsRes.data,
      credits: creditsRes.data,
      images: imagesRes.data,
      videos: videosRes.data
    });

  } catch (err) {
    console.error("Movie Details Error:", err.message);
    res.status(500).json({ error: "Failed to load movie details." });
  }
});

// 🔹 Top Rated Movies
app.get('/top-rated', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/top_rated', {
      params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 }
    });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    console.error("Top Rated Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch top-rated movies." });
  }
});

// 🔹 Upcoming Movies
app.get('/upcoming', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/upcoming', {
      params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 }
    });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    console.error("Upcoming Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch upcoming movies." });
  }
});

// 🔹 Genres List
app.get('/genres', async (req, res) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY }
    });
    res.json(response.data.genres);
  } catch (err) {
    console.error("Genre List Error:", err.message);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

// 🔹 Movies By Genre
app.get('/by-genre', async (req, res) => {
  const genreId = req.query.id;
  if (!genreId) return res.status(400).json({ error: "Missing genre ID" });

  try {
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreId,
        sort_by: 'popularity.desc'
      }
    });

    res.json(formatMovies(response.data.results));
  } catch (err) {
    console.error("Movies by Genre Error:", err.message);
    res.status(500).json({ error: "Failed to fetch movies by genre" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
