document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  fetchTrending();
  fetchTopRated();
  fetchUpcoming();

  const moodSelector = document.getElementById("moodSelector");
  if (moodSelector) {
    moodSelector.addEventListener("change", fetchMoodMovies);
  }
});

// 🌗 Theme Toggle
const themeToggle = document.getElementById("themeToggle");

function applyTheme(mode) {
  document.body.className = mode + "-mode";
  themeToggle.checked = mode === "light";
  localStorage.setItem("theme", mode);
}

themeToggle.addEventListener("change", () => {
  applyTheme(themeToggle.checked ? "light" : "dark");
});

// 🔍 Movie Search
async function searchMovie() {
  const movieName = document.getElementById("movieSearch").value.trim();
  const container = document.getElementById("movieDetails");

  if (!movieName) return alert("Please enter a movie name!");
  container.innerHTML = "<p>🔍 Searching...</p>";

  // Clear other sections for better UX
  clearSections();

  try {
    const res = await fetch(`/search?name=${encodeURIComponent(movieName)}`);
    const data = await res.json();
    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>❌ No movies found.</p>";
    } else {
      displayMovies(data, container);
      container.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error searching for movie.</p>";
    console.error(err);
  }
}

// 🎬 Trending
async function fetchTrending() {
  const container = document.getElementById("trendingSection");
  if (!container) return;

  container.innerHTML = "<p>Loading trending movies...</p>";
  try {
    const res = await fetch("/trending");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error loading trending movies.</p>";
    console.error(err);
  }
}

// 🏆 Top Rated
async function fetchTopRated() {
  const container = document.getElementById("topRatedSection");
  if (!container) return;

  container.innerHTML = "<p>Loading top-rated movies...</p>";
  try {
    const res = await fetch("/top-rated");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error loading top-rated movies.</p>";
    console.error(err);
  }
}

// ⏳ Upcoming
async function fetchUpcoming() {
  const container = document.getElementById("upcomingSection");
  if (!container) return;

  container.innerHTML = "<p>Loading upcoming movies...</p>";
  try {
    const res = await fetch("/upcoming");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error loading upcoming movies.</p>";
    console.error(err);
  }
}

// 💡 Mood-based Fetch
async function fetchMoodMovies() {
  const moodSelector = document.getElementById("moodSelector");
  const selectedMood = moodSelector.value;
  const container = document.getElementById("movieDetails");

  if (!selectedMood) return;

  container.innerHTML = `<p>🎭 Fetching "${selectedMood}" mood movies...</p>`;

  // Clear other sections
  clearSections();

  try {
    const res = await fetch(`/mood?type=${encodeURIComponent(selectedMood)}`);
    const data = await res.json();

    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<p>❌ No "${selectedMood}" movies found.</p>`;
    } else {
      displayMovies(data, container);
      container.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error fetching mood-based movies.</p>";
    console.error(err);
  }
}

// 🧹 Clear Other Sections
function clearSections() {
  const sections = ["trendingSection", "topRatedSection", "upcomingSection"];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.innerHTML = "";
  });
}

// 🎴 Display Movies
function displayMovies(movies, container) {
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.onclick = () => {
      window.location.href = `movie.html?id=${movie.id}`;
    };

    card.innerHTML = `
      <img src="${movie.poster || 'https://via.placeholder.com/250x375?text=No+Image'}" alt="${movie.title}">
      <h3>${movie.title} (${movie.year})</h3>
      <p><strong>⭐ Rating:</strong> ${movie.rating}</p>
      <p>${movie.description.slice(0, 100)}...</p>
    `;

    container.appendChild(card);
  });
}
