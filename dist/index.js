const input = document.getElementById("search-input");
const overlay = document.getElementById("search-overlay");
const resultsContainer = document.getElementById("search-results");
let timeout;
input.addEventListener("input", () => {
  const query = input.value.trim();
  clearTimeout(timeout);
  if (query.length < 2) {
    overlay.classList.add("hidden");
    resultsContainer.innerHTML = "";
    return;
  }
  timeout = setTimeout(async () => {
    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        resultsContainer.innerHTML = data.results.map(
          (result) => `<div>${result.title || result.title_en || result.name}</div>`
        ).join("");
        overlay.classList.remove("hidden");
      } else {
        resultsContainer.innerHTML = "<div>No results found</div>";
        overlay.classList.remove("hidden");
      }
    } catch (err) {
      resultsContainer.innerHTML = "<div>Error loading search</div>";
      overlay.classList.remove("hidden");
      console.error(err);
    }
  }, 300);
});
document.addEventListener("click", (e) => {
  if (!document.getElementById("search-form").contains(e.target)) {
    overlay.classList.add("hidden");
  }
});
console.log("Hello, world!");
