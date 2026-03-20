import fs from 'fs';
import path from 'path';

const files = [
  'src/components/admin/BajoPedidoCreateUnitForm.jsx',
  'src/pages/admin/BajoPedido.jsx',
  'src/components/catalog/CatalogCard.jsx',
  'src/pages/catalog/Catalog.jsx',
  'src/services/CatalogService.jsx',
  'src/components/catalog/FilterPanel.jsx'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const imports = lines.filter(line => line.match(/^import\s+/));
  console.log(`\n${file}:`);
  imports.forEach(imp => console.log(`  ${imp}`));
});
