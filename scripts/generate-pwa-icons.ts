#!/usr/bin/env tsx
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Sorgente unica: client/public (stessa cartella usata da Vite per il build).
const PUBLIC_DIR = join(process.cwd(), 'client', 'public');
const ICONS_DIR = join(PUBLIC_DIR, 'icons');
const LOGO_PATH = join(PUBLIC_DIR, 'logo_home.png');

interface IconConfig {
  size: number;
  filename: string;
  purpose?: 'any' | 'maskable';
}

const ICON_CONFIGS: IconConfig[] = [
  { size: 192, filename: 'icon-192x192.png' },
  { size: 256, filename: 'icon-256x256.png' },
  { size: 384, filename: 'icon-384x384.png' },
  { size: 512, filename: 'icon-512x512.png' },
  { size: 180, filename: 'apple-touch-icon-180x180.png' }, // Apple
  { size: 512, filename: 'maskable-512x512.png', purpose: 'maskable' },
];

async function main() {
  console.log('🔍 Analyzing logo_home.png...');
  
  // 1. Verifica che logo_home.png esista
  if (!existsSync(LOGO_PATH)) {
    throw new Error('❌ logo_home.png not found in public/');
  }

  // 2. Analizza dimensioni
  const metadata = await sharp(LOGO_PATH).metadata();
  console.log(`📏 Original dimensions: ${metadata.width}x${metadata.height}`);
  
  // 3. Determina se serve una versione base
  let basePath = LOGO_PATH;
  const isSquare = metadata.width === metadata.height;
  const isLargeEnough = (metadata.width || 0) >= 512 && (metadata.height || 0) >= 512;
  
  if (!isSquare || !isLargeEnough) {
    console.log('🔧 Creating base version (1024x1024 with padding)...');
    basePath = join(PUBLIC_DIR, 'logo_home_base.png');
    
    // Crea versione 1024x1024 centrata con padding trasparente
    await sharp(LOGO_PATH)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(basePath);
    
    console.log('✅ Created logo_home_base.png (1024x1024)');
  } else {
    console.log('✅ Original logo is suitable (square and ≥512px)');
  }

  // 4. Crea cartella icons se non esiste
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
    console.log('📁 Created public/icons/ directory');
  }

  // 5. Genera tutte le varianti
  console.log('🎨 Generating icon variants...');
  
  for (const config of ICON_CONFIGS) {
    const outputPath = join(ICONS_DIR, config.filename);
    
    let pipeline = sharp(basePath).resize(config.size, config.size);
    
    // Per le icone maskable, aggiungi padding per safe zone
    if (config.purpose === 'maskable') {
      const safeZoneSize = Math.round(config.size * 0.8); // 20% padding
      pipeline = pipeline.resize(safeZoneSize, safeZoneSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }).extend({
        top: Math.round((config.size - safeZoneSize) / 2),
        bottom: Math.round((config.size - safeZoneSize) / 2),
        left: Math.round((config.size - safeZoneSize) / 2),
        right: Math.round((config.size - safeZoneSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }
    
    await pipeline.png().toFile(outputPath);
    console.log(`  ✅ ${config.filename} (${config.size}x${config.size})`);
  }

  // 6. Report finale
  console.log('\n📊 Generated icons:');
  for (const config of ICON_CONFIGS) {
    const stats = await sharp(join(ICONS_DIR, config.filename)).metadata();
    const size = Math.round((await sharp(join(ICONS_DIR, config.filename)).png().toBuffer()).length / 1024);
    console.log(`  • ${config.filename}: ${stats.width}x${stats.height} (${size}KB)${config.purpose ? ` [${config.purpose}]` : ''}`);
  }

  // Le icone sono gia' generate in client/public/icons (sorgente unica usata da Vite).
  console.log('\n🎉 PWA icons generation completed!');
}

main().catch(console.error);
