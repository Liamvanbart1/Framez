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
  return res.send(
    renderTemplate("server/views/index.liquid", {
      title: "Home",
    })
  );
});

// Routes voor de overzichtspagina's

app.get("/persons", async (req, res) => {
  try {
    const response = await fetch(
      "https://archive.framerframed.nl/api/ff/persons"
    );
    const data = await response.json();

    const filtered = data.filter((item) => item.person && item.person.uuid);

    res.send(
      renderTemplate("server/views/persons.liquid", {
        title: "All Persons",
        persons: filtered,
        baseUrl: "person",
      })
    );
  } catch (err) {
    console.error("Fout bij ophalen persons:", err);
    res.status(500).send("Fout bij ophalen persons.");
  }
});

app.get("/organisations", async (req, res) => {
  try {
    const response = await fetch(
      "https://archive.framerframed.nl/api/ff/organisations"
    );
    const data = await response.json();

    const filtered = data.filter(
      (item) =>
        item.organisation && item.organisation.name && item.organisation.uuid
    );

    res.send(
      renderTemplate("server/views/organisations.liquid", {
        title: "All Organisations",
        organisations: filtered,
        baseUrl: "organisation",
      })
    );
  } catch (err) {
    console.error("Fout bij ophalen Organisations:", err);
    res.status(500).send("Fout bij ophalen Organisations.");
  }
});

app.get("/events", async (req, res) => {
  try {
    const response = await fetch(
      "https://archive.framerframed.nl/api/ff/events"
    );
    const data = await response.json();

    const filtered = data.filter(
      (item) => item.event && item.event.name && item.event.uuid
    );

    res.send(
      renderTemplate("server/views/events.liquid", {
        title: "All Events",
        events: filtered,
        baseUrl: "event",
      })
    );
  } catch (err) {
    console.error("Fout bij ophalen Events:", err);
    res.status(500).send("Fout bij ophalen Events.");
  }
});

app.get("/years", async (req, res) => {
  try {
    const yearUrl = `https://archive.framerframed.nl/api/get-years`;
    const responseYear = await fetch(yearUrl);
    const jsonYear = await responseYear.json();

    res.send(
      renderTemplate("server/views/years.liquid", {
        title: "Choose a Year",
        years: jsonYear.nodes,
      })
    );
  } catch (err) {
    console.error("Fout bij ophalen jaren:", err);
    res.status(500).send("Fout bij ophalen jaren.");
  }
});

// als er op de knop gedrukt word van een jaar
app.get("/year/:year", async (req, res) => {
  // het jaar word meegegeven
  // console.log(req.params.year);
  const year = req.params.year;

  // roep de api op
  const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/143`;
  const response = await fetch(url);
  const json = await response.json();

  // console.log(json.events[0].node);

  // laad de detailpagina voor de expos
  return res.send(
    renderTemplate("server/views/year.liquid", {
      title: "Events",
      event: json.events,
      year: year,
      baseUrl: "event",
    })
  );
});

app.get("/event/:event", async (req, res) => {
  const uuid = req.params.event;

  if (!uuid || uuid === "undefined") {
    console.warn("Ongeldige UUID meegegeven:", uuid);
    return res.status(400).send("Ongeldig event-ID.");
  }

  try {
    const url = `https://archive.framerframed.nl/api/node-by-id/${uuid}`;
    const response = await fetch(url);
    const json = await response.json();

    const event = json.node;
    const assets = json.assets || [];
    const relations = (json.rels || []).filter((rel) => rel.type !== "asset");

    const relationsWithSubs = await Promise.all(
      relations.map(async (rel) => {
        if (!rel.node?.uuid) return rel;

        try {
          let subRels = [];

          if (rel.type === "person") {
            const personUrl = `https://archive.framerframed.nl/api/rels-for/person/${rel.node.uuid}`;
            const personRes = await fetch(personUrl);
            const personJson = await personRes.json();

            subRels = (personJson.relations || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: personJson.person,
              rels: subRels,
            };
          } else if (rel.type === "organisation") {
            const orgUrl = `https://archive.framerframed.nl/api/rels-for/organisation/${rel.node.uuid}`;
            const orgRes = await fetch(orgUrl);
            const orgJson = await orgRes.json();

            subRels = (orgJson.relations || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: orgJson.person, // Let op: key is 'person' ook bij organisatie API
              rels: subRels,
            };
          } else {
            const subUrl = `https://archive.framerframed.nl/api/node-by-id/${rel.node.uuid}`;
            const subRes = await fetch(subUrl);
            const subJson = await subRes.json();

            subRels = (subJson.rels || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              rels: subRels,
            };
          }
        } catch (error) {
          console.error(
            `Fout bij ophalen sub-relaties van ${rel.node.uuid}:`,
            error
          );
          return { ...rel, rels: [] };
        }
      })
    );

    return res.send(
      renderTemplate("server/views/detail.liquid", {
        title: event.title_nl || event.title_en || "Event detail",
        event,
        assets,
        relations: relationsWithSubs,
      })
    );
  } catch (error) {
    console.error("Fout bij ophalen event:", error);
    return res.status(500).send("Fout bij ophalen eventgegevens.");
  }
});

app.get("/person/:uuid", async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const url = `https://archive.framerframed.nl/api/rels-for/person/${uuid}`;
    const response = await fetch(url);
    const json = await response.json();

    const person = json.person;
    const relations = (json.relations || []).filter(
      (rel) => rel.type !== "asset"
    );

    const relationsWithSubs = await Promise.all(
      relations.map(async (rel) => {
        const relNode = rel.node || rel.object;
        if (!relNode?.uuid) return rel;

        try {
          let subRels = [];

          if (rel.type === "person") {
            const personUrl = `https://archive.framerframed.nl/api/rels-for/person/${relNode.uuid}`;
            const personRes = await fetch(personUrl);
            const personJson = await personRes.json();

            subRels = (personJson.relations || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: personJson.person,
              rels: subRels,
            };
          } else if (rel.type === "organisation") {
            const orgUrl = `https://archive.framerframed.nl/api/rels-for/organisation/${relNode.uuid}`;
            const orgRes = await fetch(orgUrl);
            const orgJson = await orgRes.json();

            subRels = (orgJson.relations || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: orgJson.person,
              rels: subRels,
            };
          } else {
            const subUrl = `https://archive.framerframed.nl/api/node-by-id/${relNode.uuid}`;
            const subRes = await fetch(subUrl);
            const subJson = await subRes.json();

            subRels = (subJson.rels || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: subJson.node,
              rels: subRels,
            };
          }
        } catch (error) {
          console.error(
            `Fout bij ophalen sub-relaties van ${relNode.uuid}:`,
            error
          );
          return { ...rel, rels: [] };
        }
      })
    );

    return res.send(
      renderTemplate("server/views/person-detail.liquid", {
        title: person.name || "Persoon",
        person,
        relations: relationsWithSubs,
      })
    );
  } catch (error) {
    console.error("Fout bij ophalen persoon:", error);
    return res.status(500).send("Fout bij ophalen persoongegevens.");
  }
});

app.get("/organisation/:uuid", async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const url = `https://archive.framerframed.nl/api/rels-for/organisation/${uuid}`;
    const response = await fetch(url);
    const json = await response.json();

    const organisation = json.person || {};
    const relations = (json.relations || []).filter(
      (rel) => rel.type !== "asset"
    );

    const relationsWithSubs = await Promise.all(
      relations.map(async (rel) => {
        const relNode = rel.node || rel.object;
        if (!relNode?.uuid) return rel;

        try {
          let subRels = [];

          if (rel.type === "person") {
            const personUrl = `https://archive.framerframed.nl/api/rels-for/person/${relNode.uuid}`;
            const personRes = await fetch(personUrl);
            const personJson = await personRes.json();

            subRels = (personJson.relations || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: personJson.person,
              rels: subRels,
            };
          } else if (rel.type === "organisation") {
            const orgUrl = `https://archive.framerframed.nl/api/rels-for/organisation/${relNode.uuid}`;
            const orgRes = await fetch(orgUrl);
            const orgJson = await orgRes.json();

            subRels = (orgJson.relations || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: orgJson.person,
              rels: subRels,
            };
          } else {
            const subUrl = `https://archive.framerframed.nl/api/node-by-id/${relNode.uuid}`;
            const subRes = await fetch(subUrl);
            const subJson = await subRes.json();

            subRels = (subJson.rels || []).filter(
              (sub) => sub.type !== "asset"
            );

            return {
              ...rel,
              node: subJson.node,
              rels: subRels,
            };
          }
        } catch (error) {
          console.error(
            `Fout bij ophalen sub-relaties van ${relNode.uuid}:`,
            error
          );
          return { ...rel, rels: [] };
        }
      })
    );

    return res.send(
      renderTemplate("server/views/organisation-detail.liquid", {
        title: organisation.name || "Organisatie",
        organisation,
        relations: relationsWithSubs,
      })
    );
  } catch (error) {
    console.error("Fout bij ophalen organisatie:", error);
    return res.status(500).send("Fout bij ophalen organisatiegegevens.");
  }
});

const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};

app.get("/search", async (req, res) => {
  const baseUrl = "https://archive.framerframed.nl";
  const query = req.query.q;

  try {
    const apiUrl = new URL("/api/ff/search", baseUrl);
    apiUrl.searchParams.append("s", query); // Veilig en automatisch geëncodeerd

    // new URL is minder foutgevoelig en zorgt ervoor dat de string correct wordt geparsed naar een geldige URL

    const response = await fetch(apiUrl);
    // console.log(response, "response");
    const data = await response.json();
    // console.log(data, "data");

    res.json({ results: data });
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ error: "Search error" });
  }
});
