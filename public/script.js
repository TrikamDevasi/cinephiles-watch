window.onload = fetchTrending;
async function fetchTrending() {
    const container = document.getElementById("movieDetails");
    container.innerHTML = "<p>Loading trending movies...</p>";

    try {
        const res = await fetch('/trending');
        const data = await res.json();
        displayMovies(data);
    } catch (err) {
        container.innerHTML = "<p>Error loading trending movies.</p>";
    }
}

async function searchMovie() {
    const movieName = document.getElementById('movieSearch').value.trim();
    if (!movieName) return alert("Please enter a movie name!");

    const container = document.getElementById("movieDetails");
    container.innerHTML = "<p>Searching...</p>";

    try {
        const res = await fetch(`/search?name=${encodeURIComponent(movieName)}`);
        const data = await res.json();
        if (data.length === 0) {
            container.innerHTML = "<p>No movies found.</p>";
        } else {
            displayMovies(data);
        }
    } catch (err) {
        container.innerHTML = "<p>Error searching for movie.</p>";
    }
}

function displayMovies(movies) {
    const container = document.getElementById("movieDetails");
    container.innerHTML = "";

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <h3>${movie.title} (${movie.year})</h3>
            <p><strong>⭐ Rating:</strong> ${movie.rating}</p>
            <p>${movie.description.slice(0, 100)}...</p>
        `;
        container.appendChild(card);
    });
}
