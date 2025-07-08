// merge-views.js

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, 'prisma', 'schema.prisma');
const viewsPath = join(__dirname, 'prisma', 'views.prisma');

// Leggi entrambi i file
const schemaContent = readFileSync(schemaPath, 'utf8');
const viewsContent = readFileSync(viewsPath, 'utf8');

// Rimuovi vecchie viste (opzionale, se aggiungi un marker)
const startMarker = '// START VIEWS';
const endMarker = '// END VIEWS';
const newSchema = schemaContent.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'gm'),
  ''
).trim() + `\n\n${startMarker}\n${viewsContent}\n${endMarker}\n`;

// Scrivi il risultato nel file schema.prisma
writeFileSync(schemaPath, newSchema, 'utf8');

console.log('✅ Viste aggiunte a schema.prisma');
