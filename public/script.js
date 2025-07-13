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

  setupAutocomplete();
});

// 🌗 Apply Theme
function applyTheme(mode) {
  document.body.className = mode + "-mode";
  document.getElementById("themeToggle").checked = mode === "light";
  localStorage.setItem("theme", mode);
}

// 🧹 Clear UI Sections
function clearSections() {
  ["trendingSection", "topRatedSection", "upcomingSection", "searchResults", "movieDetails"]
    .forEach(id => document.getElementById(id).innerHTML = "");
}

// 🔥 Trending
async function fetchTrending() {
  const container = document.getElementById("trendingSection");
  container.innerHTML = "<p>Loading trending movies...</p>";
  try {
    const res = await fetch("/trending");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch {
    container.innerHTML = "<p>⚠️ Error loading trending movies.</p>";
  }
}

// 🏆 Top Rated
async function fetchTopRated() {
  const container = document.getElementById("topRatedSection");
  container.innerHTML = "<p>Loading top-rated movies...</p>";
  try {
    const res = await fetch("/top-rated");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch {
    container.innerHTML = "<p>⚠️ Error loading top-rated movies.</p>";
  }
}

// 📅 Upcoming
async function fetchUpcoming() {
  const container = document.getElementById("upcomingSection");
  container.innerHTML = "<p>Loading upcoming movies...</p>";
  try {
    const res = await fetch("/upcoming");
    const data = await res.json();
    container.innerHTML = "";
    displayMovies(data, container);
  } catch {
    container.innerHTML = "<p>⚠️ Error loading upcoming movies.</p>";
  }
}

// 🎭 Genre List
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

// 😄 Mood Movies
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
  } catch {
    container.innerHTML = "<p>⚠️ Error fetching mood-based movies.</p>";
  }
}

// 🔍 Search + Filters
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
  } catch {
    container.innerHTML = "<p>⚠️ Error during search.</p>";
  }
}

// 🎴 Render Movies
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

// 🧠 Autocomplete Suggestions
function setupAutocomplete() {
  const input = document.getElementById("movieSearch");
  const suggestionBox = document.createElement("ul");
  suggestionBox.id = "autocompleteList";
  suggestionBox.className = "autocomplete-list";
  input.parentNode.appendChild(suggestionBox);

  input.addEventListener("input", async function () {
    const query = this.value.trim();
    suggestionBox.innerHTML = "";
    if (query.length < 2) return;

    try {
      const res = await fetch(`/search?name=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        data.slice(0, 5).forEach(movie => {
          const li = document.createElement("li");
          li.textContent = `${movie.title} (${movie.year})`;
          li.classList.add("autocomplete-item");
          li.onclick = () => {
            input.value = movie.title;
            suggestionBox.innerHTML = "";
            document.getElementById("searchForm").dispatchEvent(new Event("submit"));
          };
          suggestionBox.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    }
  });
}
