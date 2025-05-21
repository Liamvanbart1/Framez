import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const engine = new Liquid({
  extname: '.liquid',
});
`0`
const app = new App();

app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));

app.use(async (req, res, next) => {
  try {
    const response = await fetch('https://framerframed.nl/en/wp-json/wp/v2/pages?per_page=100');
    const pages = await response.json();

    // Alleen deze parent-ID's zijn toegestaan
    const allowedParentIds = [17087, 28309, 243];

    // Selecteer alleen gewenste parents
    const selectedParents = pages.filter(page => allowedParentIds.includes(page.id));

    // Selecteer alleen children die één van deze parents hebben
    const selectedChildren = pages.filter(page => allowedParentIds.includes(page.parent));

    // Combineer de geselecteerde parents met hun gekoppelde children
    const menu = selectedParents.map(parent => ({
      ...parent,
      children: selectedChildren.filter(child => child.parent === parent.id),
    }));

    // Verzamel uitgesloten ID’s (optioneel, voor logging/debugging)
    const usedIds = [...selectedParents.map(p => p.id), ...selectedChildren.map(c => c.id)];
    const excludedIds = pages
      .map(p => p.id)
      .filter(id => !usedIds.includes(id));

    console.log('Uitgesloten pagina-ID’s:', excludedIds);

    // Sla menu op in res.locals zodat alle routes het kunnen gebruiken
    res.locals.menu = menu;

    next(); // Ga door naar de volgende middleware of route
  } catch (err) {
    console.error('Fout bij ophalen van menu:', err);
    res.locals.menu = [];
    next();
  }
});

app.get('/', async (req, res) => {
  const html = await renderTemplate('server/views/index.liquid', {title: 'Home'}, res);
  res.send(html);
});

const renderTemplate = async (template, data = {}, res = null) => {
  //menu toevoegen aan de data
  if (res && res.locals.menu) {
    data.menu = res.locals.menu;
  }
  return await engine.renderFile(template, data);
};
