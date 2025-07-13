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
    const { details, credits, images, videos } = await res.json();

    const castList = credits.cast.slice(0, 6).map(c => c.name).join(", ") || "Not available";
    const screenshots = images.backdrops.slice(0, 3).map(i => `https://image.tmdb.org/t/p/w500${i.file_path}`);
    const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    movieDetailsDiv.innerHTML = `
      <h2>${details.title} (${details.release_date?.split("-")[0] || "N/A"})</h2>
      <img src="https://image.tmdb.org/t/p/w500${details.poster_path}" 
           alt="${details.title} Poster" 
           loading="lazy"
           style="max-width: 250px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin-bottom: 15px;" />

      <p><strong>🎭 Genres:</strong> ${details.genres.map(g => g.name).join(", ") || "N/A"}</p>
      <p><strong>⭐ Rating:</strong> ${details.vote_average || "N/A"} / 10</p>
      <p><strong>⏱ Runtime:</strong> ${details.runtime || "N/A"} mins</p>
      <p><strong>🌍 Language:</strong> ${details.original_language?.toUpperCase() || "N/A"}</p>
      <p><strong>🎬 Cast:</strong> ${castList}</p>
      <p><strong>📝 Overview:</strong> ${details.overview || "No overview available."}</p>

      ${screenshots.length ? `<h3>Screenshots</h3>` : ""}
      <div style="display: flex; flex-wrap: wrap; justify-content: center;">
        ${screenshots.map(src => `
          <img 
            src="${src}" 
            alt="${details.title} Screenshot" 
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
