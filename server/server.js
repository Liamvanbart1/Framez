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
    const includedPageIds = [
      //page-id's
    ];

    const response = await fetch('https://framerframed.nl/en/wp-json/wp/v2/pages?per_page=100');
    const allPages = await response.json();

    //pagina's in includedPageIds laten zien
    const visiblePages = allPages.filter(page => includedPageIds.includes(page.id));

    // Child en parent pages definiëren
    const mainPages = visiblePages.filter(page => page.parent === 0);
    const subPages = visiblePages.filter(page => page.parent !== 0);

    // Children aan parent toevoegen
    const menu = mainPages.map(parent => ({
      ...parent,
      children: subPages.filter(child => child.parent === parent.id),
    }));

    // menu op alle views
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
  if (res && res.locals.menu) {
    data.menu = res.locals.menu;
  }
  return await engine.renderFile(template, data);
};
