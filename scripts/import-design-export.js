const fs = require('fs');
const path = require('path');

const [homeInput, tripInput, outputDir = 'placeholder'] = process.argv.slice(2);

if (!homeInput || !tripInput) {
  throw new Error('Usage: node scripts/import-design-export.js <home.html> <trip.html> [outputDir]');
}

const pages = [
  {
    input: homeInput,
    output: path.join(outputDir, 'index.html'),
    title: 'Trees to Trails',
  },
  {
    input: tripInput,
    output: path.join(outputDir, 'trip', 'index.html'),
    title: 'The Seven Sisters | Trees to Trails',
  },
];

function normalizePaths(markup) {
  return markup
    .replace(/Trees to Trails - Home\.dc\.html/g, '/')
    .replace(/Trees to Trails - Trip\.dc\.html/g, '/trip/')
    .replace(/([("(=])assets\//g, '$1/assets/');
}

function extractMountScript(html) {
  const match = html.match(/componentDidMount\(\) \{\n([\s\S]*?)\n  \}\n  componentWillUnmount/);

  if (!match) {
    return '';
  }

  return match[1]
    .replace(/const root = this\.el \|\| document;/g, 'const root = document;')
    .replace(/\n\s*this\._onScroll = onScroll;/g, '');
}

function convertExport({ input, output, title }) {
  const html = fs.readFileSync(input, 'utf8');
  const helmet = (html.match(/<helmet>\s*([\s\S]*?)\s*<\/helmet>/) || [])[1] || '';
  const body = html.match(/<\/helmet>\s*([\s\S]*?)<\/x-dc>/);

  if (!body) {
    throw new Error(`Could not extract placeholder body from ${input}`);
  }

  const markup = normalizePaths(body[1].replace(/<script[\s\S]*?<\/script>\s*$/g, '').trim());
  const mountScript = extractMountScript(html);
  const staticHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${helmet}
</head>
<body>
${markup}
<script>
document.addEventListener('DOMContentLoaded', () => {
${mountScript}
});
</script>
</body>
</html>
`;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, staticHtml);
}

pages.forEach(convertExport);
