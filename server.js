const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || "74ce9a72bf119c55eb9f81025b4601d1";

app.use(express.static("public"));

// 🔁 Format movies for list pages
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
    res.status(500).json({ error: "Failed to fetch trending movies." });
  }
});

// 🔹 Search
app.get('/search', async (req, res) => {
  try {
    const { name, genre, year, language } = req.query;

    const baseUrl = name
      ? 'https://api.themoviedb.org/3/search/movie'
      : 'https://api.themoviedb.org/3/discover/movie';

    const params = {
      api_key: TMDB_API_KEY,
      include_adult: false,
      sort_by: 'popularity.desc',
      query: name || undefined,
      with_genres: genre || undefined,
      primary_release_year: year || undefined,
      with_original_language: language || undefined,
    };

    const response = await axios.get(baseUrl, { params });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    res.status(500).json({ error: "Failed to search movies." });
  }
});

// 🔹 Mood
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
    return res.status(400).json({ error: "Invalid mood type." });
  }

  try {
    const genreRes = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
      params: { api_key: TMDB_API_KEY }
    });

    const genreIds = genreRes.data.genres
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
    res.status(500).json({ error: "Failed to fetch mood-based movies." });
  }
});

// 🔹 Movie Details with Age Rating
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    const [detailsRes, creditsRes, imagesRes, releaseRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/images`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/release_dates`, {
        params: { api_key: TMDB_API_KEY }
      })
    ]);

    const details = detailsRes.data;
    const images = imagesRes.data.backdrops.map(b => `https://image.tmdb.org/t/p/w500${b.file_path}`);
    const cast = creditsRes.data.cast.slice(0, 10).map(actor => ({
      name: actor.name,
      image: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null
    }));
    const crew = creditsRes.data.crew.slice(0, 10).map(member => ({
      name: member.name,
      job: member.job,
      image: member.profile_path ? `https://image.tmdb.org/t/p/w200${member.profile_path}` : null
    }));

    let ageRating = "N/A";
    const releases = releaseRes.data.results;
    const region = releases.find(r => r.iso_3166_1 === "IN") || releases.find(r => r.iso_3166_1 === "US");
    if (region && region.release_dates.length > 0) {
      ageRating = region.release_dates[0].certification || "N/A";
    }

    res.json({
      id: details.id,
      title: details.title,
      year: details.release_date?.split('-')[0],
      poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      rating: details.vote_average,
      runtime: details.runtime,
      genres: details.genres?.map(g => g.name),
      language: details.original_language,
      description: details.overview,
      ageRating,
      images,
      cast,
      crew
    });
  } catch (error) {
    console.error("Movie Details Error:", error.message);
    res.status(500).json({ error: "Failed to load movie details." });
  }
});

// 🔹 Top Rated
app.get('/top-rated', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/top_rated', {
      params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 }
    });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top-rated movies." });
  }
});

// 🔹 Upcoming
app.get('/upcoming', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/upcoming', {
      params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 }
    });
    res.json(formatMovies(response.data.results));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming movies." });
  }
});

// 🔹 Genres
app.get('/genres', async (req, res) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY }
    });
    res.json(response.data.genres);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movies by genre" });
  }
});

// 🔹 Autocomplete Suggestions
app.get('/suggest', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: "en-US",
        page: 1
      }
    });

    const results = response.data.results.map(m => ({
      id: m.id,
      title: m.title,
      year: m.release_date?.split('-')[0] || "N/A"
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json([]);
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
