const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

const movieDetailsDiv = document.getElementById("movieDetails");

async function loadMovieDetails() {
  try {
    const res = await fetch(`/movie/${movieId}`);
    const { details, credits, images, videos } = await res.json();

    const castList = credits.cast.slice(0, 6).map(c => c.name).join(", ");
    const screenshots = images.backdrops.slice(0, 3).map(i => `https://image.tmdb.org/t/p/w500${i.file_path}`);
    const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    movieDetailsDiv.innerHTML = `
      <h2>${details.title} (${details.release_date?.split("-")[0]})</h2>
      <img src="https://image.tmdb.org/t/p/w500${details.poster_path}" style="max-width: 200px; border-radius: 10px;" />
      <p><strong>Genres:</strong> ${details.genres.map(g => g.name).join(", ")}</p>
      <p><strong>Rating:</strong> ${details.vote_average}/10</p>
      <p><strong>Runtime:</strong> ${details.runtime} mins</p>
      <p><strong>Language:</strong> ${details.original_language.toUpperCase()}</p>
      <p><strong>Cast:</strong> ${castList}</p>
      <p><strong>Overview:</strong> ${details.overview}</p>
      ${screenshots.map(src => `<img src="${src}" style="width: 200px; margin: 10px; border-radius: 8px;" />`).join("")}
      ${trailer ? `<p><a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank"><button>▶ Watch Trailer</button></a></p>` : ""}
    `;
  } catch (err) {
    movieDetailsDiv.innerHTML = `<p>❌ Failed to load movie info. Try again later.</p>`;
    console.error(err);
  }
}

loadMovieDetails();
