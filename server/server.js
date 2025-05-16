import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const data = {
  'beemdkroon': {
    id: 'beemdkroon',
    name: 'Beemdkroon',
    image: {
      src: 'https://i.pinimg.com/736x/09/0a/9c/090a9c238e1c290bb580a4ebe265134d.jpg',
      alt: 'Beemdkroon',
      width: 695,
      height: 1080,
    }
  },
  'wilde-peen': {
    id: 'wilde-peen',
    name: 'Wilde Peen',
    image: {
      src: 'https://mens-en-gezondheid.infonu.nl/artikel-fotos/tom008/4251914036.jpg',
      alt: 'Wilde Peen',
      width: 418,
      height: 600,
    }
  }
}

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

function extractImages(htmlString) {
  const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/gi;
  const imgMatches = [];
  let match;

  // Verzamel alle <img> tags en hun src
  while ((match = imgRegex.exec(htmlString)) !== null) {
    imgMatches.push({
      tag: match[0],   // hele <img ...>
      src: match[1],   // alleen de src
    });
  }

  // Verwijder <img> tags uit de originele content
  const contentWithoutImages = htmlString.replace(imgRegex, '');

  return {
    content: contentWithoutImages.trim(),
    images: imgMatches.map(i => i.src),
  };
}

app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));

app.get('/', async (req, res) => {
  const allEvents = [];
  let year = 2022;
  const currentYear = new Date().getFullYear();

  function extractImages(htmlString) {
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/gi;
    const imgMatches = [];
    let match;

    while ((match = imgRegex.exec(htmlString)) !== null) {
      imgMatches.push({
        tag: match[0],
        src: match[1],
      });
    }

    const contentWithoutImages = htmlString.replace(imgRegex, '');
    return {
      content: contentWithoutImages.trim(),
      images: imgMatches.map(i => i.src),
    };
  }

  while (year <= currentYear) {
    const url = `https://archive.framerframed.nl/api/get-by-year/${year}/0/200`;
    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.events && json.events.length > 0) {
        console.log(`Data gevonden voor ${year}`);

        for (const event of json.events) {
          const htmlContent = event.node.content_en || '';
          const { content, images } = extractImages(htmlContent);
          event.node.cleaned_content = content;
          event.node.extracted_images = images;
        }

        allEvents.push(...json.events);
      } else {
        console.log(`Geen data voor ${year}`);
      }
    } catch (error) {
      console.error(`Fout bij ophalen van ${year}:`, error);
    }

    year++;
  }

  const html = await engine.renderFile('server/views/index.liquid', { allEvents });
  res.send(html);
});

// app.get('/', async (req, res) => {
//   return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', items: Object.values(data) }));
// });

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
