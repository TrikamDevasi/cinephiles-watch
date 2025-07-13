document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  fetchTrending();
  fetchTopRated();
  fetchUpcoming();
  populateGenres();

  document.getElementById("themeToggle").addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  document.getElementById("moodSelector")?.addEventListener("change", fetchMoodMovies);
  document.getElementById("searchForm")?.addEventListener("submit", handleSearch);
  document.querySelector("button[onclick='applyFilters()']")?.addEventListener("click", handleSearch);
});

function applyTheme(mode) {
  document.body.className = mode + "-mode";
  document.getElementById("themeToggle").checked = mode === "light";
  localStorage.setItem("theme", mode);
}

function clearSections() {
  ["trendingSection", "topRatedSection", "upcomingSection", "searchResults", "movieDetails"]
    .forEach(id => document.getElementById(id).innerHTML = "");
}

async function fetchTrending() {
  const container = document.getElementById("trendingSection");
  container.innerHTML = "<p>Loading trending movies...</p>";
  try {
    const res = await fetch("/trending");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error loading trending movies.</p>";
  }
}

async function fetchTopRated() {
  const container = document.getElementById("topRatedSection");
  container.innerHTML = "<p>Loading top-rated movies...</p>";
  try {
    const res = await fetch("/top-rated");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error loading top-rated movies.</p>";
  }
}

async function fetchUpcoming() {
  const container = document.getElementById("upcomingSection");
  container.innerHTML = "<p>Loading upcoming movies...</p>";
  try {
    const res = await fetch("/upcoming");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error loading upcoming movies.</p>";
  }
}

async function populateGenres() {
  const genreSelect = document.getElementById("genreFilter");
  try {
    const res = await fetch("/genres");
    const genres = await res.json();
    genres.forEach(g => {
      const option = document.createElement("option");
      option.value = g.id;
      option.textContent = g.name;
      genreSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error fetching genres:", err);
  }
}

async function fetchMoodMovies() {
  const mood = document.getElementById("moodSelector").value;
  const container = document.getElementById("movieDetails");
  if (!mood) return;

  clearSections();
  container.innerHTML = `<p>🎭 Fetching "${mood}" mood movies...</p>`;
  try {
    const res = await fetch(`/mood?type=${encodeURIComponent(mood)}`);
    const data = await res.json();
    container.innerHTML = "";
    if (!data.length) {
      container.innerHTML = "<p>❌ No movies found for this mood.</p>";
    } else {
      displayMovies(data, container);
      container.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error fetching mood-based movies.</p>";
  }
}

async function handleSearch(e) {
  if (e) e.preventDefault();

  const movieName = document.getElementById("movieSearch").value.trim();
  const genre = document.getElementById("genreFilter").value;
  const year = document.getElementById("yearFilter").value;
  const language = document.getElementById("languageFilter").value;
  const container = document.getElementById("searchResults");

  if (!movieName && !genre && !year && !language) {
    alert("Please enter a movie name or apply a filter!");
    return;
  }

  container.innerHTML = "<p>🔍 Searching...</p>";
  clearSections();

  const query = new URLSearchParams();
  if (movieName) query.append("name", movieName);
  if (genre) query.append("genre", genre);
  if (year) query.append("year", year);
  if (language) query.append("language", language);

  try {
    const res = await fetch(`/search?${query.toString()}`);
    const data = await res.json();

    container.innerHTML = "";
    if (!data.length) {
      container.innerHTML = "<p>❌ No movies found.</p>";
    } else {
      displayMovies(data, container);
      container.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    container.innerHTML = "<p>⚠️ Error during search.</p>";
  }
}

function displayMovies(movies, container) {
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.onclick = () => {
      window.location.href = `movie.html?id=${movie.id}`;
    };
    card.innerHTML = `
      <img src="${movie.poster || 'https://via.placeholder.com/250x375?text=No+Image'}" alt="${movie.title}">
      <h3>${movie.title} (${movie.year || ''})</h3>
      <p><strong>⭐ Rating:</strong> ${movie.rating || 'N/A'}</p>
      <p>${movie.description ? movie.description.slice(0, 100) + '...' : ''}</p>
    `;
    container.appendChild(card);
  });
}
const movieSearchInput = document.getElementById("movieSearch");
const suggestionBox = document.createElement("div");
suggestionBox.classList.add("suggestion-box");
movieSearchInput.parentNode.appendChild(suggestionBox);

movieSearchInput.addEventListener("input", async () => {
  const query = movieSearchInput.value.trim();
  if (!query || query.length < 2) {
    suggestionBox.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`/suggest?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    suggestionBox.innerHTML = "";

    data.slice(0, 5).forEach(movie => {
      const div = document.createElement("div");
      div.textContent = `${movie.title} (${movie.year})`;
      div.classList.add("suggestion-item");
      div.onclick = () => {
        movieSearchInput.value = movie.title;
        suggestionBox.innerHTML = "";
      };
      suggestionBox.appendChild(div);
    });
  } catch (err) {
    console.error("Suggestion fetch error:", err);
    suggestionBox.innerHTML = "";
  }
});
