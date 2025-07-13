const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || "74ce9a72bf119c55eb9f81025b4601d1";

app.use(express.static("public"));

// 🔹 Trending movies route
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/trending/movie/week', {
            params: { api_key: TMDB_API_KEY }
        });

        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date?.split('-')[0] || 'Unknown',
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '',
            description: movie.overview || 'No description available.',
            rating: movie.vote_average || 'N/A'
        }));

        res.json(movies);
    } catch (error) {
        console.error("Trending Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch trending movies." });
    }
});

// 🔹 Search movies route
app.get('/search', async (req, res) => {
    try {
        const movieName = req.query.name;
        if (!movieName) {
            return res.status(400).json({ error: "Please provide a movie name!" });
        }

        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
                api_key: TMDB_API_KEY,
                query: movieName
            }
        });

        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date?.split('-')[0] || 'Unknown',
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '',
            description: movie.overview || 'No description available.',
            rating: movie.vote_average || 'N/A'
        }));

        res.json(movies);
    } catch (error) {
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Failed to search movie." });
    }
});

// 🔹 Movie details route (IMPORTANT: above app.listen!)
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
        console.error("Error fetching movie details:", err.message);
        res.status(500).json({ error: "Failed to load movie details." });
    }
});

// ✅ Start server (must come LAST!)
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
