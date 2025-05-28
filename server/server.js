import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));

// stuur de info naar de index pagina
app.get('/', async (req, res) => {
  // haal de api op om mee te sturen
  const yearUrl = `https://archive.framerframed.nl/api/get-years`;
  const responseYear = await fetch(yearUrl);
  const jsonYear = await responseYear.json();

  return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', years: jsonYear.nodes }));
});

// als er op de knop gedrukt word van een jaar
app.get('/year/:year', async (req, res) => {
  // het jaar word meegegeven
  console.log(req.params.year);
  const year = req.params.year;

  // roep de api op
  const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/143`;
  const response = await fetch(url);
  const json = await response.json();

  console.log(json.events[0].node)

  // laad de detailpagina voor de expos
  return res.send(renderTemplate('server/views/events.liquid', { title: 'Events', event: json.events, year: year}));
});

app.get('/event/:event', async (req, res) => {
  const uuid = req.params.event;

  try {
    // 1. Haal event data op
    const url = `https://archive.framerframed.nl/api/node-by-id/${uuid}`;
    const response = await fetch(url);
    const json = await response.json();

    const event = json.node;
    const assets = json.assets || [];

    // Hulpfunctie om relatie-type te bepalen (negeer assets)
    const isNotAsset = (rel) => {
      const type = rel.type || rel.type_en || rel.type_nl || '';
      return type.toLowerCase() !== 'asset';
    };

    const relations = (json.rels || []).filter(isNotAsset);

    // 2. Voor elke relatie haal je ook de relaties van die relatie op, exclusief assets
    const relationsWithSubs = await Promise.all(
      relations.map(async (rel) => {
        if (!rel.node?.uuid) return rel;

        try {
          const subUrl = `https://archive.framerframed.nl/api/node-by-id/${rel.node.uuid}`;
          const subResponse = await fetch(subUrl);
          const subJson = await subResponse.json();

          const filteredSubRels = (subJson.rels || []).filter(isNotAsset);

          return {
            ...rel,
            rels: filteredSubRels
          };
        } catch (error) {
          console.error(`Fout bij ophalen sub-relaties van ${rel.node.uuid}:`, error);
          return {
            ...rel,
            rels: []
          };
        }
      })
    );

    // 3. Render de detailpagina met gefilterde relaties en subrelaties
    return res.send(renderTemplate('server/views/detail.liquid', {
      title: event.title_nl || event.title_en || 'Event detail',
      event,
      assets,
      relations: relationsWithSubs
    }));

  } catch (error) {
    console.error("Fout bij ophalen event:", error);
    return res.status(500).send('Fout bij ophalen eventgegevens.');
  }
});




const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};

