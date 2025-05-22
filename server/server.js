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
    // Pagina-ID's die je wilt uitsluiten uit het menu
    const excludedPageIds = [
      49503, 46253, 45363, 42363, 42391, 42441, 42429, 42387, 42339,
      39909, 35525, 34841, 26211, 25435, 25413, 25323, 24671, 24665,
      25247, 23687, 23247, 22171, 21397, 20873, 20769, 20743, 20247,
      19967, 18555, 18553, 18551, 18549, 17573, 16866, 17081, 16742,
      16735, 15249, 11491, 10877, 10865, 10859, 10851, 10735, 8563,
      8013, 5495, 5483, 5419, 3955, 2668, 1482, 378, 258
    ];

    const response = await fetch('https://framerframed.nl/en/wp-json/wp/v2/pages?per_page=100');
    const allPages = await response.json();

    // Filter 
    const visiblePages = allPages.filter(page => !excludedPageIds.includes(page.id));

    // schildren en parent pages definieren
    const mainPages = visiblePages.filter(page => page.parent === 0);
    const subPages = visiblePages.filter(page => page.parent !== 0);

    // children aan parent toevoegen
    const menu = mainPages.map(parent => ({
      ...parent,
      children: subPages.filter(child => child.parent === parent.id),
    }));

    // Zet menu beschikbaar voor alle views
    res.locals.menu = menu;
  } catch (err) {
    console.error('Fout bij ophalen van menu:', err);
    res.locals.menu = [];
  }

  next();
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
