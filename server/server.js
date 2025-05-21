import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const data = {
  'Expo-1': {
    id: 'Expo-1',
    name: 'Expo-1',
    rels: [
      {
        id: '2',
        name: 'Artist-2'
      }
    ]
  },
  'Expo-2': {
    id: 'Expo-2',
    name: 'Expo-2',
    rels: [
      {
        id: '1',
        name: 'Artist-1'
      },
      {
        id: '2',
        name: 'Artist-2'
      }
    ]
  }
}

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));

app.get('/', async (req, res) => {
  return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', items: Object.values(data) }));
});

app.get('/plant/:id/', async (req, res) => {
  const id = req.params.id;
  const item = data[id];
  const rels = data[id]?.rels || [];

  if (!item) {
    return res.status(404).send('Not found');
  }
  return res.send(renderTemplate('server/views/detail.liquid', {
    title: `Detail page for ${id}`,
    item: item,
    rels: item,
    items: rels
  }));
});

const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};
