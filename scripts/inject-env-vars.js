import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log('🔧 Injecting environment variables into static HTML files...');

function injectEnvVars(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Replace hardcoded Supabase URL
  if (content.includes('https://eldvbqqgelifxkbyytip.supabase.co')) {
    content = content.replace(
      /const supabaseUrl = ['"]https:\/\/eldvbqqgelifxkbyytip\.supabase\.co['"];?/g,
      `const supabaseUrl = '${SUPABASE_URL}';`
    );
    modified = true;
  }

  // Replace hardcoded Supabase Anon Key (any JWT pattern)
  const jwtPattern = /const supabaseKey = ['"]eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+['"];?/g;
  if (jwtPattern.test(content)) {
    content = content.replace(
      jwtPattern,
      `const supabaseKey = '${SUPABASE_ANON_KEY}';`
    );
    modified = true;
  }

  // Replace placeholders
  if (content.includes('VITE_SUPABASE_URL_PLACEHOLDER')) {
    content = content.replace(/VITE_SUPABASE_URL_PLACEHOLDER/g, SUPABASE_URL);
    modified = true;
  }

  if (content.includes('VITE_SUPABASE_ANON_KEY_PLACEHOLDER')) {
    content = content.replace(/VITE_SUPABASE_ANON_KEY_PLACEHOLDER/g, SUPABASE_ANON_KEY);
    modified = true;
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// Process public/ directory
const publicDir = join(process.cwd(), 'public');
const publicFiles = readdirSync(publicDir).filter(f => f.endsWith('.html'));

let count = 0;
publicFiles.forEach(file => {
  const filePath = join(publicDir, file);
  if (injectEnvVars(filePath)) {
    console.log(`  ✅ ${file}`);
    count++;
  }
});

// Process dist/ directory if it exists
const distDir = join(process.cwd(), 'dist');
try {
  const distFiles = readdirSync(distDir).filter(f => f.endsWith('.html'));
  distFiles.forEach(file => {
    const filePath = join(distDir, file);
    if (injectEnvVars(filePath)) {
      console.log(`  ✅ dist/${file}`);
      count++;
    }
  });
} catch (err) {
  // dist doesn't exist yet, skip
}

console.log(`\n✅ Injected environment variables into ${count} files`);
