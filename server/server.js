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
  const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/6`;
  const response = await fetch(url);
  const json = await response.json();

  console.log(json.events[0].node)



  // laad de detailpagina voor de expos
  return res.send(renderTemplate('server/views/events.liquid', { title: 'Events', event: json.events, year: year}));
});

app.get('/event/:event', async (req, res) => {
  console.log("detailpagina event")
  console.log(req.params.event);

    return res.send(renderTemplate('server/views/detail.liquid', { title: 'detail'}));
});



const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};

