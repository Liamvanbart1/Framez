import "./index.css";

const input = document.getElementById("search-input");
const overlay = document.getElementById("search-overlay");
const resultsContainer = document.getElementById("search-results");

const allowedTypes = [
  "person",
  "organisation",
  "collective",
  "event",
  "launch",
  "article",
  "review",
];

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
        const filtered = data.results.filter((result) =>
          allowedTypes.includes(result.nodetype?.toLowerCase())
        );

        if (filtered.length > 0) {
          resultsContainer.innerHTML = filtered
            .map((result) => {
              const type = result.nodetype.toLowerCase();
              return `
                <a 
                  href="#" 
                  class="search-result block p-2 hover:bg-gray-100" 
                  data-uuid="${result.uuid}" 
                  data-type="${type}"
                >
                  ${result.title || result.title_en || result.name}
                </a>`;
            })
            .join("");

          overlay.classList.remove("hidden");

          document.querySelectorAll(".search-result").forEach((el) => {
            el.addEventListener("click", (e) => {
              e.preventDefault();
              const uuid = el.dataset.uuid;
              const type = el.dataset.type;

              let href = "#";
              switch (type) {
                case "person":
                  href = `/person/${uuid}`;
                  break;
                case "organisation":
                  href = `/organisation/${uuid}`;
                  break;
                case "collective":
                  href = `/collective/${uuid}`;
                  break;
                case "event":
                  href = `/event/${uuid}`;
                case "launch":
                  href = `/event/${uuid}`;
                  break;
                case "article":
                  href = `/event/${uuid}`;
                  break;
                case "review":
                  href = `/event/${uuid}`;
                  break;
                default:
                  return;
              }

              window.location.href = href;
            });
          });
        } else {
          resultsContainer.innerHTML = "<div>No results found</div>";
          overlay.classList.remove("hidden");
        }
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
