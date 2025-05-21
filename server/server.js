import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

// const data = {
//   'beemdkroon': {
//     id: 'beemdkroon',
//     name: 'Beemdkroon',
//     image: {
//       src: 'https://i.pinimg.com/736x/09/0a/9c/090a9c238e1c290bb580a4ebe265134d.jpg',
//       alt: 'Beemdkroon',
//       width: 695,
//       height: 1080,
//     }
//   },
//   'wilde-peen': {
//     id: 'wilde-peen',
//     name: 'Wilde Peen',
//     image: {
//       src: 'https://mens-en-gezondheid.infonu.nl/artikel-fotos/tom008/4251914036.jpg',
//       alt: 'Wilde Peen',
//       width: 418,
//       height: 600,
//     }
//   }
// }

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
  return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', years: jsonYear.nodes }));
});

// list of years... kan handiger
const yearUrl = `https://archive.framerframed.nl/api/get-years`;
const responseYear = await fetch(yearUrl);
const jsonYear = await responseYear.json();

let year = 2005;
const currentYear = new Date().getFullYear();
// const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/6`;


while (year <= currentYear) {
  const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/6`;
  let response = await fetch(url);
  let json = await response.json();
  // console.log(json.events[0]);
  // console.log(json.events[0].node.title_en);
  year++
}


app.post('/popout-year', async (req, res) => {
  const message = req.body;
  // const user = req.body.user;

  if (message) {
    console.log("waaaah");
  }
});
    // console.log('[MESSAGE!!!]', message);
// app.get('/plant/:id/', async (req, res) => {
//   const id = req.params.id;
//   const item = data[id];
//   if (!item) {
//     return res.status(404).send('Not found');
//   }
//   return res.send(renderTemplate('server/views/detail.liquid', {
//     title: `Detail page for ${id}`,
//     item: item
//   }));
// });

const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};

