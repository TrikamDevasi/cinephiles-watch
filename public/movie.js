const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
const movieDetailsDiv = document.getElementById("movieDetails");

async function loadMovieDetails() {
  if (!movieId) {
    movieDetailsDiv.innerHTML = "<p>❌ No movie ID found.</p>";
    return;
  }

  try {
    const res = await fetch(`/movie/${movieId}`);
    const data = await res.json();

    // Destructure or assign with fallbacks
    const title = data.title || "N/A";
    const releaseYear = data.release_date ? data.release_date.split("-")[0] : "N/A";
    const posterPath = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : "";
    const genres = Array.isArray(data.genres) && data.genres.length > 0
      ? data.genres.map(g => g.name).join(", ")
      : "N/A";
    const rating = data.vote_average || "N/A";
    const runtime = data.runtime || "N/A";
    const language = data.original_language ? data.original_language.toUpperCase() : "N/A";
    const overview = data.overview || "No overview available.";

    // Cast: assuming data.cast is an array of cast members with a 'name' property
    const castList = Array.isArray(data.cast) && data.cast.length > 0
      ? data.cast.slice(0, 6).map(c => c.name).join(", ")
      : "Not available";

    // Screenshots: expecting data.images.backdrops array, fallback to empty array if missing
    const backdrops = data.images && Array.isArray(data.images.backdrops) ? data.images.backdrops : [];
    const screenshots = backdrops.slice(0, 3).map(i => `https://image.tmdb.org/t/p/w500${i.file_path}`);

    // Trailer: find YouTube trailer from data.videos.results
    const videos = data.videos && Array.isArray(data.videos.results) ? data.videos.results : [];
    const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");

    movieDetailsDiv.innerHTML = `
      <h2>${title} (${releaseYear})</h2>
      ${posterPath ? `<img src="${posterPath}" alt="${title} Poster" loading="lazy" style="max-width: 250px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin-bottom: 15px;" />` : ""}
      <p><strong>🎭 Genres:</strong> ${genres}</p>
      <p><strong>⭐ Rating:</strong> ${rating} / 10</p>
      <p><strong>⏱ Runtime:</strong> ${runtime} mins</p>
      <p><strong>🌍 Language:</strong> ${language}</p>
      <p><strong>🎬 Cast:</strong> ${castList}</p>
      <p><strong>📝 Overview:</strong> ${overview}</p>

      ${screenshots.length ? `<h3>Screenshots</h3>` : ""}
      <div style="display: flex; flex-wrap: wrap; justify-content: center;">
        ${screenshots.map(src => `
          <img 
            src="${src}" 
            alt="${title} Screenshot" 
            loading="lazy" 
            style="width: 220px; margin: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);" 
          />
        `).join("")}
      </div>

      ${trailer ? `
        <p>
          <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" rel="noopener noreferrer">
            <button style="padding: 12px 20px; background-color: orange; color: black; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">▶ Watch Trailer</button>
          </a>
        </p>
      ` : ""}
    `;
  } catch (err) {
    console.error("Movie Load Error:", err);
    movieDetailsDiv.innerHTML = `<p>❌ Failed to load movie info. Please try again later.</p>`;
  }
}

loadMovieDetails();
