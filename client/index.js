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
      overlay?.classList.remove("visible");
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          // Filter alleen types met uuid en die in de lijst
          const filtered = data.results.filter(
            (result) =>
              result.uuid &&
              result.nodetype &&
              allowedTypes.includes(result.nodetype.toLowerCase())
          );

          if (filtered.length > 0) {
            resultsContainer.innerHTML = filtered
              .map((result) => {
                const type = result.nodetype.toLowerCase();
                const title =
                  result.title || result.title_en || result.name || "No title";
                return `
                  <li
                    class="framez-search-results"
                    data-uuid="${result.uuid}"
                    data-type="${type}"
                    style="cursor: pointer;"
                  >
                    <a class="framez-search-results" href="#">
                      ${title}
                    </a>
                  </li>`;
              })
              .join("");
            resultsContainer.style.display = "block";
            overlay?.classList.add("visible");
          } else {
            resultsContainer.innerHTML = "<li>No results found</li>";
            resultsContainer.style.display = "block";
            overlay?.classList.add("visible");
          }
        } else {
          resultsContainer.innerHTML = "<li>No results found</li>";
          resultsContainer.style.display = "block";
          overlay?.classList.add("visible");
        }
      } catch (err) {
        resultsContainer.innerHTML = "<li>Error loading search</li>";
        resultsContainer.style.display = "block";
        overlay?.classList.add("visible");
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
      overlay?.classList.remove("visible");
    }
  });

  resultsContainer?.addEventListener("click", (e) => {
    const el = e.target.closest("li[data-uuid][data-type]");
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

if (
  document.querySelector("#framez-search-input") &&
  document.querySelector("#framez-search-results")
) {
  setupSearch(
    "#framez-search-input",
    "#framez-search-results",
    "#framez-search-overlay"
  );
}

if (
  document.querySelector("#search") &&
  document.querySelector(".search-results")
) {
  setupSearch("#search", ".search-results");
}

const setupImageToggle = () => {
  const toggleCheckbox = document.getElementById("image-toggle");

  if (!toggleCheckbox) return;

  const toggleImages = (disabled) => {
    document.body.classList.toggle("no-images", disabled);

    document.querySelectorAll("img").forEach((img) => {
      if (disabled) {
        if (!img.dataset.src) {
          img.dataset.src = img.src;
          img.src = "";
        }
      } else {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
      }
    });
  };

  // Laden uit localstorage
  const imagesDisabled = localStorage.getItem("disableImages") === "true";
  toggleCheckbox.checked = !imagesDisabled; // checked = images aan
  toggleImages(imagesDisabled);

  // Handle change event
  toggleCheckbox.addEventListener("change", () => {
    const disabled = !toggleCheckbox.checked; // if not checked images uit
    localStorage.setItem("disableImages", disabled);
    toggleImages(disabled);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupImageToggle();
});
