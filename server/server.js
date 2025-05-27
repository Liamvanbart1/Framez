import dotenv from "dotenv";
import "dotenv/config";
import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { Liquid } from "liquidjs";
import sirv from "sirv";
dotenv.config();

const engine = new Liquid({
  extname: ".liquid",
});

const app = new App();

app
  .use(logger())
  .use("/", sirv("dist"))
  .listen(3000, () => console.log("Server available on http://localhost:3000"));

// stuur de info naar de index pagina
app.get("/", async (req, res) => {
  // haal de api op om mee te sturen
  const yearUrl = `https://archive.framerframed.nl/api/get-years`;
  const responseYear = await fetch(yearUrl);
  const jsonYear = await responseYear.json();

  return res.send(
    renderTemplate("server/views/index.liquid", {
      title: "Home",
      years: jsonYear.nodes,
    })
  );
});

// als er op de knop gedrukt word van een jaar
app.get("/year/:year", async (req, res) => {
  // het jaar word meegegeven
  console.log(req.params.year);
  const year = req.params.year;

  // roep de api op
  const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/143`;
  const response = await fetch(url);
  const json = await response.json();

  console.log(json.events[0].node);

  // laad de detailpagina voor de expos
  return res.send(
    renderTemplate("server/views/events.liquid", {
      title: "Events",
      event: json.events,
      year: year,
    })
  );
});

app.get("/event/:event", async (req, res) => {
  const uuid = req.params.event;

  try {
    // Haal de node-informatie op via UUID
    const url = `https://archive.framerframed.nl/api/node-by-id/${uuid}`;
    const response = await fetch(url);
    const json = await response.json();

    // Render met opgehaalde node
    return res.send(
      renderTemplate("server/views/detail.liquid", {
        title: json.node.title_nl || json.node.title_en || "Event detail",
        event: json.node,
        assets: json.assets || [],
        relations: json.rels || [],
      })
    );
  } catch (error) {
    console.error("Fout bij ophalen event:", error);
    return res.status(500).send("Fout bij ophalen eventgegevens.");
  }
});

app.get("/search", async (req, res) => {
  const baseUrl = process.env.NIEUWE_BASE_URL;
  const query = req.query.q;
  console.log(baseUrl);

  try {
    const apiUrl = `${baseUrl}/search?s=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    res.render("search", { results: data, query });
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).send("Search error");
  }
});
