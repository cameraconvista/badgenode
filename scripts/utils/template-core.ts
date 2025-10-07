#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

export interface ComponentOptions {
  name: string;
  type: 'component' | 'hook' | 'page' | 'util';
  directory?: string;
}

export function parseArgs(): ComponentOptions | null {
  const args = process.argv.slice(2);
  const options: Partial<ComponentOptions> = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--name':
        options.name = value;
        break;
      case '--type':
        options.type = value as ComponentOptions['type'];
        break;
      case '--dir':
        options.directory = value;
        break;
    }
  }
  
  if (!options.name || !options.type) {
    return null;
  }
  
  return options as ComponentOptions;
}

export function generateComponentTemplate(name: string): string {
  return `import React from 'react';

interface ${name}Props {
  // Define your props here
  className?: string;
}

export function ${name}({ className }: ${name}Props) {
  return (
    <div className={className}>
      <h2>${name} Component</h2>
      <p>This is a generated component template.</p>
    </div>
  );
}

export default ${name};
`;
}

export function generateHookTemplate(name: string): string {
  const hookName = name.startsWith('use') ? name : `use${name}`;
  
  return `import { useState, useEffect } from 'react';

interface ${hookName}Options {
  // Define your options here
}

interface ${hookName}Return {
  // Define your return type here
  data: any;
  loading: boolean;
  error: string | null;
}

export function ${hookName}(options?: ${hookName}Options): ${hookName}Return {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Your hook logic here
    setLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      setData({ message: 'Hook is working!' });
      setLoading(false);
    }, 1000);
  }, []);
  
  return {
    data,
    loading,
    error
  };
}

export default ${hookName};
`;
}

export function generatePageTemplate(name: string): string {
  return `import React from 'react';

interface ${name}PageProps {
  // Define your page props here
}

export function ${name}Page({}: ${name}PageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ${name}
        </h1>
        <p className="text-gray-600 mt-2">
          This is a generated page template.
        </p>
      </header>
      
      <main>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Page content goes here...</p>
        </div>
      </main>
    </div>
  );
}

export default ${name}Page;
`;
}

export function generateUtilTemplate(name: string): string {
  return `/**
 * ${name} - Utility functions
 * Generated template - implement your utility functions here
 */

export interface ${name}Options {
  // Define your options interface here
}

/**
 * Main utility function
 */
export function ${name}(input: string, options?: ${name}Options): string {
  // Implement your utility logic here
  return input;
}

/**
 * Helper function example
 */
export function ${name}Helper(value: any): boolean {
  // Implement helper logic here
  return Boolean(value);
}

/**
 * Validation function example
 */
export function validate${name}(input: string): boolean {
  // Implement validation logic here
  return input.length > 0;
}

// Default export
export default {
  ${name},
  ${name}Helper,
  validate${name}
};
`;
}

export function getTargetPath(options: ComponentOptions): string {
  const { name, type, directory } = options;
  
  let basePath: string;
  let fileName: string;
  
  switch (type) {
    case 'component':
      basePath = directory ? `client/src/components/${directory}` : 'client/src/components';
      fileName = `${name}.tsx`;
      break;
      
    case 'hook':
      basePath = 'client/src/hooks';
      const hookName = name.startsWith('use') ? name : `use${name}`;
      fileName = `${hookName}.ts`;
      break;
      
    case 'page':
      basePath = directory ? `client/src/pages/${directory}` : 'client/src/pages';
      fileName = `${name}.tsx`;
      break;
      
    case 'util':
      basePath = 'client/src/lib';
      fileName = `${name}.ts`;
      break;
      
    default:
      throw new Error(`Unknown type: ${type}`);
  }
  
  return join(basePath, fileName);
}

export function generateTemplate(options: ComponentOptions): string {
  const { name, type } = options;
  
  switch (type) {
    case 'component':
      return generateComponentTemplate(name);
      
    case 'hook':
      return generateHookTemplate(name);
      
    case 'page':
      return generatePageTemplate(name);
      
    case 'util':
      return generateUtilTemplate(name);
      
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export function countLines(content: string): number {
  return content.split('\n').length;
}

export function createFile(filePath: string, content: string): void {
  // Create directory if it doesn't exist
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Check if file already exists
  if (existsSync(filePath)) {
    throw new Error(`File already exists: ${filePath}`);
  }
  
  // Write file
  writeFileSync(filePath, content);
}
