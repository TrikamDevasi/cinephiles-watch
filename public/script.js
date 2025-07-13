document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);
  fetchTrending();

  // Mood event listener setup
  const moodSelector = document.getElementById("moodSelector");
  if (moodSelector) {
    moodSelector.addEventListener("change", fetchMoodMovies);
  }
});

// 🔥 Theme toggle logic
const themeToggle = document.getElementById("themeToggle");

function applyTheme(mode) {
  document.body.className = mode + "-mode";
  themeToggle.checked = mode === "light";
  localStorage.setItem("theme", mode);
}

themeToggle.addEventListener("change", () => {
  applyTheme(themeToggle.checked ? "light" : "dark");
});

// 🔍 Movie search
async function searchMovie() {
  const movieName = document.getElementById('movieSearch').value.trim();
  const container = document.getElementById("movieDetails");

  if (!movieName) {
    alert("Please enter a movie name!");
    return;
  }

  container.innerHTML = "<p>Searching...</p>";

  try {
    const res = await fetch(`/search?name=${encodeURIComponent(movieName)}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>No movies found.</p>";
    } else {
      displayMovies(data);
    }
  } catch (err) {
    container.innerHTML = "<p>Error searching for movie.</p>";
    console.error(err);
  }
}

// 🎬 Trending movies
async function fetchTrending() {
  const container = document.getElementById("movieDetails");
  container.innerHTML = "<p>Loading trending movies...</p>";

  try {
    const res = await fetch('/trending');
    const data = await res.json();
    displayMovies(data);
  } catch (err) {
    container.innerHTML = "<p>Error loading trending movies.</p>";
    console.error(err);
  }
}

// 💡 Mood-based movie recommendations
async function fetchMoodMovies() {
  const moodSelector = document.getElementById("moodSelector");
  const selectedMood = moodSelector.value;
  const container = document.getElementById("movieDetails");

  if (!selectedMood) {
    return;
  }

  container.innerHTML = `<p>Fetching "${selectedMood}" mood movies...</p>`;

  try {
    const res = await fetch(`/mood?type=${encodeURIComponent(selectedMood)}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<p>No "${selectedMood}" mood movies found.</p>`;
    } else {
      displayMovies(data);
    }
  } catch (err) {
    container.innerHTML = "<p>Error fetching mood-based movies.</p>";
    console.error(err);
  }
}

// 🧩 Render Movie Cards
function displayMovies(movies) {
  const container = document.getElementById("movieDetails");
  container.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.onclick = () => {
      window.location.href = `movie.html?id=${movie.id}`;
    };
    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <h3>${movie.title} (${movie.year})</h3>
      <p><strong>⭐ Rating:</strong> ${movie.rating}</p>
      <p>${movie.description.slice(0, 100)}...</p>
    `;
    container.appendChild(card);
  });
}
