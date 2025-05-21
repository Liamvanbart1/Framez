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
  // haal de api op om mee te sturen
  const yearUrl = `https://archive.framerframed.nl/api/get-years`;
  const responseYear = await fetch(yearUrl);
  const jsonYear = await responseYear.json();

  return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', years: jsonYear.nodes }));
});



// let year = 2005;
const currentYear = new Date().getFullYear();
// const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/6`;


// while (year <= currentYear) {
//   const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/6`;
//   let response = await fetch(url);
//   let json = await response.json();
//   // console.log(json.events[0]);
//   // console.log(json.events[0].node.title_en);
//   year++
// }

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
  return res.send(renderTemplate('server/views/detail.liquid', { title: 'Home', event: json.events }));


  // word teruggestuurd naar home
  // res.writeHead(303, { Location: '/' });
  // res.end();
});

app.get('/event/:event', async (req, res) => {
  console.log("waaaah")
  console.log(req.params.event);

});






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

