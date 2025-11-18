import { Devvit } from '@devvit/public-api';
import path from 'path';
import { fileURLToPath } from 'url';
import './server/api';   // registers the API

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve the built React app
Devvit.addStaticFiles({
  path: path.resolve(__dirname, '../dist'),
  urlPrefix: '/static',
});

// Render the webview
Devvit.addCustomPostType({
  name: 'Jigsawdit',
  render: () => (
    <webview
      src="/static/index.html"
      width="100%"
      height="700px"
      allow="clipboard-write"
    />
  ),
});

export default Devvit;
