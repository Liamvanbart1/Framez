import "./index.css";

const allowedTypes = [
  "person",
  "organisation",
  "collective",
  "event",
  "launch",
  "article",
  "review",
];

function setupSearch(inputSelector, resultsSelector, overlaySelector = null) {
  const input = document.querySelector(inputSelector);
  const resultsContainer = document.querySelector(resultsSelector);
  const overlay = overlaySelector
    ? document.querySelector(overlaySelector)
    : null;

  let timeout;

  input?.addEventListener("input", () => {
    const query = input.value.trim();

    clearTimeout(timeout);

    if (query.length < 2) {
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
      overlay?.classList.add("hidden");
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const filtered = data.results.filter((result) =>
            allowedTypes.includes(result.nodetype?.toLowerCase())
          );

          if (filtered.length > 0) {
            resultsContainer.innerHTML = filtered
              .map((result) => {
                const type = result.nodetype?.toLowerCase();
                const title =
                  result.title || result.title_en || result.name || "No title";
                return `
                  <li>
                    <a 
                      href="#" 
                      class="search-result block p-2 hover:bg-gray-100" 
                      data-uuid="${result.uuid}" 
                      data-type="${type}"
                    >
                      ${title}
                    </a>
                  </li>`;
              })
              .join("");

            resultsContainer.style.display = "block"; // show results container
            overlay?.classList.remove("hidden");
          } else {
            resultsContainer.innerHTML = "<li>No results found</li>";
            resultsContainer.style.display = "block";
            overlay?.classList.remove("hidden");
          }
        } else {
          resultsContainer.innerHTML = "<li>No results found</li>";
          resultsContainer.style.display = "block";
          overlay?.classList.remove("hidden");
        }
      } catch (err) {
        resultsContainer.innerHTML = "<li>Error loading search</li>";
        resultsContainer.style.display = "block";
        overlay?.classList.remove("hidden");
        console.error(err);
      }
    }, 300);
  });

  // Close results on click outside input and results
  document.addEventListener("click", (e) => {
    if (
      !input.closest(".search-container")?.contains(e.target) &&
      !document.getElementById("search-form")?.contains(e.target)
    ) {
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
      overlay?.classList.add("hidden");
    }
  });

  resultsContainer?.addEventListener("click", (e) => {
    const el = e.target.closest(".search-result");
    if (!el) return;

    e.preventDefault();
    const uuid = el.dataset.uuid;
    const type = el.dataset.type;

    let href = `/event/${uuid}`;
    switch (type) {
      case "person":
        href = `/person/${uuid}`;
        break;
      case "organisation":
        href = `/organisation/${uuid}`;
        break;
      case "collective":
      case "event":
      case "launch":
      case "article":
      case "review":
        href = `/event/${uuid}`;
        break;
    }

    window.location.href = href;
  });
}

// Setup the search instances
setupSearch("#search-input", "#search-results", "#search-overlay"); // header
setupSearch("#search", ".search-results"); // homepage
