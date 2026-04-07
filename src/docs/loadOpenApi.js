const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadOpenApi() {
  const filePath = path.join(__dirname, 'openapi.yaml');
  const raw = fs.readFileSync(filePath, 'utf8');
  return yaml.load(raw);
}

module.exports = { loadOpenApi };
