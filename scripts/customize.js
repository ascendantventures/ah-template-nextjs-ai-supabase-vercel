#!/usr/bin/env node
/**
 * Angel Agents customization script
 * Usage: node scripts/customize.js --manifest='{"name":"My App","description":"...", "primaryColor":"#E86F2C"}'
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const manifestArg = args.find(a => a.startsWith('--manifest='));
if (!manifestArg) {
  console.error('Missing --manifest');
  process.exit(1);
}

const manifest = JSON.parse(manifestArg.replace('--manifest=', ''));
const {
  name,
  description = '',
  primaryColor = '#000000',
  supabaseUrl = '',
  supabaseAnonKey = '',
  aiProvider = 'anthropic',
  aiModel = 'claude-3-5-haiku-20241022',
} = manifest;

// Token replacement map
const tokens = {
  '__PROJECT_NAME__': name,
  '__PROJECT_DESCRIPTION__': description,
  '__PRIMARY_COLOR__': primaryColor,
  '__AI_PROVIDER__': aiProvider,
  '__AI_MODEL__': aiModel,
};

// Files to process
const targets = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/chat/page.tsx',
  'package.json',
  'README.md',
];

targets.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  Object.entries(tokens).forEach(([token, value]) => {
    content = content.replaceAll(token, value);
  });
  fs.writeFileSync(filePath, content);
  console.log(`✓ ${file}`);
});

// Generate .env.local
const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=${aiProvider}
AI_MODEL=${aiModel}
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
`;
fs.writeFileSync('.env.local', envContent);
console.log('✓ .env.local generated');

// Update package.json name
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.name = name.toLowerCase().replace(/\s+/g, '-');
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✓ package.json name updated');

console.log(`\n✅ Customized for: ${name}`);
