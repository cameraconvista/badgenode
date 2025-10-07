#!/usr/bin/env node

import {
  parseArgs,
  generateTemplate,
  getTargetPath,
  countLines,
  createFile,
  ComponentOptions
} from './utils/template-core';

function showUsage(): void {
  console.log(`
Usage:
  npm run gen:component -- --name <ComponentName> --type <type> [--dir <directory>]

Types:
  component  # React component
  hook       # Custom hook
  page       # Page component
  util       # Utility function

Examples:
  npm run gen:component -- --name UserCard --type component
  npm run gen:component -- --name useAuth --type hook
  npm run gen:component -- --name Dashboard --type page --dir admin
  npm run gen:component -- --name dateHelpers --type util
`);
}

function main(): void {
  const options = parseArgs();
  
  if (!options) {
    console.error('❌ Invalid arguments');
    showUsage();
    process.exit(1);
  }
  
  const { name, type } = options;
  
  console.log(`🚀 Generating ${type}: ${name}`);
  
  try {
    const template = generateTemplate(options);
    const targetPath = getTargetPath(options);
    const lines = countLines(template);
    
    // Check line count and warn if approaching limits
    if (lines > 200) {
      console.error(`❌ Generated template exceeds 200 lines (${lines})`);
      console.error('   Consider splitting into smaller components');
      process.exit(1);
    } else if (lines >= 150) {
      console.warn(`⚠️  Generated template is ${lines} lines (warning ≥150)`);
      console.warn('   Consider keeping it concise or plan for future splits');
    }
    
    createFile(targetPath, template);
    
    console.log(`✅ Created: ${targetPath}`);
    console.log(`📊 Lines: ${lines}`);
    
    // Provide usage suggestions
    console.log('');
    console.log('📝 Next steps:');
    console.log(`   1. Implement your ${type} logic`);
    console.log(`   2. Add proper TypeScript types`);
    console.log(`   3. Add tests if needed`);
    console.log(`   4. Import and use in your app`);
    
    if (lines >= 120) {
      console.log('');
      console.log('💡 Tips for keeping files small:');
      console.log('   - Extract complex logic into separate utilities');
      console.log('   - Split large components into smaller ones');
      console.log('   - Use composition over large monolithic components');
    }
    
  } catch (error) {
    console.error('❌ Error generating template:', error);
    process.exit(1);
  }
}

main();
